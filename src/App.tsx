import { useState, useEffect } from 'react';
import Header from './components/Header';
import MatchTicker from './components/MatchTicker';
import AssistantWidget from './components/AssistantWidget';
import AuthPage from './pages/AuthPage';
import Livestream from './pages/Livestream';
import NewsFeed from './pages/NewsFeed';
import TournamentBracket from './pages/TournamentBracket';
import { User, LiveMatch, Post, Notification, Comment } from './types';
import { Bell, Trophy } from 'lucide-react';

export default function App() {
  // Navigation Router view: 'livestream' | 'news' | 'schedule' | 'auth'
  const [currentView, setCurrentView] = useState<string>('livestream');
  
  // App States
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [matches, setMatches] = useState<LiveMatch[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [toastAlert, setToastAlert] = useState<Notification | null>(null);
  const [isAssistantOpen, setIsAssistantOpen] = useState<boolean>(false);

  // Quick Demo Admin Toggle for ease of evaluating livestream state managers
  const handleToggleDemoAdmin = () => {
    if (!currentUser) {
      // Simulate login as Admin
      const demoAdmin: User = {
        id: "admin-1",
        email: "admin@gmail.com",
        fullName: "Quản Trị Viên Liên Quân",
        phoneNumber: "0987654321",
        role: "admin",
        ingameName: "SGP.GấuVĩĐại",
        avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=admin"
      };
      setCurrentUser(demoAdmin);
      setToastAlert({
        id: `t-${Date.now()}`,
        type: 'system',
        title: "Quyền Quản Trị Hệ Thống",
        message: "Bạn đã đăng nhập thử nghiệm bằng tài khoản ADMIN. Giờ bạn có thể tùy ý sửa ban/pick và tỉ số trực tiếp!",
        timestamp: new Date().toISOString(),
        read: false
      });
    } else {
      // Toggle role
      const nextRole = currentUser.role === 'admin' ? 'user' : 'admin';
      setCurrentUser({
        ...currentUser,
        role: nextRole
      });
      setToastAlert({
        id: `t-${Date.now()}`,
        type: 'system',
        title: "Thay Đổi Quyền Hạn",
        message: `Đã đổi quyền thử nghiệm sang: ${nextRole.toUpperCase()}.`,
        timestamp: new Date().toISOString(),
        read: false
      });
    }
  };

  // Synchronize initial datas
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [mResp, pResp, nResp] = await Promise.all([
          fetch('/api/matches'),
          fetch('/api/posts'),
          fetch('/api/notifications')
        ]);

        if (mResp.ok) setMatches(await mResp.json());
        if (pResp.ok) setPosts(await pResp.json());
        if (nResp.ok) setNotifications(await nResp.json());
      } catch (err) {
        console.error("Lỗi khi đồng bộ dữ liệu ban đầu: ", err);
      }
    };

    fetchInitialData();

    // --- LIVE SSE EVENTSOURCE SUBSCRIPTION FOR MATCH NOTIFICATIONS ---
    const sse = new EventSource('/api/notifications/stream');

    sse.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'score_update') {
          // Live score advancement or event trigger
          setMatches((prev) => 
            prev.map(m => m.id === data.match.id ? data.match : m)
          );
          setNotifications(prev => [data.notification, ...prev]);
          
          // Show dynamic real-time warning toast overlay
          setToastAlert(data.notification);
          
        } else if (data.type === 'news_alert') {
          // Admin published new tournament picture or article
          setPosts(prev => [data.post, ...prev]);
          setNotifications(prev => [data.notification, ...prev]);
          setToastAlert(data.notification);
        }
      } catch (e) {
        console.error("Lỗi phân tích cú pháp SSE packet: ", e);
      }
    };

    sse.onerror = (err) => {
      console.warn("Mất kết nối SSE tới máy chủ (đang thử kết nối lại)...", err);
    };

    return () => {
      sse.close();
    };

  }, []);

  // Set real-time toast alert timeouts
  useEffect(() => {
    if (toastAlert) {
      const timer = setTimeout(() => {
        setToastAlert(null);
      }, 5500);
      return () => clearTimeout(timer);
    }
  }, [toastAlert]);

  const handleMarkNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setToastAlert({
      id: `logout-${Date.now()}`,
      type: 'system',
      title: "Đăng Xuất Cơ Sở",
      message: "Tài khoản của bạn đã được đăng xuất an toàn khỏi hệ thống giải đấu.",
      timestamp: new Date().toISOString(),
      read: false
    });
  };

  // Synchronized callback modifiers to pass down components
  const handleAddPost = (newPost: Post) => {
    setPosts(prev => [newPost, ...prev]);
  };

  const handleDeletePost = (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  const handleUpdatePostInteraction = (postId: string, updatedFields: Partial<Post>) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, ...updatedFields } : p));
  };

  const handleAddComment = (postId: string, comment: Comment) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          comments: [...(p.comments || []), comment]
        };
      }
      return p;
    }));
  };

  const handleUpdateMatch = (updated: LiveMatch) => {
    setMatches(prev => prev.map(m => m.id === updated.id ? updated : m));
  };

  const liveMatchObj = matches.find(m => m.status === 'live') || null;

  return (
    <div className="min-h-screen bg-[#09090e] text-slate-200 flex flex-col justify-between font-sans selection:bg-red-650 selection:text-white relative">
      <div>
        
        {/* Match score scrolling banner header */}
        <MatchTicker matches={matches || []} onNavigate={setCurrentView} />

        {/* Global Navigation Header */}
        <Header 
          currentView={currentView}
          onNavigate={setCurrentView}
          currentUser={currentUser}
          onLogout={handleLogout}
          notifications={notifications || []}
          onMarkNotificationsAsRead={handleMarkNotificationsAsRead}
          onToggleDemoAdmin={handleToggleDemoAdmin}
          isAssistantOpen={isAssistantOpen}
          onToggleAssistant={() => setIsAssistantOpen(prev => !prev)}
        />

        {/* Main Content Layout Wrapper */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 min-h-[calc(100vh-180px)]">
          {currentView === 'livestream' && (
            <Livestream 
              currentUser={currentUser}
              liveMatch={liveMatchObj}
              onUpdateMatch={handleUpdateMatch}
              onNavigate={setCurrentView}
            />
          )}

          {currentView === 'news' && (
            <NewsFeed 
              currentUser={currentUser}
              posts={posts || []}
              onAddPost={handleAddPost}
              onUpdatePostInteraction={handleUpdatePostInteraction}
              onAddComment={handleAddComment}
              onDeletePost={handleDeletePost}
              onNavigate={setCurrentView}
            />
          )}

          {currentView === 'schedule' && (
            <TournamentBracket 
              matches={matches || []}
              onNavigate={setCurrentView}
              currentUser={currentUser}
              onUpdateMatches={setMatches}
            />
          )}

          {currentView === 'auth' && (
            <AuthPage 
              currentUser={currentUser}
              onLoginSuccess={handleLoginSuccess}
              onNavigate={setCurrentView}
            />
          )}
        </main>

      </div>

      {/* --- FLOATING AI ASSISTANT OVERLAY --- */}
      <AssistantWidget 
        currentUser={currentUser} 
        isOpen={isAssistantOpen}
        setIsOpen={setIsAssistantOpen}
      />

      {/* --- REAL-TIME CHAMPIONSHIP ALERTS OVERLAY (TOAST) --- */}
      {toastAlert && (
        <div 
          id="realtime-toast-alert"
          onClick={() => {
            setCurrentView(toastAlert.link === "/livestream" ? "livestream" : "news");
            setToastAlert(null);
          }}
          className="fixed top-20 right-4 z-50 max-w-sm w-full bg-[#1b1216] border-2 border-red-500/40 rounded-xl p-4 shadow-[0_5px_20px_rgba(239,68,68,0.3)] animate-slide-left cursor-pointer hover:border-red-500 transition-colors"
        >
          <div className="flex items-start space-x-3">
            <div className="bg-red-600/20 text-red-500 p-2 rounded-lg mt-0.5">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-white uppercase tracking-wider">{toastAlert.title}</span>
                <span className="text-[8px] bg-red-600 text-white font-black px-1.5 py-0.2 rounded uppercase">REAL-TIME</span>
              </div>
              <p className="text-[11px] text-slate-350 mt-1 leading-relaxed font-sans">{toastAlert.message}</p>
              <span className="text-[9px] text-slate-500 tracking-wider font-mono block mt-2 text-right">Nhấp chuột để xem trực tiếp ➔</span>
            </div>
          </div>
        </div>
      )}

      {/* Global minimal Footer */}
      <footer className="bg-[#0b0c16] border-t border-slate-900 py-6 text-center text-xs text-slate-500 font-mono mt-12 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-2">
          <p>© 2026 Giải đấu Liên Quân Mobile Đơn Dương - Lâm Đồng. Sân chơi thể thao điện tử phong trào kịch tính.</p>
          <p className="text-[10px] text-slate-600">
            Hệ thống full-stack tích hợp công nghệ kết nối thời gian thực SSE & Trợ Lý Krixi AI thông minh.
          </p>
        </div>
      </footer>

    </div>
  );
}
