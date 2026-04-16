import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getApiKeys, createApiKey } from '../services/api';
import PortalLayout from '../components/layout/PortalLayout';
import { Key, Copy, Check, Plus, AlertTriangle, Trash2, RefreshCw } from 'lucide-react';
import clsx from 'clsx';

export default function ApiKeys() {
   const queryClient = useQueryClient();
   const [copiedId, setCopiedId] = useState<number | string | null>(null);
   const [showNewKeyModal, setShowNewKeyModal] = useState(false);
   const [newKeyName, setNewKeyName] = useState('');
   const [revealedSecret, setRevealedSecret] = useState<string | null>(null);

   // Mocking the PENDING_APPROVAL status from the mocked DB logic
   const isPendingApproval = localStorage.getItem('user_status') === 'PENDING_APPROVAL';

   const { data: keys, isLoading } = useQuery({
      queryKey: ['keys'],
      queryFn: getApiKeys
   });

   const createMutation = useMutation({
      mutationFn: createApiKey,
      onSuccess: (data) => {
         // Add new key to cache
         queryClient.setQueryData(['keys'], (old: any) => [data, ...old]);
         setRevealedSecret(data.secret);
      }
   });

   const handleCopy = (text: string, id: number | string) => {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
   };

   const handleCreate = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newKeyName.trim()) return;
      createMutation.mutate(newKeyName);
   };

   return (
      <PortalLayout>
         <div className="flex items-center justify-between mb-8">
            <div>
               <h1 className="text-2xl font-bold text-white tracking-tight">API Keys</h1>
               <p className="mt-1 text-sm text-slate-400">Manage your secret keys for accessing the Village API.</p>
            </div>
            <button 
               onClick={() => { setShowNewKeyModal(true); setRevealedSecret(null); setNewKeyName(''); }}
               disabled={isPendingApproval}
               className={clsx(
                  "flex items-center gap-2 px-4 py-2 rounded-lg font-medium shadow-lg transition-colors",
                  isPendingApproval 
                    ? "bg-surface-800 text-slate-500 cursor-not-allowed shadow-none" 
                    : "bg-brand-600 hover:bg-brand-500 text-white shadow-brand-500/20"
               )}
            >
               <Plus className="w-4 h-4" /> Create Key
            </button>
         </div>

         {isPendingApproval && (
            <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-xl mb-8 flex flex-col items-center justify-center text-center">
               <AlertTriangle className="w-8 h-8 text-amber-500 mb-3" />
               <h3 className="text-lg font-semibold text-amber-500 mb-1">Account Pending Approval</h3>
               <p className="text-sm text-surface-400 max-w-lg">
                  Your B2B account registration is currently under review by our administration team. 
                  You will not be able to generate API keys or access live data until your business entity is verified. 
                  This usually takes 1-2 business days.
               </p>
               <button 
                  onClick={() => localStorage.removeItem('user_status')}
                  className="mt-4 text-xs text-slate-500 underline"
               >
                 [Demo] Mock Admin Approval bypass
               </button>
            </div>
         )}

         <div className="bg-surface-950 border border-surface-800 rounded-xl overflow-hidden shadow-sm">
            {/* Warning Banner */}
            <div className="bg-brand-500/10 border-b border-brand-500/20 p-4 flex gap-3 items-start">
               <AlertTriangle className="w-5 h-5 text-brand-400 flex-shrink-0 mt-0.5" />
               <p className="text-sm text-brand-200/80">
                  Do not share your API keys in publicly accessible areas such as GitHub, client-side code, and so forth. 
                  All API keys should be handled securely on your server backend.
               </p>
            </div>

            {isLoading ? (
               <div className="p-8 text-center text-slate-500">Loading keys...</div>
            ) : (
               <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-surface-800">
                     <thead className="bg-surface-900/50">
                        <tr>
                           <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Name</th>
                           <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Public Key</th>
                           <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Created</th>
                           <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Last Used</th>
                           <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                           <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-surface-800 bg-surface-950">
                        {keys?.map((k: any) => (
                           <tr key={k.id} className="hover:bg-surface-800/30 transition-colors group">
                              <td className="whitespace-nowrap px-6 py-4">
                                 <div className="flex items-center gap-3">
                                    <Key className="w-4 h-4 text-slate-500" />
                                    <span className="text-sm font-medium text-slate-200">{k.name}</span>
                                 </div>
                              </td>
                              <td className="whitespace-nowrap px-6 py-4">
                                 <code className="px-2 py-1 bg-surface-900 border border-surface-800 rounded font-mono text-xs text-brand-300">
                                    {k.key}
                                 </code>
                              </td>
                              <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-400">{k.createdAt}</td>
                              <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-400">{k.lastUsedAt}</td>
                              <td className="whitespace-nowrap px-6 py-4 text-right">
                                 <span className={clsx("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", k.isActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-800 text-slate-400 border-slate-700')}>
                                    {k.isActive ? 'Active' : 'Disabled'}
                                 </span>
                              </td>
                              <td className="whitespace-nowrap px-6 py-4 text-right">
                                 <div className="flex justify-end gap-2">
                                    {k.isActive && (
                                       <>
                                          <button onClick={() => { if(confirm('Regenerate secret? The old one will be invalidated.')) { fetch(`/api/v1/keys/${k.id}/regenerate`, {method:'POST'}).then(r=>r.json()).then(d=>{if(d.success) alert('New secret: ' + d.data.secret); queryClient.invalidateQueries({queryKey:['keys']}); }) } }} className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 bg-brand-500/10 px-2 py-1 rounded border border-brand-500/20" title="Regenerate Secret">
                                             <RefreshCw className="w-3 h-3" />
                                             <span className="sr-only sm:not-sr-only">Regenerate</span>
                                          </button>
                                          <button onClick={() => { if(confirm('Revoke this key? It will be deactivated immediately.')) { fetch(`/api/v1/keys/${k.id}/revoke`, {method:'PATCH'}).then(()=> queryClient.invalidateQueries({queryKey:['keys']})) } }} className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 px-2 py-1 rounded border border-rose-500/20" title="Revoke Key">
                                             <Trash2 className="w-3 h-3" />
                                             <span className="sr-only sm:not-sr-only">Revoke</span>
                                          </button>
                                       </>
                                    )}
                                 </div>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            )}
         </div>

         {/* Generate Key Modal */}
         {showNewKeyModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
               <div className="fixed inset-0 bg-surface-950/80 backdrop-blur-sm" onClick={() => !revealedSecret && setShowNewKeyModal(false)}></div>
               
               <div className="bg-surface-900 border border-surface-700 rounded-2xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden transform transition-all">
                  {!revealedSecret ? (
                     <form onSubmit={handleCreate}>
                        <div className="p-6">
                           <h3 className="text-lg font-bold text-white mb-1">Create API Key</h3>
                           <p className="text-sm text-slate-400 mb-6">Create a new key to authenticate requests from your application.</p>
                           
                           <div>
                              <label className="block text-sm font-medium text-slate-300 mb-2">Key Name</label>
                              <input 
                                 type="text" 
                                 autoFocus
                                 value={newKeyName}
                                 onChange={(e) => setNewKeyName(e.target.value)}
                                 className="w-full bg-surface-950 border border-surface-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent" 
                                 placeholder="e.g. Production Server" 
                              />
                           </div>
                        </div>
                        <div className="bg-surface-950/50 px-6 py-4 border-t border-surface-800 flex justify-end gap-3">
                           <button type="button" onClick={() => setShowNewKeyModal(false)} className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">Cancel</button>
                           <button type="submit" disabled={createMutation.isPending || !newKeyName} className="bg-white text-surface-950 hover:bg-slate-200 px-4 py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-50">
                              {createMutation.isPending ? 'Generating...' : 'Generate Key'}
                           </button>
                        </div>
                     </form>
                  ) : (
                     <div className="p-8">
                        <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4 border border-emerald-500/30">
                           <Check className="w-6 h-6 text-emerald-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Key Generated Successfully</h3>
                        <p className="text-sm text-brand-200 mb-6">
                           Please copy this secret key now. <strong className="text-white">For security reasons, you will not be able to see it again.</strong>
                        </p>
                        
                        <div className="bg-surface-950 border border-surface-700 rounded-lg p-1 flex items-center mb-8">
                           <code className="flex-1 px-3 py-2 font-mono text-sm text-brand-300 break-all">{revealedSecret}</code>
                           <button 
                              onClick={() => handleCopy(revealedSecret, 'secret')}
                              className="ml-2 flex items-center justify-center w-10 h-10 bg-surface-800 hover:bg-surface-700 rounded-md text-slate-300 transition-colors"
                           >
                              {copiedId === 'secret' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                           </button>
                        </div>
                        
                        <button onClick={() => setShowNewKeyModal(false)} className="w-full bg-white text-surface-950 hover:bg-slate-200 py-2.5 rounded-lg text-sm font-bold transition-colors">
                           I have saved my secret key
                        </button>
                     </div>
                  )}
               </div>
            </div>
         )}

      </PortalLayout>
   );
}
