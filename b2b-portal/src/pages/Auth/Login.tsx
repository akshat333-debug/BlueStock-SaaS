import { Link } from 'react-router-dom';
import { TerminalSquare } from 'lucide-react';

export default function Login() {
  return (
    <div className="min-h-screen bg-surface-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center h-12 items-center mb-6">
          <TerminalSquare className="w-10 h-10 text-brand-500" />
          <span className="ml-3 font-bold text-3xl text-white tracking-tight">Bluestock<span className="text-brand-500">API</span></span>
        </div>
        <h2 className="mt-2 text-center text-2xl font-bold leading-9 tracking-tight text-white">
          Sign in to your dashboard
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-[420px] relative z-10">
        <div className="bg-surface-900 border border-surface-800 py-10 px-4 shadow-2xl sm:rounded-2xl sm:px-10">
          <form className="space-y-6" action="/dashboard">
            <div>
              <label htmlFor="email" className="block text-sm font-medium leading-6 text-slate-300">
                Work Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full rounded-lg border-0 bg-surface-950 py-2.5 px-3 text-white shadow-sm ring-1 ring-inset ring-surface-700 placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-brand-500 sm:text-sm sm:leading-6 transition-all"
                  placeholder="you@company.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium leading-6 text-slate-300">
                  Password
                </label>
                <div className="text-sm">
                  <a href="#" className="font-semibold text-brand-400 hover:text-brand-300 transition-colors">
                    Forgot password?
                  </a>
                </div>
              </div>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="block w-full rounded-lg border-0 bg-surface-950 py-2.5 px-3 text-white shadow-sm ring-1 ring-inset ring-surface-700 placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-brand-500 sm:text-sm sm:leading-6 transition-all"
                />
              </div>
            </div>

            <div>
              <Link to="/dashboard" className="flex w-full justify-center rounded-lg bg-white px-3 py-2.5 text-sm font-bold text-surface-950 shadow-sm hover:bg-slate-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-all">
                Sign in &rarr;
              </Link>
            </div>
          </form>

          <p className="mt-8 text-center text-sm text-slate-400">
            Not a client yet?{' '}
            <Link to="/register" className="font-semibold leading-6 text-brand-400 hover:text-brand-300 transition-colors">
              Request API Access
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
