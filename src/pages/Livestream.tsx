import { useState, useEffect, useRef } from 'react';
import { User, LiveMatch, LiveEvent } from '../types';
import { Tv, Sparkles, Heart, ThumbsUp, Share2, MessageSquare, ShieldAlert, Award, Star, ListFilter } from 'lucide-react';

interface LivestreamProps {
  currentUser: User | null;
  liveMatch: LiveMatch | null;
  onUpdateMatch: (updated: LiveMatch) => void;
  onNavigate: (view: string) => void;
}

interface HeartBubble {
  id: number;
  color: string;
  left: number;
}

interface ChatMessage {
  id: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  isVip?: boolean;
}

export default function Livestream({ currentUser, liveMatch, onUpdateMatch, onNavigate }: LivestreamProps) {
  // Floating hearts trigger state
  const [hearts, setHearts] = useState<HeartBubble[]>([]);
  const heartCounter = useRef(0);

  // Likes and Shares
  const [likes, setLikes] = useState(1402);
  const [hasLiked, setHasLiked] = useState(false);
  const [shares, setShares] = useState(482);
  const [viewsCount, setViewsCount] = useState(8542);

  // Chat comments
  const [chats, setChats] = useState<ChatMessage[]>([
    { id: "ch-1", senderName: "Bâng_Aoi_King", senderAvatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=fansgp", content: "SGP đánh dồn sát thương khét quá, game này SGP dứt điểm sớm thôi!" },
    { id: "ch-2", senderName: "Maris_FanBoy", senderAvatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=fanvgm", content: "Cố lên VGM ơi, thủ nhà vẫn sừng sững!", isVip: true },
    { id: "ch-3", senderName: "Kael.AOV", senderAvatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=user3", content: "Krixi của Maris ảo diệu thực sự, combat giữ vị trí quá đỉnh" }
  ]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Admin controls fields
  const [scoreA, setScoreA] = useState(1);
  const [scoreB, setScoreB] = useState(1);
  const [customEvent, setCustomEvent] = useState('');
  const [customEventType, setCustomEventType] = useState<'kill' | 'tower' | 'dragon' | 'caesar'>('kill');
  const [banA, setBanA] = useState('Elsu, Richter, Keera');
  const [pickA, setPickA] = useState('Aoi, Y\'bneth, Stuart');
  const [banB, setBanB] = useState('Rouie, Kaine, Aya');
  const [pickB, setPickB] = useState('Nakroth, Thane, Violet');
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminMsg, setAdminMsg] = useState('');

  // Sync state if match changes from SSE background simulation
  useEffect(() => {
    if (liveMatch) {
      setScoreA(liveMatch.scoreA);
      setScoreB(liveMatch.scoreB);
      setBanA(liveMatch.banA.join(', '));
      setPickA(liveMatch.pickA.join(', '));
      setBanB(liveMatch.banB.join(', '));
      setPickB(liveMatch.pickB.join(', '));
    }
  }, [liveMatch]);

  // Simulated streamer live feed details or chat bots trigger
  useEffect(() => {
    const chatBots = [
      "Trận đấu mãn nhãn thực sự!",
      "Lai Bâng múa Aoi tinh tế quá",
      "VGM lật kèo không tưởng được không cả nhà ơi?",
      "Trận này là BO5 cực kỳ chung kết luôn",
      "Anh em click tim mạnh lên cho livestream bay màu đỏ nào ❤️",
      "Krixi trợ lý trả lời hết các câu hỏi ở widget góc phải kìa anh em, hỏi thử đi",
      "Admin update ban/pick gắt quá",
      "First blood cực khét",
      "Giao tranh nổ ra liên tục vàng chênh lệch không đáng kể."
    ];

    const interval = setInterval(() => {
      // Add random chat message
      const randomMsg = chatBots[Math.floor(Math.random() * chatBots.length)];
      const randomName = `AOV_Fan_${Math.floor(Math.random() * 900) + 100}`;
      setChats(prev => [
        ...prev,
        {
          id: `ch-bot-${Date.now()}`,
          senderName: randomName,
          senderAvatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${randomName}`,
          content: randomMsg,
          isVip: Math.random() > 0.7
        }
      ]);

      // Gradually increase view count
      setViewsCount(prev => prev + Math.floor(Math.random() * 15) - 5);
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  // Scroll to bottom of chat logs
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats]);

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newChat: ChatMessage = {
      id: `ch-user-${Date.now()}`,
      senderName: currentUser?.fullName || "Tuyển Thủ Ẩn Danh",
      senderAvatar: currentUser?.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${currentUser?.id || 'guest'}`,
      content: chatInput,
      isVip: currentUser?.role === 'admin'
    };

    setChats(prev => [...prev, newChat]);
    setChatInput('');
  };

  const popHeart = () => {
    const colors = ['#EF4444', '#EC4899', '#F43F5E', '#D946EF', '#FA8C16', '#FADB14'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const randomLeft = Math.floor(Math.random() * 120) - 60; // deviation offset
    
    heartCounter.current += 1;
    const newHeart: HeartBubble = {
      id: heartCounter.current,
      color: randomColor,
      left: randomLeft
    };

    setHearts(prev => [...prev, newHeart]);

    // Cleanup heart after animation completes
    setTimeout(() => {
      setHearts(prev => prev.filter(h => h.id !== newHeart.id));
    }, 1800);

    // Increment simulated hearts count
    if (liveMatch) {
      // Temporarily mock interaction increment
      setLikes(prev => prev + 1);
    }
  };

  const handleLikeClick = async () => {
    if (!liveMatch) return;
    setHasLiked(!hasLiked);
    setLikes(prev => hasLiked ? prev - 1 : prev + 1);
    
    // Quick pop hearts!
    popHeart();
    setTimeout(popHeart, 100);
    setTimeout(popHeart, 200);
  };

  const handleShareClick = () => {
    setShares(prev => prev + 1);
    const mockFeedUrl = window.location.href;
    navigator.clipboard.writeText(mockFeedUrl);
    alert("🔗 Đã sao chép liên kết Livestream giải đấu kịch tính! Hãy chia sẻ cho bạn bè cùng vào xem và cỗ vũ nhé.");
  };

  // Admin submit livestream states changes
  const handleAdminUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || currentUser.role !== 'admin') {
      alert("Chỉ quản trị viên mới được quyền thực hiện chức năng này.");
      return;
    }

    setAdminLoading(true);
    setAdminMsg('');

    try {
      const response = await fetch('/api/matches/match-live/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          adminId: currentUser.id,
          scoreA,
          scoreB,
          banA: banA.split(',').map(s => s.trim()),
          pickA: pickA.split(',').map(s => s.trim()),
          banB: banB.split(',').map(s => s.trim()),
          pickB: pickB.split(',').map(s => s.trim()),
          customEventText: customEvent.trim() || undefined,
          customEventType
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setAdminMsg("Cập nhật luồng trực tiếp và phát sóng kết quả thành công!");
      setCustomEvent('');
      onUpdateMatch(data.match);
    } catch (err: any) {
      alert("Lỗi admin: " + err.message);
    } finally {
      setAdminLoading(false);
    }
  };

  const activeMatch = liveMatch || {
    teamA: "Thạnh Mỹ Warriors",
    teamB: "D'Ran Phantoms",
    scoreA: 1,
    scoreB: 1,
    teamGoldA: 42300,
    teamGoldB: 41500,
    teamKillsA: 8,
    teamKillsB: 7,
    stage: "Chung Kết Tổng Đơn Dương (BO5)",
    banA: ["Elsu", "Richter"],
    pickA: ["Aoi", "Y'bneth"],
    banB: ["Rouie", "Kaine"],
    pickB: ["Nakroth", "Thane"],
    liveEvents: []
  };

  const formatGold = (num: number) => {
    if (!num) return '0.0k';
    return `${(num / 1000).toFixed(1)}k`;
  };

  return (
    <div id="livestream-viewport" className="grid grid-cols-1 lg:grid-cols-3 gap-6 page-enter">
      
      {/* --- COLUMN 1 & 2: STREAM REEL PLAYER & DETAILS --- */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Streams player container */}
        <div 
          id="live-stream-player-box"
          className="relative bg-slate-950 rounded-2xl border border-red-500/20 shadow-2xl overflow-hidden aspect-video group"
        >
          
          {/* Real-time Heart emoji floating deck */}
          <div className="absolute right-10 bottom-16 z-20 pointer-events-none h-48 w-24">
            {hearts.map((h) => (
              <div 
                key={h.id}
                className="heart-bubble"
                style={{
                  color: h.color,
                  left: `${h.left}px`,
                  bottom: '0px'
                }}
              >
                <Heart className="w-5 h-5 fill-current" />
              </div>
            ))}
          </div>

          {/* HTML Stream Simulation Canvas Graphics Overlay */}
          <div className="absolute inset-0 z-0 bg-[#080811] flex flex-col items-center justify-center">
            
            {/* Arena of Valor virtual visual background loop placeholder */}
            <div className="absolute inset-0 bg-cover bg-center opacity-10 bg-[url('https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80')]" />
            
            {/* Top real-time HUD */}
            <div className="absolute top-4 left-4 right-4 z-10 font-mono flex items-center justify-between text-xs bg-black/60 backdrop-blur px-3 py-2 rounded-lg border border-yellow-500/10">
              {/* Score HUD */}
              <div className="flex items-center space-x-2.5">
                <span className="font-extrabold text-red-500 tracking-wider">SGP</span>
                <span className="bg-red-600/20 text-red-400 px-1.5 py-0.5 rounded font-black text-[10px]">
                  {activeMatch.teamKillsA} Mạng
                </span>
                <span className="text-yellow-500 font-bold">{formatGold(activeMatch.teamGoldA || 42300)} Vàng</span>
              </div>
              
              {/* Central Clock */}
              <div className="flex items-center space-x-1.5 font-bold text-white bg-red-950/40 px-3 py-0.5 rounded-full border border-red-500/20">
                <span className="h-1.5 w-1.5 bg-red-500 rounded-full animate-ping"></span>
                <span>TRỰC TIẾP</span>
              </div>

              {/* VGM HUD */}
              <div className="flex items-center space-x-2.5">
                <span className="text-yellow-500 font-bold">{formatGold(activeMatch.teamGoldB || 41500)} Vàng</span>
                <span className="bg-blue-600/20 text-blue-400 px-1.5 py-0.5 rounded font-black text-[10px]">
                  {activeMatch.teamKillsB} Mạng
                </span>
                <span className="font-extrabold text-blue-400 tracking-wider">VGM</span>
              </div>
            </div>

            {/* Simulated Live Esports gameplay graphics animation */}
            <div className="text-center z-10 p-4 max-w-md">
              <div className="bg-red-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto border border-yellow-500/20 shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-pulse mb-3">
                <Tv className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">{activeMatch.stage}</h3>
              <p className="text-xs text-slate-400 mt-1 font-mono">{activeMatch.teamA} VS {activeMatch.teamB}</p>
              
              <div className="flex items-center justify-center space-x-6 my-4 bg-slate-900/60 backdrop-blur px-4 py-3 rounded-xl border border-slate-800">
                <div className="text-center">
                  <span className="text-base font-black text-white block">{activeMatch.teamA}</span>
                  <span className="text-[10px] text-red-400 uppercase tracking-widest font-bold">ALPHA SGP</span>
                </div>
                <div className="text-2xl font-black text-yellow-500 px-3.5 py-1 bg-black/60 rounded-lg border border-yellow-500/20 min-w-[80px]">
                  {activeMatch.scoreA} - {activeMatch.scoreB}
                </div>
                <div className="text-center">
                  <span className="text-base font-black text-white block">{activeMatch.teamB}</span>
                  <span className="text-[10px] text-blue-400 uppercase tracking-widest font-bold">OMEGA VGM</span>
                </div>
              </div>

              {/* Dynamic live notifications running overlay ticker */}
              <div className="bg-slate-900/80 p-2.5 rounded border border-[#da292a]/25 text-[10px] text-slate-300 min-h-[48px] flex items-center justify-center overflow-hidden">
                {activeMatch.liveEvents && activeMatch.liveEvents.length > 0 ? (
                  <div className="animate-pulse">
                    <span className="text-yellow-500 font-bold pr-1.5">[{activeMatch.liveEvents[activeMatch.liveEvents.length-1].time}]</span>
                    {activeMatch.liveEvents[activeMatch.liveEvents.length-1].description}
                  </div>
                ) : (
                  <span className="text-slate-500">Đang chuẩn bị cập nhật chiến tích tà thần...</span>
                )}
              </div>
            </div>

            {/* Bottom streams control deck (simulation widgets) */}
            <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between text-[10px] font-mono bg-black/60 backdrop-blur px-3 py-1.5 rounded-lg">
              <span className="text-slate-400 flex items-center gap-1">
                <Tv className="w-3.5 h-3.5 text-red-500" />
                <span>Nguồn luồng chính: 1080p60fps</span>
              </span>
              <span className="text-red-400 font-bold uppercase animate-pulse">{viewsCount.toLocaleString('vi-VN')} Đang xem</span>
            </div>

          </div>

        </div>

        {/* Stream Actions Panel (Like, Tim, Share, Stats) */}
        <div id="stream-interactions" className="p-4 bg-[#121226]/80 rounded-2xl border border-indigo-950/40 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-black text-white leading-none">Trận Chung Kết Quốc Gia 2026: SGP vs VGM</h2>
            <p className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest mt-1.5">Giải đấu chính thức Liên Quân Mobile Đấu Trường Danh Vọng</p>
          </div>
          
          <div className="flex items-center space-x-2">
            
            {/* Like */}
            <button
              id="like-stream-btn"
              onClick={handleLikeClick}
              className={`flex items-center space-x-1.5 py-1.5 px-3 rounded-full text-xs font-bold uppercase transition-all ${
                hasLiked 
                  ? 'bg-red-650 text-white border border-red-500' 
                  : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800'
              }`}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>{likes.toLocaleString('vi-VN')}</span>
            </button>

            {/* Tim button (Floating heart trigger) */}
            <button
              id="tim-stream-btn"
              onClick={popHeart}
              className="flex items-center space-x-1.5 py-1.5 px-3 rounded-full text-xs font-bold uppercase bg-gradient-to-r from-pink-600 to-red-600 text-white hover:opacity-90 active:scale-95 border border-pink-500/10 shadow-[0_0_10px_rgba(219,39,119,0.3)]"
            >
              <Heart className="w-3.5 h-3.5 fill-current" />
              <span>Thả Tim</span>
            </button>

            {/* Share */}
            <button
              id="share-stream-btn"
              onClick={handleShareClick}
              className="flex items-center space-x-1.5 py-1.5 px-3 rounded-full text-xs font-bold uppercase bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{shares.toLocaleString('vi-VN')}</span>
            </button>

          </div>
        </div>

        {/* Bans and Picks display deck */}
        <div id="ban-pick-display-deck" className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* SGP Bans Picks */}
          <div className="bg-[#121226]/85 p-4 rounded-xl border-l-[3px] border-red-600">
            <span className="text-[9px] text-red-500 font-black tracking-widest uppercase block">Đội Hình Thạnh Mỹ Warriors</span>

            <div className="mt-2.5 grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Picks (Chọn):</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {activeMatch.pickA.map((p, i) => (
                    <span key={i} className="text-[10px] bg-red-950/40 border border-red-500/20 px-2 py-0.5 rounded text-red-400 font-bold font-mono">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Bans (Cấm):</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {activeMatch.banA.map((b, i) => (
                    <span key={i} className="text-[10px] bg-slate-900 px-1.5 py-0.5 rounded text-slate-400 line-through">
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* VGM Bans Picks */}
          <div className="bg-[#121226]/85 p-4 rounded-xl border-l-[3px] border-blue-600">
            <span className="text-[9px] text-blue-400 font-black tracking-widest uppercase block">Đội Hình D'Ran Phantoms</span>
            
            <div className="mt-2.5 grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Picks (Chọn):</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {activeMatch.pickB.map((p, i) => (
                    <span key={i} className="text-[10px] bg-blue-950/40 border border-blue-500/20 px-2 py-0.5 rounded text-blue-400 font-bold font-mono">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Bans (Cấm):</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {activeMatch.banB.map((b, i) => (
                    <span key={i} className="text-[10px] bg-slate-900 px-1.5 py-0.5 rounded text-slate-400 line-through">
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* --- DEDICATED ADMIN STAT CONTROL PANEL --- */}
        {currentUser?.role === 'admin' && (
          <div 
            id="admin-livestream-controller"
            className="p-5 bg-[#171113] border border-red-700/30 rounded-2xl shadow-xl"
          >
            <div className="flex items-center space-x-2 border-b border-red-500/10 pb-2 mb-4">
              <ShieldAlert className="w-4 h-4 text-red-500 animate-pulse" />
              <h3 className="text-xs font-black text-white uppercase tracking-widest">
                Admin Central: Bảng Cấu Hình Trực Tiếp & Kết Quả
              </h3>
            </div>

            {adminMsg && (
              <div className="mb-4 bg-green-950/30 border border-green-500/30 text-green-300 text-xs p-3 rounded-lg">
                {adminMsg}
              </div>
            )}

            <form onSubmit={handleAdminUpdate} className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                
                {/* Score SGP */}
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Tỉ số SGP</label>
                  <input
                    type="number"
                    value={scoreA}
                    onChange={(e) => setScoreA(Number(e.target.value))}
                    className="w-full bg-slate-950 text-white rounded p-2 text-xs border border-slate-800"
                  />
                </div>

                {/* Score VGM */}
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Tỉ số VGM</label>
                  <input
                    type="number"
                    value={scoreB}
                    onChange={(e) => setScoreB(Number(e.target.value))}
                    className="w-full bg-slate-950 text-white rounded p-2 text-xs border border-slate-800"
                  />
                </div>

                {/* Ban SGP */}
                <div className="col-span-2">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Ban SGP (ngăn cách bằng phẩy)</label>
                  <input
                    type="text"
                    value={banA}
                    onChange={(e) => setBanA(e.target.value)}
                    className="w-full bg-slate-950 text-white rounded p-2 text-xs border border-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Pick SGP */}
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Picks SGP (ngăn cách bằng phẩy)</label>
                  <input
                    type="text"
                    value={pickA}
                    onChange={(e) => setPickA(e.target.value)}
                    className="w-full bg-slate-950 text-white rounded p-1.5 text-xs border border-slate-800 font-mono text-red-400"
                  />
                </div>

                {/* Pick VGM */}
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Picks VGM (ngăn cách bằng phẩy)</label>
                  <input
                    type="text"
                    value={pickB}
                    onChange={(e) => setPickB(e.target.value)}
                    className="w-full bg-slate-950 text-white rounded p-1.5 text-xs border border-slate-800 font-mono text-blue-400"
                  />
                </div>

                {/* Event text trigger */}
                <div>
                  <label className="text-[10px] text-yellow-500 font-bold uppercase tracking-wider block mb-1">Phát sự kiện đấu thời gian thực</label>
                  <div className="flex space-x-1.5">
                    <select
                      value={customEventType}
                      onChange={(e) => setCustomEventType(e.target.value as any)}
                      className="bg-slate-950 text-slate-300 text-xs rounded border border-slate-850 p-1"
                    >
                      <option value="kill">KILL</option>
                      <option value="tower">TRỤ</option>
                      <option value="dragon">RỒNG</option>
                      <option value="caesar">CAESAR</option>
                    </select>
                    <input
                      type="text"
                      placeholder="e.g. Lai Bâng cướp tà thần!"
                      value={customEvent}
                      onChange={(e) => setCustomEvent(e.target.value)}
                      className="flex-1 bg-slate-950 text-white rounded p-1.5 text-xs border border-slate-800 placeholder-slate-600"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={adminLoading}
                className="w-full bg-red-650 hover:bg-red-700 text-white text-xs font-bold py-2 px-4 rounded shadow-md uppercase tracking-wider transition-all"
              >
                {adminLoading ? "Đang phát tỏa kết quả..." : "Kích hoạt phát sóng cập nhật và cảnh báo trận đấu ⚡️"}
              </button>
            </form>
          </div>
        )}

      </div>

      {/* --- COLUMN 3: REAL-TIME LIVESTREAM CHAT & COMBAT EVENT HIGHLIGHT LOGS --- */}
      <div className="space-y-6">
        
        {/* Livestream real-time chat box */}
        <div 
          id="livestream-chat-box"
          className="bg-[#121226]/80 rounded-2xl border border-indigo-950/50 shadow-2xl flex flex-col h-[400px]"
        >
          {/* Box Header */}
          <div className="p-3.5 border-b border-indigo-950/40 bg-[#09090e] rounded-t-2xl flex items-center justify-between">
            <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <span className="h-2 w-2 bg-red-500 rounded-full animate-pulse inline-block"></span>
              Phòng Trò Chuyện Trực Tiếp ({chats.length})
            </span>
            <span className="text-[10px] text-slate-500 font-mono uppercase font-bold">Quản lý tự động</span>
          </div>

          {/* Chat scrolling feed */}
          <div className="flex-1 p-3 overflow-y-auto space-y-2.5 bg-slate-950/40">
            {chats.map((c) => (
              <div 
                key={c.id} 
                id={`livechat-msg-${c.id}`}
                className="text-xs leading-relaxed hover:bg-slate-900/40 p-1 rounded transition-colors"
              >
                <div className="flex items-start space-x-2">
                  <img
                    src={c.senderAvatar}
                    alt="avatar"
                    className="w-5.5 h-5.5 rounded-full border border-indigo-950 bg-slate-900"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-1">
                      <span className={`font-mono font-bold ${c.isVip ? 'text-yellow-500' : 'text-slate-300'}`}>
                        {c.senderName}
                      </span>
                      {c.isVip && (
                        <span className="text-[8px] bg-yellow-500/10 text-yellow-500 px-1 rounded uppercase font-black tracking-tighter leading-none py-0.2">VIP</span>
                      )}
                    </div>
                    <p className="text-slate-200 mt-0.5 font-sans break-all">{c.content}</p>
                  </div>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Chat user input box */}
          <form 
            onSubmit={handleSendChat}
            className="p-3 bg-slate-950 border-t border-indigo-950/40 rounded-b-2xl flex items-center space-x-2"
          >
            <input
              id="livechat-user-input"
              type="text"
              placeholder="Nhập suy nghĩ của bạn về tỉ số..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 bg-slate-900 text-white rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-red-500 placeholder-slate-600 border border-slate-800"
            />
            <button
              id="livechat-submit-btn"
              type="submit"
              disabled={!chatInput.trim()}
              className="px-3.5 py-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-850 disabled:text-slate-500 text-white rounded text-xs font-bold transition-all uppercase"
            >
              Gửi
            </button>
          </form>
        </div>

        {/* Real-time Game Event logs list */}
        <div id="live-match-event-tracker" className="bg-[#121226]/80 rounded-2xl border border-indigo-950/50 shadow-2xl p-4">
          <span className="text-[9.5px] text-yellow-500 font-black tracking-widest block uppercase mb-3">
            ⚔️ BIÊN NIÊN SỰ KIỆN ĐẤU THỜI GIAN THỰC
          </span>
          <div className="max-h-56 overflow-y-auto space-y-3 font-mono">
            {activeMatch.liveEvents && activeMatch.liveEvents.length > 0 ? (
              activeMatch.liveEvents.slice().reverse().map((ev) => {
                const isKill = ev.type === 'kill';
                const isCaesar = ev.type === 'caesar';
                return (
                  <div key={ev.id} id={`event-${ev.id}`} className="p-2 border border-indigo-950 bg-slate-950/40 rounded text-[11px] leading-snug flex items-start space-x-2">
                    <span className={`px-1 py-0.2 text-[9px] uppercase font-black rounded ${
                      isKill 
                        ? 'bg-red-950 text-red-400' 
                        : isCaesar 
                        ? 'bg-yellow-950 text-yellow-400' 
                        : 'bg-slate-900 text-slate-350'
                    }`}>
                      {ev.time}
                    </span>
                    <span className="text-slate-300">{ev.description}</span>
                  </div>
                );
              })
            ) : (
              <p className="text-slate-500 text-xs text-center py-4 font-sans">Chưa có sự kiện nào diễn ra trong map đấu.</p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
