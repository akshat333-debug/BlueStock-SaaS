import { useState, useEffect } from 'react';
import { apiClient } from '../api/config';
import { MapPin } from 'lucide-react';

interface Entity { id: number | string; name: string; code: string; }

export default function VillageSelector() {
  // --------------------------------------------------------------------------
  // STATE DEFINITIONS
  // --------------------------------------------------------------------------
  const [states, setStates] = useState<Entity[]>([]);
  const [districts, setDistricts] = useState<Entity[]>([]);
  const [subDistricts, setSubDistricts] = useState<Entity[]>([]);
  const [villages, setVillages] = useState<Entity[]>([]);

  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedSubDistrict, setSelectedSubDistrict] = useState('');
  const [selectedVillage, setSelectedVillage] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  // 1. Fetch States on Mount
  useEffect(() => {
    const fetchStates = async () => {
      setIsLoading(true);
      try {
        const res = await apiClient.get('/states');
        setStates(res.data.data);
      } catch (err) {
        console.error("Failed to load states:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStates();
  }, []);

  // 2. Fetch Districts when State changes
  useEffect(() => {
    // Reset downstream selections
    setDistricts([]); setSubDistricts([]); setVillages([]);
    setSelectedDistrict(''); setSelectedSubDistrict(''); setSelectedVillage('');

    if (!selectedState) return;

    const fetchDistricts = async () => {
      setIsLoading(true);
      try {
        const res = await apiClient.get(`/states/${selectedState}/districts`);
        setDistricts(res.data.data);
      } catch (err) {
        console.error("Failed to load districts:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDistricts();
  }, [selectedState]);

  // 3. Fetch SubDistricts when District changes
  useEffect(() => {
    setSubDistricts([]); setVillages([]);
    setSelectedSubDistrict(''); setSelectedVillage('');

    if (!selectedDistrict) return;

    const fetchSubDistricts = async () => {
      setIsLoading(true);
      try {
        const res = await apiClient.get(`/districts/${selectedDistrict}/subdistricts`);
        setSubDistricts(res.data.data);
      } catch (err) {
        console.error("Failed to load subdistricts:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSubDistricts();
  }, [selectedDistrict]);

  // 4. Fetch Villages when SubDistrict changes
  useEffect(() => {
    setVillages([]);
    setSelectedVillage('');

    if (!selectedSubDistrict) return;

    const fetchVillages = async () => {
      setIsLoading(true);
      try {
        const res = await apiClient.get(`/subdistricts/${selectedSubDistrict}/villages`);
        setVillages(res.data.data);
      } catch (err) {
        console.error("Failed to load villages:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchVillages();
  }, [selectedSubDistrict]);

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
         <div className="bg-emerald-100 p-2 rounded-lg">
            <MapPin className="text-emerald-600 w-5 h-5" />
         </div>
         <div>
            <h2 className="text-lg font-bold text-slate-800">Cascading Hierarchy</h2>
            <p className="text-sm text-slate-500">Implementing dropdowns sequentially.</p>
         </div>
      </div>

      <div className="space-y-5">
        {/* State Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2.5"
          >
            <option value="">Select a state...</option>
            {states.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        {/* District Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">District</label>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            disabled={!selectedState || districts.length === 0}
            className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2.5 disabled:opacity-50 disabled:bg-slate-100"
          >
            <option value="">Select a district...</option>
            {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>

        {/* Sub-District Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Sub-District</label>
          <select
            value={selectedSubDistrict}
            onChange={(e) => setSelectedSubDistrict(e.target.value)}
            disabled={!selectedDistrict || subDistricts.length === 0}
            className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2.5 disabled:opacity-50 disabled:bg-slate-100"
          >
            <option value="">Select a sub-district...</option>
            {subDistricts.map(sd => <option key={sd.id} value={sd.id}>{sd.name}</option>)}
          </select>
        </div>

        {/* Village Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Village</label>
          <select
            value={selectedVillage}
            onChange={(e) => setSelectedVillage(e.target.value)}
            disabled={!selectedSubDistrict || villages.length === 0}
            className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2.5 disabled:opacity-50 disabled:bg-slate-100"
          >
            <option value="">Select a village...</option>
            {villages.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
        </div>
      </div>

      {isLoading && (
        <div className="mt-4 text-sm text-slate-500 flex items-center">
          <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mr-2"></div>
          Fetching API...
        </div>
      )}
      
      {selectedVillage && (
         <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm">
            <span className="font-semibold block mb-1">Selection Complete!</span>
            You selected Village ID: <code className="bg-slate-200 px-1 rounded">{selectedVillage}</code>
         </div>
      )}

    </div>
  );
}
