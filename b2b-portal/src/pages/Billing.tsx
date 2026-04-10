import PortalLayout from '../components/layout/PortalLayout';
import { Check } from 'lucide-react';
import clsx from 'clsx';

const TIERS = [
   { name: 'Free', price: '₹0', calls: '5K / day', desc: 'For testing and hackathons', current: false },
   { name: 'Premium', price: '₹2,499', calls: '50K / day', desc: 'For early startups', current: true },
   { name: 'Pro', price: '₹9,999', calls: '300K / day', desc: 'For scaling platforms', current: false, highlight: true },
   { name: 'Unlimited', price: 'Custom', calls: 'Unlimited', desc: 'For enterprise needs', current: false },
];

export default function Billing() {
   return (
      <PortalLayout>
         <div className="mb-10 text-center max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-white tracking-tight mb-3">Subscription Plans</h1>
            <p className="text-slate-400">Upgrade your tier to unlock higher daily rate limits, faster cache responses, and premium email support.</p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TIERS.map((tier) => (
               <div key={tier.name} className={clsx(
                  "relative bg-surface-950 border rounded-2xl p-6 flex flex-col",
                  tier.highlight ? "border-brand-500 shadow-xl shadow-brand-500/10" : "border-surface-800",
                  tier.current && "bg-surface-900 border-slate-700"
               )}>
                  {tier.highlight && (
                     <div className="absolute top-0 inset-x-0 transform -translate-y-1/2 flex justify-center">
                        <span className="bg-brand-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">Recommended</span>
                     </div>
                  )}
                  {tier.current && (
                     <div className="absolute top-4 right-4 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" title="Current Plan"></span>
                     </div>
                  )}
                  
                  <h3 className="text-lg font-semibold text-white mb-2">{tier.name}</h3>
                  <div className="flex items-baseline gap-1 mb-2">
                     <span className="text-3xl font-bold text-white tracking-tight">{tier.price}</span>
                     {tier.name !== 'Unlimited' && <span className="text-sm text-slate-500">/mo</span>}
                  </div>
                  <p className="text-sm text-slate-400 mb-6 flex-1">{tier.desc}</p>
                  
                  <ul className="space-y-3 mb-8">
                     <li className="flex items-center text-sm text-slate-300">
                        <Check className="w-5 h-5 text-brand-400 mr-2 flex-shrink-0" />
                        <span className="font-medium text-white">{tier.calls} limits</span>
                     </li>
                     <li className="flex items-center text-sm text-slate-300">
                        <Check className="w-5 h-5 text-brand-400 mr-2 flex-shrink-0" />
                        State Access Validation
                     </li>
                     <li className={clsx("flex items-center text-sm", ['Pro', 'Unlimited'].includes(tier.name) ? "text-slate-300" : "text-slate-600")}>
                        <Check className={clsx("w-5 h-5 mr-2 flex-shrink-0", ['Pro', 'Unlimited'].includes(tier.name) ? "text-brand-400" : "text-slate-700")} />
                        99.9% SLA Guarantee
                     </li>
                  </ul>

                  <button 
                     disabled={tier.current}
                     className={clsx(
                        "w-full py-2.5 rounded-lg text-sm font-bold transition-all",
                        tier.current ? "bg-surface-800 text-slate-500 cursor-not-allowed" : 
                        tier.highlight ? "bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-500/25" : 
                        "bg-white text-surface-950 hover:bg-slate-200"
                     )}
                  >
                     {tier.current ? 'Current Plan' : 'Upgrade'}
                  </button>
               </div>
            ))}
         </div>
      </PortalLayout>
   );
}
