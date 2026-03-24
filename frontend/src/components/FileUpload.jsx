import { FileText, UploadCloud } from 'lucide-react';
import { useRef, useState } from 'react';
import { validateFile } from '../services/TextExtractor';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

export function FileUpload({ onUpload, loading = false }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');

  function handleFile(nextFile) {
    try {
      validateFile(nextFile);
      setFile(nextFile);
      setError('');
    } catch (validationError) {
      setFile(null);
      setError(validationError.message || 'Invalid file.');
    }
  }

  function handleDrop(event) {
    event.preventDefault();
    setDragging(false);
    const nextFile = event.dataTransfer.files?.[0];
    if (nextFile) {
      handleFile(nextFile);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!file) {
      setError('Choose a file first.');
      return;
    }

    setError('');
    await onUpload(file);
  }

  return (
    <Card hover={false} className="rounded-[34px] sm:p-8">
      <form onSubmit={handleSubmit}>
        <div className="mb-5 text-center">
          <div className="mx-auto mb-4 inline-flex rounded-full border border-violet-300/20 bg-violet-500/10 px-4 py-2 text-sm text-violet-100 shadow-glow">
            <UploadCloud className="mr-2 h-4 w-4" />
            Document Learning
          </div>
          <h2 className="text-3xl font-semibold text-white">Upload notes and learn instantly</h2>
          <p className="mt-3 text-sm leading-7 text-slate-400">Drop a PDF, DOCX, or TXT file. NeuroVerse will analyze the full document, extract every important topic, and turn it into a study guide with a 5-question quiz.</p>
        </div>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`group flex min-h-56 w-full flex-col items-center justify-center rounded-[30px] border border-dashed px-6 py-10 text-center transition duration-300 ${
            dragging ? 'border-cyan-300/60 bg-cyan-400/10 shadow-neon' : 'border-white/15 bg-slate-950/40 hover:border-violet-300/45 hover:shadow-neon'
          }`}
        >
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-cyan-200 transition group-hover:scale-105 group-hover:shadow-glow">
            <UploadCloud className="h-8 w-8" />
          </div>
          <p className="mt-5 text-lg font-medium text-white">Drag & drop your file here</p>
          <p className="mt-2 text-sm text-slate-400">or click to browse supported files up to 5MB</p>
          <p className="mt-4 text-xs uppercase tracking-[0.35em] text-slate-500">PDF DOCX TXT</p>
        </button>

        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.txt"
          className="hidden"
          onChange={(event) => handleFile(event.target.files?.[0])}
        />

        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/10 bg-black/20 px-4 py-4">
          <div className="flex items-center gap-3 text-sm text-slate-300">
            <FileText className="h-4 w-4 text-cyan-200" />
            {file ? file.name : 'No file selected yet'}
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? 'Analyzing your document...' : 'Upload & Learn'}
          </Button>
        </div>

        {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}
      </form>
    </Card>
  );
}
