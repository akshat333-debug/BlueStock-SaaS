import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getHierarchyData } from '../services/api';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Map, PackageSearch } from 'lucide-react';

export default function DataBrowser() {
  const [stateCode, setStateCode] = useState('');
  const [districtCode, setDistrictCode] = useState('');
  const [subDistrictCode, setSubDistrictCode] = useState('');

  const { data: statesRes } = useQuery({
     queryKey: ['browser', 'states'],
     queryFn: () => getHierarchyData('states'),
  });

  const { data: districtsRes } = useQuery({
     queryKey: ['browser', 'districts', stateCode],
     queryFn: () => getHierarchyData('districts', stateCode),
     enabled: !!stateCode,
  });

  const { data: subDistrictsRes } = useQuery({
     queryKey: ['browser', 'subdistricts', districtCode],
     queryFn: () => getHierarchyData('subdistricts', districtCode),
     enabled: !!districtCode,
  });

  const { data: villagesRes, isLoading: loadingVillages } = useQuery({
     queryKey: ['browser', 'villages', subDistrictCode],
     queryFn: () => getHierarchyData('villages', subDistrictCode),
     enabled: !!subDistrictCode,
  });

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Village Master Dataset</h1>
        <p className="mt-1 text-sm text-slate-500">Explore the complete topological hierarchy natively.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 mb-8">
         <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Map className="w-5 h-5 text-blue-600" /> Geographical Explorer
         </h2>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
               <label className="block text-sm font-medium leading-6 text-slate-900 mb-2">State</label>
               <select 
                  className="mt-2 block w-full rounded-md border-0 py-2.5 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6 cursor-pointer bg-slate-50"
                  value={stateCode}
                  onChange={(e) => { setStateCode(e.target.value); setDistrictCode(''); setSubDistrictCode(''); }}
               >
                  <option value="">Select State...</option>
                  {statesRes?.data?.map((s) => <option key={s.id} value={s.code}>{s.name} ({s.code})</option>)}
               </select>
            </div>
            
            <div>
               <label className="block text-sm font-medium leading-6 text-slate-900 mb-2">District</label>
               <select 
                  className="mt-2 block w-full rounded-md border-0 py-2.5 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6 cursor-pointer bg-slate-50 disabled:opacity-50"
                  disabled={!stateCode}
                  value={districtCode}
                  onChange={(e) => { setDistrictCode(e.target.value); setSubDistrictCode(''); }}
               >
                  <option value="">Select District...</option>
                  {districtsRes?.data?.map((d) => <option key={d.id} value={d.code}>{d.name} ({d.code})</option>)}
               </select>
            </div>

            <div>
               <label className="block text-sm font-medium leading-6 text-slate-900 mb-2">Sub-District</label>
               <select 
                  className="mt-2 block w-full rounded-md border-0 py-2.5 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6 cursor-pointer bg-slate-50 disabled:opacity-50"
                  disabled={!districtCode}
                  value={subDistrictCode}
                  onChange={(e) => setSubDistrictCode(e.target.value)}
               >
                  <option value="">Select Sub-District...</option>
                  {subDistrictsRes?.data?.map((sd) => <option key={sd.id} value={sd.code}>{sd.name} ({sd.code})</option>)}
               </select>
            </div>
         </div>
      </div>

      {/* Results View */}
      {subDistrictCode ? (
         <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
             {loadingVillages ? (
                <div className="p-12 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
             ) : (
                <div className="overflow-x-auto">
                   <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50">
                         <tr>
                           <th scope="col" className="px-6 py-3.5 text-left text-sm font-semibold text-slate-900">MDDS Code</th>
                           <th scope="col" className="px-6 py-3.5 text-left text-sm font-semibold text-slate-900">Village Name</th>
                           <th scope="col" className="px-6 py-3.5 text-left text-sm font-semibold text-slate-900">Sub-District</th>
                           <th scope="col" className="px-6 py-3.5 text-right text-sm font-semibold text-slate-900">Coverage Status</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                         {villagesRes?.data?.map((v) => (
                           <tr key={v.id} className="hover:bg-slate-50">
                              <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900 font-mono">{v.code}</td>
                              <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">{v.name}</td>
                              <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">{(v as any).subDistrict.name}</td>
                              <td className="whitespace-nowrap px-6 py-4 text-sm text-right">
                                 <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">Synced</span>
                              </td>
                           </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             )}
         </div>
      ) : (
         <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-12 text-center">
            <PackageSearch className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-sm font-semibold text-slate-900">Select a region</h3>
            <p className="mt-1 text-sm text-slate-500">Pick a state, district, and sub-district above to view the village datatable.</p>
         </div>
      )}
    </DashboardLayout>
  );
}
