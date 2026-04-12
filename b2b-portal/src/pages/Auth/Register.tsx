import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TerminalSquare } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '', businessName: '', gstNumber: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          businessName: form.businessName,
          gstNumber: form.gstNumber || undefined,
          phone: form.phone || undefined,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || 'Registration failed.');
      } else {
        // Set pending status and navigate
        localStorage.setItem('user_status', 'PENDING_APPROVAL');
        alert('Registration successful! Your account is pending admin approval.');
        navigate('/login');
      }
    } catch {
      setError('Network error. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center h-12 items-center mb-6">
          <TerminalSquare className="w-10 h-10 text-brand-500" />
          <span className="ml-3 font-bold text-3xl text-white tracking-tight">Bluestock<span className="text-brand-500">API</span></span>
        </div>
        <h2 className="mt-2 text-center text-2xl font-bold leading-9 tracking-tight text-white">
          Request API Access
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">Register your business for B2B API access.</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-[480px] relative z-10">
        <div className="bg-surface-900 border border-surface-800 py-10 px-4 shadow-2xl sm:rounded-2xl sm:px-10">
          {error && (
            <div className="mb-6 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-sm text-rose-400">{error}</div>
          )}
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-slate-300">Business Email *</label>
              <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="you@company.com" className="mt-1 block w-full rounded-lg border-0 bg-surface-950 py-2.5 px-3 text-white ring-1 ring-inset ring-surface-700 placeholder:text-slate-500 focus:ring-2 focus:ring-brand-500 sm:text-sm transition-all" />
              <p className="mt-1 text-xs text-slate-500">Free email providers (Gmail, Yahoo, etc.) are not accepted.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300">Registered Business Name *</label>
              <input type="text" required value={form.businessName} onChange={e => setForm({...form, businessName: e.target.value})} className="mt-1 block w-full rounded-lg border-0 bg-surface-950 py-2.5 px-3 text-white ring-1 ring-inset ring-surface-700 placeholder:text-slate-500 focus:ring-2 focus:ring-brand-500 sm:text-sm transition-all" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300">GST Number</label>
                <input type="text" value={form.gstNumber} onChange={e => setForm({...form, gstNumber: e.target.value})} placeholder="Optional" className="mt-1 block w-full rounded-lg border-0 bg-surface-950 py-2.5 px-3 text-white ring-1 ring-inset ring-surface-700 placeholder:text-slate-500 focus:ring-2 focus:ring-brand-500 sm:text-sm transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300">Phone Number</label>
                <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+91 XXXXXXXXXX" className="mt-1 block w-full rounded-lg border-0 bg-surface-950 py-2.5 px-3 text-white ring-1 ring-inset ring-surface-700 placeholder:text-slate-500 focus:ring-2 focus:ring-brand-500 sm:text-sm transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300">Password *</label>
              <input type="password" required value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="mt-1 block w-full rounded-lg border-0 bg-surface-950 py-2.5 px-3 text-white ring-1 ring-inset ring-surface-700 placeholder:text-slate-500 focus:ring-2 focus:ring-brand-500 sm:text-sm transition-all" />
              <p className="mt-1 text-xs text-slate-500">Minimum 8 characters with complexity.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300">Confirm Password *</label>
              <input type="password" required value={form.confirmPassword} onChange={e => setForm({...form, confirmPassword: e.target.value})} className="mt-1 block w-full rounded-lg border-0 bg-surface-950 py-2.5 px-3 text-white ring-1 ring-inset ring-surface-700 placeholder:text-slate-500 focus:ring-2 focus:ring-brand-500 sm:text-sm transition-all" />
            </div>
            <button type="submit" disabled={loading} className="flex w-full justify-center rounded-lg bg-white px-3 py-2.5 text-sm font-bold text-surface-950 shadow-sm hover:bg-slate-200 disabled:opacity-50 transition-all">
              {loading ? 'Registering...' : 'Request Access →'}
            </button>
          </form>
          <p className="mt-8 text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand-400 hover:text-brand-300 transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
