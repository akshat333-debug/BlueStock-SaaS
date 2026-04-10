import VillageSelector from './components/VillageSelector';
import SearchAutocomplete from './components/SearchAutocomplete';

function App() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
            Bluestock <span className="text-blue-600">Village API Integration Demo</span>
          </h1>
          <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
            This is a standalone open-source repository demonstrating how to properly consume the REST endpoints for both standard Hierarchical Dropdowns and Fuzzy Text Search.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <VillageSelector />
          <SearchAutocomplete />
        </div>
        
        <div className="mt-12 text-center text-sm text-slate-400">
           To connect this to your production backend, replace the credentials in <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-600">src/api/config.ts</code>
        </div>
      </div>
    </div>
  );
}

export default App;
