import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar.jsx';
import Topbar from './components/Topbar.jsx';
import Toast from './components/Toast.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Pipeline from './pages/Pipeline.jsx';
import Messages from './pages/Messages.jsx';
import KnowledgeGraph from './pages/KnowledgeGraph.jsx';
import Channels from './pages/Channels.jsx';
import Events from './pages/Events.jsx';
import Logs from './pages/Logs.jsx';
import { messagesApi } from './services/api.js';

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [toast, setToast] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const stats = await messagesApi.getStats();
        setPendingCount(Number(stats.pending || 0));
      } catch {}
    };
    fetchPending();
    const interval = setInterval(fetchPending, 10000);
    return () => clearInterval(interval);
  }, []);

  const pages = {
    dashboard: <Dashboard onNavigate={setPage} showToast={showToast} />,
    pipeline: <Pipeline showToast={showToast} />,
    messages: <Messages showToast={showToast} />,
    knowledge: <KnowledgeGraph />,
    channels: <Channels />,
    events: <Events />,
    logs: <Logs />,
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar page={page} onNavigate={setPage} pendingCount={pendingCount} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Topbar page={page} />
        <main style={{ flex: 1, overflowY: 'auto', padding: 28 }}>
          <div className="animate-in">{pages[page]}</div>
        </main>
      </div>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
