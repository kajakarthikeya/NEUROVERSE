import { motion } from 'framer-motion';
import { Bot, SendHorizonal, BrainCircuit } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { askAssistant } from '../../services/ai';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

export function AIChatPanel({ topic }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    setMessages([
      {
        id: `intro-${topic || 'general'}`,
        role: 'assistant',
        text: topic
          ? `I am your NeuroVerse guide for ${topic}. Ask for simpler explanations, analogies, or exam-style help.`
          : 'Choose a topic first, then ask me anything about it.',
      },
    ]);
  }, [topic]);

  useEffect(() => {
    function handleExplain(e) {
      if (e.detail?.prompt) {
        setInput(e.detail.prompt);
        const inputEl = document.getElementById('chat-prompt-input');
        if (inputEl) {
          inputEl.focus();
        }
      }
    }
    window.addEventListener('neuroverse:explain', handleExplain);
    return () => window.removeEventListener('neuroverse:explain', handleExplain);
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!input.trim() || !topic) return;

    const userMessage = { id: `${Date.now()}-user`, role: 'user', text: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await askAssistant(userMessage.text, { topic });
      setMessages((prev) => [...prev, { id: `${Date.now()}-ai`, role: 'assistant', text: response.reply }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-error`,
          role: 'assistant',
          text: error.message || 'The assistant is offline right now. Please try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="flex flex-col h-[600px] border border-white/5 bg-slate-900/40 p-0 overflow-hidden" hover={false}>
      {/* Header */}
      <div className="flex items-center gap-3 bg-white/5 border-b border-white/10 p-5 backdrop-blur-md z-10">
        <div className="flex items-center justify-center h-10 w-10 rounded-xl border border-cyan-300/15 bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-cyan-200 shadow-[0_0_15px_rgba(56,189,248,0.2)]">
          <BrainCircuit className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">NeuroAI Tutor</h3>
          <p className="text-xs text-slate-400 font-medium tracking-wide uppercase">Always active</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 scroll-smooth custom-scrollbar">
        {messages.map((message) => {
          const isUser = message.role === 'user';
          return (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[85%] rounded-2xl px-5 py-3.5 text-[15px] leading-relaxed relative ${
                  isUser
                    ? 'bg-blue-600 text-white rounded-tr-sm shadow-[0_4px_24px_rgba(37,99,235,0.25)]'
                    : 'bg-white/10 text-slate-200 border border-white/10 backdrop-blur-md rounded-tl-sm shadow-glass'
                }`}
              >
                {!isUser && (
                  <Bot className="absolute -left-10 top-0 h-6 w-6 text-cyan-400 opacity-60" />
                )}
                {message.text}
              </div>
            </motion.div>
          );
        })}

        {loading && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="flex w-full justify-start"
          >
            <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white/5 border border-white/10 px-5 py-3.5 text-[15px] text-cyan-200 shadow-glass flex items-center gap-2 backdrop-blur-md relative">
              <Bot className="absolute -left-10 top-0 h-6 w-6 text-cyan-400 opacity-60" />
              <span className="font-medium text-sm">NeuroAI is thinking</span>
              <span className="flex gap-1 ml-1">
                <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.4, delay: 0 }} className="h-1.5 w-1.5 bg-cyan-400 rounded-full" />
                <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.4, delay: 0.2 }} className="h-1.5 w-1.5 bg-cyan-400 rounded-full" />
                <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.4, delay: 0.4 }} className="h-1.5 w-1.5 bg-cyan-400 rounded-full" />
              </span>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} className="h-2" />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white/[0.02] border-t border-white/10">
        <form className="relative flex items-center" onSubmit={handleSubmit}>
          <Input
            id="chat-prompt-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={topic ? `Message NeuroAI about ${topic}...` : 'Generate a topic first...'}
            disabled={!topic || loading}
            className="w-full pl-5 pr-14 py-4 rounded-full bg-black/40 border-white/10 focus:border-cyan-500/50 text-[15px]"
          />
          <button 
            type="submit" 
            disabled={!topic || loading || !input.trim()}
            className="absolute right-2 flex items-center justify-center p-2 rounded-full bg-blue-600 text-white hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:bg-white/10 disabled:text-slate-500"
          >
            <SendHorizonal className="h-5 w-5 pointer-events-none" />
          </button>
        </form>
        <div className="text-center mt-3">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">NeuroVerse AI can make mistakes. Verify important info.</p>
        </div>
      </div>
    </Card>
  );
}
