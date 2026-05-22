import { useState } from 'react';
import { User, Notification } from '../types';
import { Trophy, Tv, Newspaper, Bell, LogIn, LogOut, User as UserIcon, ShieldAlert, Bot, Sparkles } from 'lucide-react';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string) => void;
  currentUser: User | null;
  onLogout: () => void;
  notifications: Notification[];
  onMarkNotificationsAsRead: () => void;
  onToggleDemoAdmin: () => void;
  isAssistantOpen: boolean;
  onToggleAssistant: () => void;
}

export default function Header({
  currentView,
  onNavigate,
  currentUser,
  onLogout,
  notifications,
  onMarkNotificationsAsRead,
  onToggleDemoAdmin,
  isAssistantOpen,
  onToggleAssistant
}: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      onMarkNotificationsAsRead();
    }
  };

  return (
    <header id="app-header" className="bg-[#121226]/90 backdrop-blur-md sticky top-0 z-40 border-b border-indigo-950/50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo brand */}
          <div 
            id="brand-logo"
            onClick={() => onNavigate('livestream')}
            className="flex items-center space-x-2.5 cursor-pointer group"
          >
            <div className="bg-red-600 p-2 rounded-lg border border-yellow-500/30 group-hover:scale-105 transition-transform duration-300 shadow-[0_0_10px_rgba(239,68,68,0.3)]">
              <Trophy className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold text-white tracking-widest uppercase flex items-center gap-1.5 leading-none">
                ĐƠN DƯƠNG <span className="text-red-500 text-xs">ESPORTS</span>
              </h1>
              <p className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest mt-0.5">Giải Đấu Liên Quân Đơn Dương (Lâm Đồng)</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav id="main-navigation" className="hidden md:flex items-center space-x-1">
            <button
              id="nav-livestream"
              onClick={() => onNavigate('livestream')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-bold tracking-wider uppercase transition-all duration-200 ${
                currentView === 'livestream'
                  ? 'bg-red-600 text-white shadow-[0_0_10px_rgba(239,68,68,0.2)]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <Tv className="w-3.5 h-3.5" />
              <span>Phòng livestream</span>
            </button>

            <button
              id="nav-news"
              onClick={() => onNavigate('news')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-bold tracking-wider uppercase transition-all duration-200 ${
                currentView === 'news'
                  ? 'bg-red-600 text-white shadow-[0_0_10px_rgba(239,68,68,0.2)]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Newspaper className="w-3.5 h-3.5" />
              <span>Tin tức & Ảnh</span>
            </button>

            <button
              id="nav-schedule"
              onClick={() => onNavigate('schedule')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-bold tracking-wider uppercase transition-all duration-200 ${
                currentView === 'schedule'
                  ? 'bg-red-600 text-white shadow-[0_0_10px_rgba(239,68,68,0.2)]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-yellow-500" />
              <span>Lịch & Kết quả</span>
            </button>
          </nav>

          {/* User Controls and Notifications Area */}
          <div id="user-controls" className="flex items-center space-x-3">
            
            {/* Quick Demo toggle for evaluation admin flow */}
            <button
              id="demo-admin-btn"
              onClick={onToggleDemoAdmin}
              title="Nhấn để đổi quyền ADMIN/USER để thử tính năng quản trị livestream"
              className="px-2.5 py-1.5 rounded border border-yellow-500/20 bg-yellow-950/20 text-yellow-500 hover:bg-yellow-900/20 hover:border-yellow-500/40 text-[10px] font-mono font-bold flex items-center space-x-1 transition-all rounded-md"
            >
              <ShieldAlert className="w-3 h-3 text-red-500" />
              <span>Chuyển Thử Admin ({currentUser?.role || 'Chưa đăng nhập'})</span>
            </button>

            {/* Toggle Krixi AI Assistant Button */}
            <button
              id="header-toggle-assistant-btn"
              onClick={onToggleAssistant}
              className={`p-2 rounded-full transition-all relative flex items-center justify-center ${
                isAssistantOpen
                  ? "bg-gradient-to-r from-red-600 to-yellow-600 text-white shadow-[0_0_12px_rgba(239,68,68,0.4)]"
                  : "text-slate-400 hover:text-white bg-slate-800/40 hover:bg-slate-800"
              }`}
              title={isAssistantOpen ? "Đóng Trợ lý ảo Krixi" : "Mở Trợ lý ảo Krixi"}
            >
              <Bot className="w-4 h-4" />
              <span className="absolute -bottom-0.5 -right-0.5 block h-2 w-2 rounded-full bg-green-400 border border-slate-900"></span>
            </button>

            {/* SSE Notification bell */}
            <div className="relative">
              <button
                id="notification-bell-btn"
                onClick={handleNotificationClick}
                className="p-2 text-slate-400 hover:text-white bg-slate-800/40 hover:bg-slate-800 rounded-full transition-colors relative"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-[9px] font-bold text-white rounded-full h-4 w-4 flex items-center justify-center animate-bounce shadow">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown (SSE updates feed) */}
              {showNotifications && (
                <div 
                  id="notifications-dropdown-panel"
                  className="absolute right-0 mt-2.5 w-80 bg-[#121226] border border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden"
                >
                  <div className="p-3 border-b border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Thông báo giải đấu ({notifications.length})</span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] text-red-400 font-bold bg-red-950/50 px-1.5 py-0.5 rounded">Real-time</span>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-slate-500 text-xs">
                        Chưa có thông báo nào mới về tỉ số trận đấu.
                      </div>
                    ) : (
                      notifications.map((notif) => {
                        const isScore = notif.type === 'match_score';
                        return (
                          <div
                            key={notif.id}
                            id={`notif-item-${notif.id}`}
                            onClick={() => {
                              setShowNotifications(false);
                              onNavigate(notif.link === "/livestream" ? "livestream" : "news");
                            }}
                            className={`p-3 border-b border-indigo-950/20 hover:bg-slate-800/40 cursor-pointer transition-colors ${
                              !notif.read ? 'bg-indigo-950/20 border-l-2 border-red-500' : ''
                            }`}
                          >
                            <div className="flex items-start space-x-2">
                              {isScore ? (
                                <span className="bg-red-600/20 text-red-400 p-1 rounded text-2xs uppercase tracking-tight font-black mt-0.5">KT</span>
                              ) : (
                                <span className="bg-yellow-600/20 text-yellow-400 p-1 rounded text-2xs uppercase tracking-tight font-black mt-0.5">TIN</span>
                              )}
                              <div className="flex-1">
                                <h4 className="text-xs font-bold text-slate-200">{notif.title}</h4>
                                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{notif.message}</p>
                                <span className="text-[9px] text-slate-500 mt-1 block">
                                  {new Date(notif.timestamp).toLocaleTimeString('vi-VN')}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                  <div className="p-2 border-t border-slate-800 text-center bg-[#09090e]">
                    <button 
                      onClick={() => onNavigate('schedule')}
                      className="text-[10px] text-yellow-500 hover:text-yellow-400 font-semibold uppercase tracking-wider block w-full"
                    >
                      Xem Toàn Bộ Lịch Thi Đấu & Standings
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Menu/Auth Trigger */}
            {currentUser ? (
              <div className="relative">
                <button
                  id="user-profile-menu-trigger"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-1 text-xs text-slate-300 hover:text-white py-1.5 px-2.5 bg-slate-800/40 hover:bg-slate-800 rounded-lg transition-all border border-slate-800"
                >
                  <img
                    src={currentUser.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(currentUser.fullName)}`}
                    alt="avatar"
                    className="w-5 h-5 rounded-full border border-yellow-500/30 object-cover"
                  />
                  <span className="max-w-[100px] truncate font-semibold hidden sm:inline ml-1 font-mono">{currentUser.ingameName || currentUser.fullName}</span>
                </button>

                {showUserMenu && (
                  <div 
                    id="user-menu-dropdown"
                    className="absolute right-0 mt-2.5 w-56 bg-[#121226] border border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden"
                  >
                    <div className="p-3.5 border-b border-indigo-950/20 bg-[#09090e]">
                      <h4 className="text-xs font-bold text-white truncate">{currentUser.fullName}</h4>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">{currentUser.email}</p>
                      <p className="text-[10px] text-slate-500 font-mono">SDT: {currentUser.phoneNumber || '098******'}</p>
                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-indigo-950/20">
                        <span className="text-[10px] bg-red-950 text-red-400 font-black tracking-widest uppercase px-1.5 py-0.5 rounded border border-red-500/20">
                          {currentUser.role}
                        </span>
                        <span className="text-[9px] text-yellow-500 font-bold">
                          {currentUser.ingameName || "Chưa tạo ingame"}
                        </span>
                      </div>
                    </div>
                    <div className="p-1">
                      <button
                        id="user-menu-reset-pwd-btn"
                        onClick={() => {
                          setShowUserMenu(false);
                          onNavigate('auth');
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center space-x-2"
                      >
                        <UserIcon className="w-3.5 h-3.5" />
                        <span>Đổi Mật Khẩu / Account</span>
                      </button>
                      <button
                        id="user-menu-logout-btn"
                        onClick={() => {
                          setShowUserMenu(false);
                          onLogout();
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-red-400 hover:text-white hover:bg-red-950/40 rounded-lg transition-colors flex items-center space-x-2"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                id="header-login-btn"
                onClick={() => onNavigate('auth')}
                className="flex items-center space-x-1.5 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold uppercase tracking-wider transition-colors shadow-[0_2px_10px_rgba(239,68,68,0.2)]"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Đăng nhập</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* For tablets/mobile: visual nav links inline */}
      <div className="md:hidden border-t border-indigo-950/20 flex divide-x divide-indigo-950/20 text-center text-xs">
        <button
          onClick={() => onNavigate('livestream')}
          className={`flex-1 py-2.5 font-bold uppercase tracking-widest text-[9px] flex items-center justify-center space-x-1 ${
            currentView === 'livestream' ? 'text-red-500 bg-slate-900/30' : 'text-slate-400'
          }`}
        >
          <Tv className="w-3 h-3" />
          <span>Livestream</span>
        </button>
        <button
          onClick={() => onNavigate('news')}
          className={`flex-1 py-2.5 font-bold uppercase tracking-widest text-[9px] flex items-center justify-center space-x-1 ${
            currentView === 'news' ? 'text-red-500 bg-slate-900/30' : 'text-slate-400'
          }`}
        >
          <Newspaper className="w-3 h-3" />
          <span>Tin tức & Ảnh</span>
        </button>
        <button
          onClick={() => onNavigate('schedule')}
          className={`flex-1 py-2.5 font-bold uppercase tracking-widest text-[9px] flex items-center justify-center space-x-1 ${
            currentView === 'schedule' ? 'text-red-500 bg-slate-900/30' : 'text-slate-400'
          }`}
        >
          <Trophy className="w-3 h-3" />
          <span>Kết quả</span>
        </button>
      </div>
    </header>
  );
}
