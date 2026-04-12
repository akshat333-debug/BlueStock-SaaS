import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Analytics from './pages/Analytics';
import Users from './pages/Users';
import DataBrowser from './pages/DataBrowser';
import ApiLogs from './pages/ApiLogs';

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Analytics />} />
          <Route path="/users" element={<Users />} />
          <Route path="/data-browser" element={<DataBrowser />} />
          <Route path="/api-logs" element={<ApiLogs />} />
          <Route path="*" element={<div className="p-12 text-center text-slate-500">Not Found</div>} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
