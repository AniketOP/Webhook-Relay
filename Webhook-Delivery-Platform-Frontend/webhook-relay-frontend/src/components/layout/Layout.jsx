import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Toaster } from 'react-hot-toast';

export default function Layout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-60 min-h-screen flex flex-col">
        <Outlet />
      </main>
      <Toaster position="bottom-right" toastOptions={{ style: { background: '#0D1322', color: '#F1F5F9', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', fontSize: '13px' }, success: { iconTheme: { primary: '#10B981', secondary: '#0D1322' } }, error: { iconTheme: { primary: '#F43F5E', secondary: '#0D1322' } } }} />
    </div>
  );
}
