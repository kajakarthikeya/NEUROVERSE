import { motion } from 'framer-motion';
import { BrainCircuit } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

function GoogleGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path fill="#4285F4" d="M21.6 12.23c0-.68-.06-1.34-.18-1.98H12v3.75h5.39a4.61 4.61 0 0 1-2 3.03v2.52h3.24c1.89-1.74 2.97-4.31 2.97-7.32Z" />
      <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.61-2.45l-3.24-2.52c-.9.6-2.05.96-3.37.96-2.59 0-4.78-1.75-5.56-4.1H3.1v2.6A9.99 9.99 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6.44 13.89A5.98 5.98 0 0 1 6.13 12c0-.66.11-1.3.31-1.89V7.51H3.1A10 10 0 0 0 2 12c0 1.61.39 3.14 1.1 4.49l3.34-2.6Z" />
      <path fill="#EA4335" d="M12 6.01c1.47 0 2.79.51 3.83 1.5l2.87-2.87C16.95 2.99 14.69 2 12 2A9.99 9.99 0 0 0 3.1 7.51l3.34 2.6c.78-2.35 2.97-4.1 5.56-4.1Z" />
    </svg>
  );
}

export function AuthPage() {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('learner@neuroverse.ai');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login, signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await signup(email, password);
      }
      navigate('/dashboard');
    } catch (submitError) {
      setError(submitError.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    setError('');

    try {
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (submitError) {
      setError(submitError.message || 'Google sign-in failed.');
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <main className="page-shell flex min-h-screen items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid w-full max-w-6xl overflow-hidden rounded-[36px] border border-white/10 bg-white/5 shadow-glass backdrop-blur-xl lg:grid-cols-[1.1fr_0.9fr]"
      >
        <div className="relative hidden min-h-[720px] overflow-hidden p-10 lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_rgba(56,189,248,0.16),_transparent_24%),radial-gradient(circle_at_80%_30%,_rgba(139,92,246,0.22),_transparent_28%)]" />
          <div className="relative flex h-full flex-col justify-between">
            <div>
              <div className="inline-flex rounded-3xl border border-cyan-300/15 bg-white/10 p-4 text-cyan-200 shadow-glow">
                <BrainCircuit className="h-10 w-10" />
              </div>
              <h1 className="mt-8 max-w-md text-4xl font-semibold text-white">Your portal into immersive education.</h1>
              <p className="mt-5 max-w-lg text-lg leading-8 text-slate-300">
                Sign in to explore living 3D lessons, collaborate with AI tutors, and turn every session into measurable progress.
              </p>
            </div>

            <div className="grid gap-4">
              {['AI-powered tutoring', 'VR-ready immersive lessons', 'XP, levels, badges, and saved study paths'].map((item) => (
                <Card key={item} className="bg-black/10 p-5" hover={false}>
                  {item}
                </Card>
              ))}
            </div>
          </div>
        </div>

        <div className="p-8 sm:p-12">
          <div className="mb-8 flex rounded-full border border-white/10 bg-slate-950/60 p-1">
            {['login', 'signup'].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setMode(item)}
                className={`flex-1 rounded-full px-4 py-3 text-sm font-medium capitalize transition ${
                  mode === item ? 'bg-gradient-to-r from-cyan-300 to-violet-500 text-slate-950 shadow-neon' : 'text-slate-400'
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <h2 className="text-3xl font-semibold text-white">{mode === 'login' ? 'Welcome back' : 'Create account'}</h2>
          <p className="mt-2 text-slate-400">Use email/password or continue instantly with Google.</p>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white px-4 py-4 text-sm font-medium text-slate-900 transition duration-300 hover:scale-[1.01] hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <GoogleGlyph />
            {googleLoading ? 'Connecting to Google...' : 'Continue with Google'}
          </button>

          <div className="my-6 flex items-center gap-4 text-xs uppercase tracking-[0.35em] text-slate-500">
            <div className="h-px flex-1 bg-white/10" />
            or
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-400">Email</span>
              <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-slate-400">Password</span>
              <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
            </label>

            {error ? <p className="text-sm text-rose-300">{error}</p> : null}

            <Button type="submit" className="w-full justify-center" disabled={loading || googleLoading}>
              {loading ? 'Entering...' : mode === 'login' ? 'Login to Continue' : 'Create NeuroVerse Account'}
            </Button>
          </form>
        </div>
      </motion.div>
    </main>
  );
}
