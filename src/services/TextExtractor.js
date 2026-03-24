import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

const SUPPORTED_EXTENSIONS = ['pdf', 'docx', 'txt'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

function getFileExtension(fileName = '') {
  return fileName.split('.').pop()?.toLowerCase() || '';
}

function cleanExtractedText(text = '') {
  return text
    .replace(/\r/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/[ ]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .split('\n')
    .map((line) => line.trim())
    .join('\n')
    .replace(/[ ]{2,}/g, ' ')
    .trim();
}

async function extractPdfText(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pages = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item) => item.str).join(' ');
    pages.push(pageText);
  }

  return cleanExtractedText(pages.join('\n'));
}

async function extractDocxText(file) {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return cleanExtractedText(result.value);
}

async function extractTxtText(file) {
  const rawText = await file.text();
  return cleanExtractedText(rawText);
}

export function validateFile(file) {
  if (!file) {
    throw new Error('Choose a file first.');
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File is too large. Please upload a file under 5MB.');
  }

  const extension = getFileExtension(file.name);
  if (!SUPPORTED_EXTENSIONS.includes(extension)) {
    throw new Error('Unsupported file type. Please upload a PDF, DOCX, or TXT file.');
  }

  return extension;
}

export async function extractTextFromFile(file) {
  const extension = validateFile(file);

  if (extension === 'pdf') {
    return extractPdfText(file);
  }

  if (extension === 'docx') {
    return extractDocxText(file);
  }

  return extractTxtText(file);
}
