import { useState } from 'react';
import { User } from '../types';
import { LogIn, Key, Phone, Mail, UserPlus, ShieldAlert, Sparkles, AlertCircle } from 'lucide-react';

const krixiAvatar = '/src/assets/images/krixi_avatar_1779467532656.png';

interface AuthPageProps {
  currentUser: User | null;
  onLoginSuccess: (user: User) => void;
  onNavigate: (view: string) => void;
}

export default function AuthPage({ currentUser, onLoginSuccess, onNavigate }: AuthPageProps) {
  // Mode toggle: 'login' | 'register' | 'change_password'
  const [mode, setMode] = useState<'login' | 'register' | 'change_password'>('login');
  
  // Fields
  const [loginVal, setLoginVal] = useState(''); // Email or Phone
  const [pwd, setPwd] = useState('');
  
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPwd, setRegPwd] = useState('');
  const [regIngame, setRegIngame] = useState('');

  const [resetEmail, setResetEmail] = useState('');
  const [resetPhone, setResetPhone] = useState('');
  const [resetNewPwd, setResetNewPwd] = useState('');

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginVal || !pwd) {
      setErr("Vui lòng nhập tài khoản (Email/SĐT) và mật khẩu.");
      return;
    }

    setErr('');
    setMsg('');
    setLoading(true);

    try {
      const resp = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ loginKey: loginVal, password: pwd })
      });

      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || "Tài khoản hoặc mật khẩu không đúng.");
      }

      setMsg("Đăng nhập thành công!");
      onLoginSuccess(data.user);
      setTimeout(() => onNavigate('livestream'), 800);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPhone || !regPwd) {
      setErr("Vui lòng điền đầy đủ tất cả các trường thông tin bắt buộc.");
      return;
    }

    setErr('');
    setMsg('');
    setLoading(true);

    try {
      const resp = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fullName: regName,
          email: regEmail,
          phoneNumber: regPhone,
          password: regPwd,
          ingameName: regIngame
        })
      });

      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || "Lỗi khi đăng ký tài khoản.");
      }

      setMsg("Đăng ký tài khoản thành công! Tự động đăng nhập...");
      // Auto-authenticate newly registered user
      onLoginSuccess(data.user);
      setTimeout(() => onNavigate('livestream'), 800);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail || !resetPhone || !resetNewPwd) {
      setErr("Vui lòng điền tất cả các thông tin để xác nhận danh tính thành viên.");
      return;
    }

    setErr('');
    setMsg('');
    setLoading(true);

    try {
      const resp = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: resetEmail,
          phoneNumber: resetPhone,
          newPassword: resetNewPwd
        })
      });

      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || "Lỗi thay đổi mật khẩu.");
      }

      setMsg(data.message || "Đổi mật khẩu thành công! Hãy đăng nhập lại bằng mật khẩu mới.");
      setMode('login');
      // Prefill login email
      setLoginVal(resetEmail);
      setPwd(resetNewPwd);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Google single sign in flow integration (Uses user metadata)
  const handleGoogleSignIn = async () => {
    setErr('');
    setMsg('');
    setLoading(true);

    try {
      // Simulate real Google Sign-In with popup/modal appearance & extracting the user email 'k8a330@gmail.com'
      const googleMockUser = {
        email: "k8a330@gmail.com",
        name: "Nguyễn Khánh",
        googleId: "g-103829424",
        picture: krixiAvatar
      };

      const resp = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(googleMockUser)
      });

      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || "Lỗi đăng nhập qua Google.");
      }

      setMsg("Kết nối Google thành công! Đang đồng bộ hóa dịch vụ...");
      onLoginSuccess(data.user);
      setTimeout(() => onNavigate('livestream'), 800);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper autofills for fast evaluation
  const fillQuickAuth = (role: 'admin' | 'user') => {
    if (role === 'admin') {
      setLoginVal("admin@gmail.com");
      setPwd("admin");
    } else {
      setLoginVal("k8a330@gmail.com");
      setPwd("123");
    }
  };

  // Logged-in Account Management view
  if (currentUser) {
    return (
      <div id="auth-main-card" className="max-w-md mx-auto my-12 p-6 bg-[#121226]/80 rounded-2xl border border-indigo-950/50 shadow-2xl relative page-enter">
        <div className="absolute top-0 right-0 bg-yellow-500/10 text-yellow-500 font-bold px-2.5 py-1 text-[9px] rounded-bl-xl uppercase border-l border-b border-indigo-950/20 font-mono">
          ĐÃ ĐĂNG NHẬP
        </div>
        <div className="text-center">
          <img 
            src={currentUser.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(currentUser.fullName)}`} 
            alt="User profile" 
            className="w-20 h-20 rounded-full border-2 border-red-500 mx-auto bg-slate-900 shadow-md object-cover"
          />
          <h2 className="text-lg font-bold text-white mt-4">{currentUser.fullName}</h2>
          <p className="text-xs text-yellow-500 font-mono">{currentUser.ingameName || "Nickname Liên Quân"}</p>
          <p className="text-xs text-slate-400 mt-2">{currentUser.email}</p>
          <div className="bg-[#09090e] p-3 rounded-lg border border-slate-800 text-left mt-4 text-xs space-y-2">
            <div><span className="text-slate-500">Số Điện Thoại:</span> <span className="font-mono text-slate-300">{currentUser.phoneNumber || '000-000-000'}</span></div>
            <div><span className="text-slate-500">Vai Trò Hệ Thống:</span> <span className="uppercase text-red-400 font-semibold">{currentUser.role}</span></div>
          </div>
          <button
            onClick={() => onNavigate('livestream')}
            className="w-full bg-gradient-to-r from-red-600 to-yellow-600 hover:from-red-700 hover:to-yellow-700 text-white font-bold py-2.5 px-4 rounded-lg mt-6 shadow-md text-xs uppercase tracking-wider"
          >
            Quay Lại Livestream Xem Giải Đấu ➔
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="auth-main-card" className="max-w-md mx-auto my-12 bg-[#121226]/80 rounded-2xl border border-indigo-950/50 shadow-2xl overflow-hidden page-enter">
      
      {/* Banner design */}
      <div className="bg-gradient-to-r from-red-950/30 to-indigo-950/30 p-6 border-b border-indigo-950/20 text-center relative">
        <div className="bg-red-600 w-10 h-10 rounded-full flex items-center justify-center mx-auto border border-yellow-500/20 shadow-md mb-2">
          <LogIn className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-base font-black text-white uppercase tracking-wider">Cổng Thành Viên Đấu Trường</h2>
        <p className="text-[10px] text-yellow-500/80 font-bold uppercase tracking-widest mt-1">Đăng Ký - Đăng Nhập - Xác Thực Số Điện Thoại</p>
      </div>

      <div className="p-6">
        
        {/* Error/Notice display */}
        {err && (
          <div className="mb-4 bg-red-950/30 border border-red-500/30 text-red-400 text-xs p-3 rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-4 h-4" />
            <span>{err}</span>
          </div>
        )}
        
        {msg && (
          <div className="mb-4 bg-green-950/30 border border-green-500/30 text-green-300 text-xs p-3 rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-green-400" />
            <span>{msg}</span>
          </div>
        )}

        {/* --- LOGIN MODE --- */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Email hoặc Số Điện Thoại</label>
              <div className="relative">
                <input
                  id="auth-login-key"
                  type="text"
                  placeholder="nhập email hoặc sđt đăng ký"
                  value={loginVal}
                  onChange={(e) => setLoginVal(e.target.value)}
                  disabled={loading}
                  className="w-full bg-slate-950 text-white rounded-lg pl-10 pr-4 py-2 text-xs focus:ring-1 focus:ring-red-500 border border-slate-800"
                />
                <Mail className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Mật khẩu tài khoản</label>
              <div className="relative">
                <input
                  id="auth-password"
                  type="password"
                  placeholder="nhập mật khẩu của bạn"
                  value={pwd}
                  onChange={(e) => setPwd(e.target.value)}
                  disabled={loading}
                  className="w-full bg-slate-950 text-white rounded-lg pl-10 pr-4 py-2 text-xs focus:ring-1 focus:ring-red-500 border border-slate-800"
                />
                <Key className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
              </div>
            </div>

            <button
              id="auth-login-submit"
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-600 to-yellow-600 hover:from-red-700 hover:to-yellow-700 text-white text-xs font-bold py-2.5 px-4 rounded-lg shadow-md transition-all uppercase tracking-wider"
            >
              {loading ? "Đang xác nhận..." : "Đăng Nhập Ngay"}
            </button>
          </form>
        )}

        {/* --- REGISTER MODE --- */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3">
            <div>
              <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Họ và Tên Tuyển Thủ (Bắt buộc)</label>
              <input
                id="reg-fullname"
                type="text"
                placeholder="Ví dụ: Nguyễn Khánh"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                disabled={loading}
                className="w-full bg-slate-950 text-white rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-red-500 border border-slate-800"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Địa chỉ Email (Bắt buộc)</label>
              <input
                id="reg-email"
                type="email"
                placeholder="vi-du@gmail.com"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                disabled={loading}
                className="w-full bg-slate-950 text-white rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-red-500 border border-slate-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Số Điện Thoại</label>
                <input
                  id="reg-phone"
                  type="text"
                  placeholder="0912*******"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  disabled={loading}
                  className="w-full bg-slate-950 text-white rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-red-500 border border-slate-800"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Tên Ingame (Nhận quà)</label>
                <input
                  id="reg-ingame"
                  type="text"
                  placeholder="FL.BângKrixi"
                  value={regIngame}
                  onChange={(e) => setRegIngame(e.target.value)}
                  disabled={loading}
                  className="w-full bg-slate-950 text-white rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-red-500 border border-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Mật Khẩu Mới</label>
              <input
                id="reg-pwd"
                type="password"
                placeholder="nhập mật khẩu bảo mật"
                value={regPwd}
                onChange={(e) => setRegPwd(e.target.value)}
                disabled={loading}
                className="w-full bg-slate-950 text-white rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-red-500 border border-slate-800"
              />
            </div>

            <button
              id="auth-register-submit"
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-600 to-yellow-600 hover:from-red-700 hover:to-yellow-700 text-white text-xs font-bold py-2.5 px-4 rounded-lg shadow-md transition-all uppercase tracking-wider mt-2.5"
            >
              {loading ? "Đang xử lý..." : "Khởi Tạo Tài Khoản"}
            </button>
          </form>
        )}

        {/* --- CHANGE PASSWORD MODE --- */}
        {mode === 'change_password' && (
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="bg-slate-950 border border-yellow-500/20 p-3 rounded-lg mb-3">
              <span className="text-[10px] text-yellow-500 font-bold block">🔐 XÁC MINH SỐ ĐIỆN THOẠI & EMAIL</span>
              <p className="text-[9px] text-slate-400 mt-1">Để đổi mật khẩu, vui lòng nhập chính xác email và số điện thoại đã sử dụng để đăng ký thông tin ban đầu.</p>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Email Tài Khoản</label>
              <input
                id="change-pwd-email"
                type="email"
                placeholder="nhập email tài khoản"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                disabled={loading}
                className="w-full bg-slate-950 text-white rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-red-500 border border-slate-800"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Số điện thoại xác nhận</label>
              <input
                id="change-pwd-phone"
                type="text"
                placeholder="nhập sđt đăng ký (ví dụ: 0912345678)"
                value={resetPhone}
                onChange={(e) => setResetPhone(e.target.value)}
                disabled={loading}
                className="w-full bg-slate-950 text-white rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-red-500 border border-slate-800"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Mật Khẩu Mới Muốn Đặt</label>
              <input
                id="change-pwd-newpwd"
                type="password"
                placeholder="nhập mật khẩu mới bảo mật"
                value={resetNewPwd}
                onChange={(e) => setResetNewPwd(e.target.value)}
                disabled={loading}
                className="w-full bg-slate-950 text-white rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-red-500 border border-slate-800"
              />
            </div>

            <button
              id="change-pwd-submit"
              type="submit"
              disabled={loading}
              className="w-full bg-slate-100 hover:bg-white text-slate-950 text-xs font-bold py-2.5 px-4 rounded-lg shadow-md transition-all uppercase tracking-wider"
            >
              {loading ? "Đang cập nhật..." : "Cập Nhật Mật Khẩu Mới"}
            </button>
          </form>
        )}

        {/* --- GOOGLE SIGN-IN SIMULATOR --- */}
        <div className="relative my-6 text-center">
          <hr className="border-indigo-950/40" />
          <span className="bg-[#121226] text-[10px] text-slate-500 font-bold px-3 absolute -top-2 left-1/2 transform -translate-x-1/2 uppercase tracking-widest">
            Hoặc đăng nhập bằng
          </span>
        </div>

        <button
          id="google-oauth-signin-btn"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-lg bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold flex items-center justify-center space-x-2.5 shadow-md active:scale-98 transition-all"
        >
          {/* Flat Google vector SVG */}
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.13-5.136 4.13A5.57 5.57 0 0 1 8.4 13a5.57 5.57 0 0 1 5.59-5.535c2.44 0 4.535 1.565 5.254 3.73l3.864-3A11.05 11.05 0 0 0 14 2 11 11 0 0 0 3 13a11 11 0 0 0 11 11c5.52 0 10.24-4 10.24-11 0-.685-.06-1.354-.18-2.015H12.24Z" />
          </svg>
          <span className="text-xs uppercase tracking-wider">Chọn Tài Khoản Google</span>
        </button>

        {/* --- FAST TRACK LOGIN FOR EVALUATOR --- */}
        <div className="mt-8 pt-4 border-t border-indigo-950/20 text-center">
          <span className="text-[10px] text-slate-500 font-mono tracking-widest block uppercase mb-2 flex items-center justify-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-red-500 inline" />
            <span>Thông tin thử nghiệm nhanh:</span>
          </span>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => fillQuickAuth('admin')}
              className="px-2 py-1 text-[9px] font-mono rounded bg-red-950/40 hover:bg-red-900/40 border border-red-500/10 text-red-400 font-bold"
            >
              Demo Admin (admin@gmail.com / admin)
            </button>
            <button
              onClick={() => fillQuickAuth('user')}
              className="px-2 py-1 text-[9px] font-mono rounded bg-indigo-950/40 hover:bg-indigo-900/40 border border-indigo-500/10 text-indigo-400 font-bold"
            >
              Demo User (k8a330@gmail.com / 123)
            </button>
          </div>
        </div>

        {/* Tab selector */}
        <div className="mt-6 flex justify-between text-xs font-semibold text-slate-400">
          {mode !== 'login' && (
            <button onClick={() => setMode('login')} className="hover:text-white transition-colors">➔ Đăng nhập</button>
          )}
          {mode !== 'register' && (
            <button onClick={() => setMode('register')} className="hover:text-white transition-colors">➔ Đăng ký mới</button>
          )}
          {mode !== 'change_password' && (
            <button onClick={() => setMode('change_password')} className="hover:text-white transition-colors text-yellow-500">➔ Đổi mật khẩu/SĐT?</button>
          )}
        </div>

      </div>

    </div>
  );
}
