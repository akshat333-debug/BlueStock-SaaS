import { useState } from 'react';
import SearchAutocomplete, { SearchResult } from './components/SearchAutocomplete';
import { Send, MapPin, Building2, User } from 'lucide-react';

function App() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    village: '',
    subDistrict: '',
    district: '',
    state: '',
    country: 'India',
    message: ''
  });

  const handleVillageSelect = (result: SearchResult) => {
    setFormData(prev => ({
      ...prev,
      village: result.hierarchy.village,
      subDistrict: result.hierarchy.subDistrict,
      district: result.hierarchy.district,
      state: result.hierarchy.state,
      country: result.hierarchy.country || 'India'
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`DEMO SUBMISSION:
Name: ${formData.fullName}
Location: ${formData.village}, ${formData.state}
--
This demonstrates how external B2B clients intercept the Village API payload correctly into standard schemas.`);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
            Bluestock <span className="text-blue-600">B2B Integration Demo</span>
          </h1>
          <p className="mt-4 text-base text-slate-500 max-w-2xl mx-auto">
            Experience the "Simple Contact Form" spec. Search your Village seamlessly via our Fuzzy-Match API to instantly autocomplete the rigid geographical boundaries below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white px-8 py-10 shadow-sm border border-slate-200 rounded-2xl">
          
          <div className="border-b border-slate-200 pb-8 mb-8">
            <h2 className="text-xl font-semibold flex items-center gap-2 text-slate-800">
              <User className="text-blue-500 w-5 h-5" /> Applicant Details
            </h2>
            <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">Full Name</label>
                <div className="mt-1">
                  <input type="text" required onChange={(e) => setFormData({...formData, fullName: e.target.value})} className="block w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-slate-50 p-2 border" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Email Address</label>
                <div className="mt-1">
                  <input type="email" required onChange={(e) => setFormData({...formData, email: e.target.value})} className="block w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-slate-50 p-2 border" />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700">Phone Number</label>
                <div className="mt-1">
                  <input type="tel" required onChange={(e) => setFormData({...formData, phone: e.target.value})} className="block w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-slate-50 p-2 border" />
                </div>
              </div>
            </div>
          </div>

          <div className="border-b border-slate-200 pb-8 mb-8">
            <h2 className="text-xl font-semibold flex items-center gap-2 text-slate-800">
              <MapPin className="text-blue-500 w-5 h-5" /> Geographical Location
            </h2>
            <p className="text-xs text-slate-500 mt-1 mb-6">Powered by the VillageAPI Dropdown Auto-filler.</p>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">Village / Core Area Search</label>
              <SearchAutocomplete onSelect={handleVillageSelect} />
            </div>

            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
               <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase">Sub-District (Taluk)</label>
                  <input type="text" readOnly value={formData.subDistrict} placeholder="Autofilled" className="mt-1 block w-full bg-slate-200/50 border-transparent rounded-md text-slate-700 font-medium sm:text-sm p-2 cursor-not-allowed" />
               </div>
               <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase">District</label>
                  <input type="text" readOnly value={formData.district} placeholder="Autofilled" className="mt-1 block w-full bg-slate-200/50 border-transparent rounded-md text-slate-700 font-medium sm:text-sm p-2 cursor-not-allowed" />
               </div>
               <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase">State / UT</label>
                  <input type="text" readOnly value={formData.state} placeholder="Autofilled" className="mt-1 block w-full bg-slate-200/50 border-transparent rounded-md text-slate-700 font-medium sm:text-sm p-2 cursor-not-allowed" />
               </div>
               <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase">Country</label>
                  <input type="text" readOnly value={formData.country} className="mt-1 block w-full bg-slate-200/50 border-transparent rounded-md text-slate-700 font-medium sm:text-sm p-2 cursor-not-allowed" />
               </div>
            </div>
          </div>

          <div className="mb-8">
             <h2 className="text-xl font-semibold flex items-center gap-2 text-slate-800 mb-4">
              <Building2 className="text-blue-500 w-5 h-5" /> Comments
            </h2>
            <textarea rows={4} onChange={(e) => setFormData({...formData, message: e.target.value})} className="block w-full border border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-3 bg-slate-50" placeholder="Your inquiry..."></textarea>
          </div>

          <div className="flex justify-end">
            <button type="submit" className="inline-flex justify-center items-center py-3 px-6 border border-transparent shadow-sm text-base font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Submit Payload <Send className="ml-2 w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;
