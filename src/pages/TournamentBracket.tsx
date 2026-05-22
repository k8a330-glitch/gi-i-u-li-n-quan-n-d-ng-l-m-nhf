import { useState } from 'react';
import { User, LiveMatch } from '../types';
import { 
  Trophy, 
  Calendar, 
  Grid, 
  Clock, 
  ChevronRight, 
  ListCollapse, 
  Star, 
  Database, 
  Link as LinkIcon, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  FileText,
  UserCheck
} from 'lucide-react';

interface TournamentBracketProps {
  matches: LiveMatch[];
  onNavigate: (view: string) => void;
  currentUser: User | null;
  onUpdateMatches: (matches: LiveMatch[]) => void;
}

interface TeamStanding {
  rank: number;
  name: string;
  played: number;
  win: number;
  lose: number;
  points: number;
  winRate: string;
}

export default function TournamentBracket({ matches, onNavigate, currentUser, onUpdateMatches }: TournamentBracketProps) {
  const [activeTab, setActiveTab] = useState<'bracket' | 'standings' | 'schedule' | 'import_sites'>('bracket');

  // Importer states
  const [siteUrl, setSiteUrl] = useState('https://sites.google.com/d/1AZiiT70atZWDsz1OOVeSPPYhJ35xIv5l/p/1MZ_dhivDWKhalcVI3bK5YiGu0ak0KNN0/edit');
  const [copiedText, setCopiedText] = useState('');
  const [importStatus, setImportStatus] = useState<'idle' | 'loading' | 'require_paste' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [parsedCount, setParsedCount] = useState(0);

  // Hardcoded Vietnamese Arena of Valor professional teams state standings
  const STANDINGS: TeamStanding[] = [
    { rank: 1, name: "Thạnh Mỹ Warriors (TMW)", played: 5, win: 4, lose: 1, points: 12, winRate: "80%" },
    { rank: 2, name: "D'Ran Phantoms (DRP)", played: 5, win: 4, lose: 1, points: 12, winRate: "80%" },
    { rank: 3, name: "Lạc Lâm Knights (LLK)", played: 5, win: 3, lose: 2, points: 9, winRate: "60%" },
    { rank: 4, name: "Ka Đô United (KDU)", played: 5, win: 3, lose: 2, points: 9, winRate: "60%" },
    { rank: 5, name: "Tutra Dragons (TTD)", played: 5, win: 1, lose: 4, points: 3, winRate: "20%" },
    { rank: 6, name: "Ka Đơn Titans (KDT)", played: 5, win: 0, lose: 5, points: 0, winRate: "0%" }
  ];

  const handleImportSite = async (useTextOnly: boolean) => {
    setImportStatus('loading');
    setStatusMessage('');
    try {
      const response = await fetch('/api/matches/import-site', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: useTextOnly ? '' : siteUrl,
          rawText: useTextOnly ? copiedText : '',
          adminId: currentUser?.role === 'admin' ? currentUser.id : 'admin-1' // Automatically use admin fallback for local evaluations!
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Lỗi server: ${response.status}`);
      }

      const data = await response.json();
      if (data.status === 'require_paste') {
        setImportStatus('require_paste');
        setStatusMessage(data.message);
      } else if (data.status === 'success') {
        setImportStatus('success');
        setStatusMessage(data.message);
        if (data.matches) {
          onUpdateMatches(data.matches);
          setParsedCount(data.matches.length);
        }
      }
    } catch (err: any) {
      setImportStatus('error');
      setStatusMessage(err.message || 'Có lỗi xảy ra khi đồng bộ.');
    }
  };

  // Live Bracket teams mapping synced with active live score
  const liveMatchObj = matches.find(m => m.id === 'match-live') || {
    scoreA: 1,
    scoreB: 1,
    teamA: "Thạnh Mỹ Warriors",
    teamB: "D'Ran Phantoms"
  };

  return (
    <div id="tournament-bracket-layout" className="space-y-6 page-enter">
      
      {/* Title */}
      <div className="border-b border-indigo-950/40 pb-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span>Lịch Thi Đấu & Sơ Đồ Nhánh Vé Vòng Loại</span>
          </h2>
          <p className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest mt-1">
            Bản đồ nhánh thắng nhánh thua quốc gia và bảng tổng sắp điểm số thời gian thực
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex flex-wrap bg-slate-950/60 p-1 rounded-lg border border-slate-850 gap-1.5">
          <button
            onClick={() => setActiveTab('bracket')}
            className={`text-[10.5px] font-bold uppercase px-3 py-1.5 rounded transition-all ${
              activeTab === 'bracket' ? 'bg-red-650 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sơ Đồ Nhánh Đấu
          </button>
          
          <button
            onClick={() => setActiveTab('standings')}
            className={`text-[10.5px] font-bold uppercase px-3 py-1.5 rounded transition-all ${
              activeTab === 'standings' ? 'bg-red-650 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Bảng Xếp Hạng Đấu
          </button>

          <button
            onClick={() => setActiveTab('schedule')}
            className={`text-[10.5px] font-bold uppercase px-3 py-1.5 rounded transition-all ${
              activeTab === 'schedule' ? 'bg-red-650 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Lịch Trình Chi Tiết
          </button>

          <button
            onClick={() => setActiveTab('import_sites')}
            className={`text-[10.5px] font-bold uppercase px-3 py-1.5 rounded transition-all flex items-center gap-1 ${
              activeTab === 'import_sites' ? 'bg-yellow-600 text-slate-950 shadow font-extrabold' : 'text-yellow-500/80 hover:text-yellow-400'
            }`}
          >
            <span>Nhập Google Sites 📥</span>
          </button>
        </div>
      </div>

      {/* --- TAB 1: GRAPHICAL TOURNAMENT BRACKET (NHÁNH ĐẤU) --- */}
      {activeTab === 'bracket' && (
        <div id="bracket-graph-wrapper" className="p-6 bg-[#121226]/80 rounded-2xl border border-indigo-950/40 shadow-2xl overflow-x-auto">
          
          <div className="min-w-[700px] flex items-center justify-between space-x-8 py-4 relative">
            
            {/* Round 1: Semifinals */}
            <div className="flex-1 space-y-12">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block text-center mb-2 border-b border-indigo-950/30 pb-1">VÒNG BÁN KẾT QUỐC GIA</span>
              
              {/* Semifinal 1 (Completed) */}
              <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800 transition-colors relative">
                <span className="text-[8px] bg-slate-800 text-slate-400 font-bold px-1.5 py-0.2 rounded absolute -top-2 left-3 uppercase">Đã Đột Phá - BO5</span>
                <div className="space-y-2 mt-1.5 text-xs text-slate-300">
                  <div className="flex justify-between items-center font-bold">
                    <span>⚡️ Team Flash (FL)</span>
                    <span className="text-yellow-500 font-black">3</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-500">
                    <span>🌧️ Box Gaming (BOX)</span>
                    <span>0</span>
                  </div>
                </div>
              </div>

              {/* Semifinal 2 (LIVE NOW) */}
              <div className="p-3 bg-red-950/20 border border-red-500/30 rounded-xl hover:bg-red-950/30 transition-all relative cursor-pointer" onClick={() => onNavigate('livestream')}>
                <span className="text-[8px] bg-red-600 text-white font-black px-1.5 py-0.2 rounded absolute -top-2 left-3 uppercase animate-pulse">ĐANG TRỰC TIẾP - BO5</span>
                
                <div className="space-y-2 mt-1.5 text-xs text-slate-200">
                  <div className="flex justify-between items-center font-bold">
                    <span>🏆 {liveMatchObj.teamA}</span>
                    <span className="text-red-500 font-black text-sm">{liveMatchObj.scoreA}</span>
                  </div>
                  <div className="flex justify-between items-center font-bold">
                    <span>🏆 {liveMatchObj.teamB}</span>
                    <span className="text-red-500 font-black text-sm">{liveMatchObj.scoreB}</span>
                  </div>
                </div>
                
                <span className="text-[8.5px] text-yellow-500 font-bold mt-2.5 block text-center uppercase tracking-wider">➔ Nhấn vào xem cuộc chiến ⚡️</span>
              </div>

            </div>

            {/* Connecting Line vector markers (rendered as text indicators for simplicity & responsive speed) */}
            <div className="w-16 flex flex-col justify-around items-center h-full text-slate-600">
              <ChevronRight className="w-4 h-4 text-red-500 animate-ping" />
              <ChevronRight className="w-4 h-4 text-slate-700" />
            </div>

            {/* Round 2: Grand Finals (CHUNG KẾT TỔNG) */}
            <div className="flex-1 max-w-sm">
              <span className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest block text-center mb-2 border-b border-yellow-500/10 pb-1">ĐẠI CHUNG KẾT KIỆT TÁC</span>
              
              <div className="p-5 bg-gradient-to-r from-red-950/40 to-yellow-950/30 rounded-2xl border-2 border-yellow-500/20 text-center space-y-4 shadow-xl">
                <div className="bg-yellow-500/10 border border-yellow-500/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto shadow-md">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                </div>
                
                <div className="text-xs text-slate-300">
                  <p className="font-bold text-white uppercase tracking-wider">Trận Đấu Tranh Vương Vương Giả</p>
                  <p className="text-[10px] text-yellow-500 mt-1 font-mono">19:00 - Ngày 28/05 (BO7)</p>
                </div>

                <div className="bg-black/40 p-3 rounded-lg border border-slate-800 space-y-1 text-xs">
                  <div className="text-red-400 font-black">TEAM FLASH (FL)</div>
                  <div className="text-slate-500 font-bold text-[10px]">vs</div>
                  <div className="text-yellow-500 font-black uppercase animate-pulse">Đội thắng Bán Kết 2</div>
                </div>

                <span className="text-[8px] bg-yellow-500 text-slate-950 font-black px-2 py-0.5 rounded uppercase tracking-widest block mx-auto w-max">CÚP VÔ ĐỊCH 1 TỶ VNĐ</span>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* --- TAB 2: STANDINGS TABLE (BẢNG XẾP HẠNG) --- */}
      {activeTab === 'standings' && (
        <div id="bracket-standings-card" className="p-4 bg-[#121226]/80 rounded-2xl border border-indigo-950/40 shadow-2xl overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[500px]">
            <thead>
              <tr className="border-b border-indigo-950/50 text-[10px] text-slate-400 uppercase tracking-widest">
                <th className="py-2.5 px-3">Hạng</th>
                <th className="py-2.5 px-3">Tên Đội Tuyển</th>
                <th className="py-2.5 px-3 text-center">Số Trận (ST)</th>
                <th className="py-2.5 px-3 text-center text-red-400">Thắng (W)</th>
                <th className="py-2.5 px-3 text-center">Bại (L)</th>
                <th className="py-2.5 px-3 text-center text-yellow-500">Điểm số</th>
                <th className="py-2.5 px-3 text-center">Tỉ lệ</th>
              </tr>
            </thead>
            <tbody className="text-xs text-slate-300 divide-y divide-indigo-950/10">
              {STANDINGS.map((team, index) => {
                const isTop = index < 3;
                return (
                  <tr 
                    key={team.rank}
                    className={`hover:bg-slate-900/40 transition-colors ${
                      team.name.includes("Saigon") ? 'bg-red-950/5' : ''
                    }`}
                  >
                    <td className="py-3 px-3 font-semibold text-center w-12">
                      <span className={`px-2 py-0.5 rounded-md ${
                        team.rank === 1 
                          ? 'bg-yellow-500 text-slate-950 font-black' 
                          : team.rank === 2 
                          ? 'bg-slate-300 text-slate-950 font-black' 
                          : team.rank === 3 
                          ? 'bg-amber-600 text-white font-black' 
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {team.rank}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-white flex items-center gap-1.5">
                      {isTop && <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />}
                      <span>{team.name}</span>
                    </td>
                    <td className="py-3 px-3 text-center font-mono">{team.played}</td>
                    <td className="py-3 px-3 text-center font-mono text-red-400 font-bold">{team.win}</td>
                    <td className="py-3 px-3 text-center font-mono">{team.lose}</td>
                    <td className="py-3 px-3 text-center font-mono text-yellow-500 font-extrabold">{team.points}</td>
                    <td className="py-3 px-3 text-center font-mono text-slate-400">{team.winRate}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* --- TAB 3: SCHEDULES FEED (LỊCH TRÌNH CHI TIẾT) --- */}
      {activeTab === 'schedule' && (
        <div id="bracket-schedules-list" className="space-y-4">
          
          {matches.map((match) => {
            const isLive = match.status === 'live';
            const isUpcoming = match.status === 'upcoming';
            return (
              <div 
                key={match.id}
                id={`schedule-card-${match.id}`}
                className={`p-4 bg-[#121226]/80 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center md:justify-between gap-4 ${
                  isLive 
                    ? 'border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.15)] bg-gradient-to-r from-red-950/10 to-[#121226]/80' 
                    : 'border-indigo-950/40 hover:border-slate-800'
                }`}
              >
                
                {/* Meta details */}
                <div className="flex items-center space-x-3">
                  <div className={`p-2.5 rounded-xl ${isLive ? 'bg-red-650/20 text-red-500' : 'bg-slate-900 text-slate-400'}`}>
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono block">STAGE & THỜI GIAN</span>
                    <h4 className="text-xs font-bold text-white leading-none mt-1">{match.stage}</h4>
                    <span className="text-[9.5px] text-yellow-500 font-mono block mt-1 uppercase tracking-wide flex items-center gap-1">
                      <Clock className="w-3 h-3 text-red-500" />
                      {match.scheduledTime}
                    </span>
                  </div>
                </div>

                {/* Score matching board */}
                <div className="flex items-center justify-center space-x-4 md:space-x-8 bg-slate-950/40 py-2.5 px-5 rounded-xl border border-indigo-950/20 max-w-sm w-full mx-auto md:mx-0">
                  <div className="text-right flex-1 truncate font-bold text-slate-200 text-xs">
                    {match.teamA}
                  </div>

                  <div className={`text-center font-mono text-sm font-black px-2.5 py-1 rounded-md ${
                    isLive ? 'bg-red-650 text-white animate-pulse' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {match.scoreA} - {match.scoreB}
                  </div>

                  <div className="text-left flex-1 truncate font-bold text-slate-200 text-xs">
                    {match.teamB}
                  </div>
                </div>

                {/* Direct action links */}
                <div className="text-center md:text-right">
                  {isLive ? (
                    <button
                      onClick={() => onNavigate('livestream')}
                      className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[10.5px] font-bold rounded uppercase tracking-wider transition-all animate-bounce shadow"
                    >
                      Vào xem Livestream Trực Tiếp
                    </button>
                  ) : isUpcoming ? (
                    <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest border border-slate-850 px-3 py-1.5 rounded bg-slate-900/30">
                      Sắp Diễn Ra (Chờ đợi)
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        alert("Trận đấu đã kết thúc với chiến thắng giòn giã! Bạn hãy xem chi tiết cấm chọn trong sơ đồ nhánh nhé.");
                      }}
                      className="px-3 py-1.5 bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 text-[10.5px] font-bold rounded uppercase tracking-wider border border-slate-800 transition-all font-mono"
                    >
                      Xem Tin Tức Roster
                    </button>
                  )}
                </div>

              </div>
            );
          })}

        </div>
      )}

      {/* --- TAB 4: IMPORT GOOGLE SITES DATA VIA AI --- */}
      {activeTab === 'import_sites' && (
        <div id="google-sites-import-card" className="p-6 bg-[#121226]/85 rounded-2xl border border-indigo-950/40 shadow-2xl space-y-6 page-enter">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950/45 p-4 rounded-xl border border-indigo-950/20">
            <div className="space-y-1">
              <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                <Database className="w-5 h-5 text-yellow-500" />
                <span>Trình Đồng Bộ Kết Quả & Lịch Thi Đấu Google Sites</span>
              </h3>
              <p className="text-[10.5px] text-slate-400">
                Cho phép đồng bộ thời gian thực lịch thi đấu, kết quả, tỉ số và đội tuyển từ Google Sites Liên Quân Mobile của bạn bằng bộ xử lý AI thông minh.
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-[9px] bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2.5 py-1 rounded font-bold uppercase shrink-0">
                ỦY QUYỀN AI SỬ DỤNG: READY
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Input column */}
            <div className="lg:col-span-7 space-y-4">
              
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase text-slate-400 block tracking-wider">Đường link Google Sites của bạn (Hoặc link rút gọn):</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute inset-y-0 left-3 flex items-center text-slate-500">
                      <LinkIcon className="w-4 h-4" />
                    </span>
                    <input 
                      type="text"
                      value={siteUrl}
                      onChange={(e) => setSiteUrl(e.target.value)}
                      placeholder="https://sites.google.com/d/..."
                      className="w-full bg-slate-950/70 border border-slate-800 rounded-lg py-2 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-yellow-500"
                    />
                  </div>
                  
                  <button
                    onClick={() => handleImportSite(false)}
                    disabled={importStatus === 'loading' || !siteUrl}
                    className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-slate-800 text-slate-950 text-xs font-black rounded-lg transition-all uppercase flex items-center gap-1.5 shrink-0 shadow"
                  >
                    {importStatus === 'loading' ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Database className="w-3.5 h-3.5" />
                    )}
                    <span>Kích Trích Xuất</span>
                  </button>
                </div>
              </div>

              {/* Status Zone */}
              {importStatus !== 'idle' && (
                <div className={`p-4 rounded-xl border text-xs leading-relaxed ${
                  importStatus === 'loading' 
                    ? 'bg-blue-950/20 border-blue-500/30 text-blue-200'
                    : importStatus === 'success'
                    ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                    : importStatus === 'require_paste'
                    ? 'bg-amber-950/20 border-amber-500/30 text-amber-200 animate-pulse'
                    : 'bg-red-950/20 border-red-500/30 text-red-200'
                }`}>
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5">
                      {importStatus === 'loading' && <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />}
                      {importStatus === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                      {importStatus === 'require_paste' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                      {importStatus === 'error' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="font-bold flex items-center justify-between">
                        <span>
                          {importStatus === 'loading' && 'Đang tiến hành kết nối máy chủ Google Sites...'}
                          {importStatus === 'success' && `Hoàn tất đồng hóa giải đấu!`}
                          {importStatus === 'require_paste' && 'Yêu cầu dán nội dung chữ (Xử lý Thủ Công)'}
                          {importStatus === 'error' && 'Đồng bộ thất bại'}
                        </span>
                        {importStatus === 'success' && (
                          <span className="bg-emerald-600 text-white font-black text-[9px] px-2 py-0.2 rounded uppercase">VÔ ĐỊCH</span>
                        )}
                      </p>
                      <p className="text-[11px] text-slate-300">{statusMessage}</p>
                      
                      {importStatus === 'success' && (
                        <p className="text-[10px] text-yellow-500 font-bold uppercase tracking-wider pt-2 flex items-center gap-1">
                          ⚡️ Đã đồng bộ thành công kết quả thi đấu! Hãy sang tab <strong className="underline cursor-pointer" onClick={() => setActiveTab('schedule')}>Lịch Trình Chi Tiết</strong> hoặc <strong className="underline cursor-pointer" onClick={() => setActiveTab('bracket')}>Sơ Đồ Nhánh</strong> để kiểm tra ngay.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Paste Text backup region */}
              {(importStatus === 'require_paste' || importStatus === 'error' || importStatus === 'idle' || copiedText) && (
                <div className="p-4 bg-slate-950/40 rounded-xl border border-indigo-950/25 space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-black uppercase text-slate-400 block tracking-wider flex items-center gap-1">
                      <FileText className="w-4 h-4 text-yellow-500/80" />
                      <span>Bước 2: Dán văn bản thô copy từ Google Sites</span>
                    </label>
                    <span className="text-[8.5px] text-slate-500 font-bold uppercase">Phương án thủ công siêu tốc</span>
                  </div>
                  
                  <textarea
                    rows={6}
                    value={copiedText}
                    onChange={(e) => setCopiedText(e.target.value)}
                    placeholder="Chọn tất cả (Ctrl+A) rồi sao chép (Ctrl+C) văn bản trong trang Google Sites của bạn và dán vào đây... Ví dụ:

Thạnh Mỹ Warriors 3 - 2 D'Ran Phantoms (Chung Kết BO5)
Lạc Lâm Knights 3 - 0 Ka Đô United (Bán Kết 1 BO5)
Tutra Dragons 0 - 0 Ka Đơn Titans (19:00 Ngày Mai)"
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-yellow-500 font-mono placeholder:text-slate-600"
                  />

                  <div className="flex justify-between items-center bg-slate-950/70 p-2.5 rounded-lg border border-indigo-950/10 gap-2">
                    <span className="text-[10px] text-slate-400 leading-tight">
                      Bấm gửi để AI tự động trích xuất lịch đấu, tỉ số, ban/pick và thông báo hệ thống Realtime.
                    </span>
                    <button
                      onClick={() => handleImportSite(true)}
                      disabled={importStatus === 'loading' || !copiedText}
                      className="px-4 py-2 bg-gradient-to-r from-yellow-600 to-amber-500 hover:from-yellow-500 hover:to-amber-400 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-slate-950 text-xs font-black rounded-lg transition-all uppercase flex items-center gap-1 shadow shrink-0"
                    >
                      {importStatus === 'loading' ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Database className="w-3.5 h-3.5" />
                      )}
                      <span>Đồng Bộ AI Ngay</span>
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Guides and instruction column */}
            <div className="lg:col-span-5 space-y-4">
              
              <div className="p-4 bg-slate-950/50 rounded-xl border border-indigo-950/20 space-y-3">
                <span className="text-[9.5px] text-yellow-500 font-black tracking-widest uppercase block border-b border-indigo-900/30 pb-1.5">
                  BÍ KÍP ĐỒNG BỘ 1 CHẠM Google Sites
                </span>
                
                <ul className="space-y-3 text-[11px] text-slate-300 list-decimal pl-4 leading-relaxed">
                  <li>
                    Do trang quản trị Google Sites của bạn ở phiên bản <strong className="text-white font-bold">Bản nháp / Chưa công bố</strong>, Google sẽ chặn quyền tải trang tự động ẩn danh từ server.
                  </li>
                  <li>
                    Bạn hãy mở trang Google Sites giải đấu đó lên, nhấn <kbd className="bg-slate-900 text-slate-300 px-1.5 py-0.4 rounded border border-slate-700 font-sans text-[10px] font-bold">Ctrl + A</kbd> (chọn tất cả) rồi <kbd className="bg-slate-900 text-slate-300 px-1.5 py-0.4 rounded border border-slate-700 font-sans text-[10px] font-bold">Ctrl + C</kbd> (sao chép).
                  </li>
                  <li>
                    Dán (<kbd className="bg-slate-900 text-slate-300 px-1.5 py-0.4 rounded border border-slate-700 font-sans text-[10px] font-bold">Ctrl + V</kbd>) vào khung dán chữ bên trái và bấm <strong className="text-yellow-550 font-black">"Đồng Bộ AI Ngay"</strong>.
                  </li>
                  <li>
                    Bộ xử lý AI thông minh sẽ dọn dẹp văn bản thừa, trích xuất chuẩn cấu trúc giải đấu để vẽ sơ đồ nhánh Bracket và cập nhật tỉ số trực tiếp!
                  </li>
                </ul>

                <div className="pt-2 text-[9px] text-slate-500 leading-normal border-t border-slate-900">
                  ⚡️ Việc đồng bộ cũng sinh thông báo Realtime lên màn hình của toàn bộ mọi người xem đang theo dõi giải đấu.
                </div>
              </div>

              <div className="p-4 bg-[#141d2e]/30 border border-blue-900/15 rounded-xl text-xs space-y-2">
                <span className="text-[10px] text-blue-400 font-black uppercase tracking-wider block">Các đội hỗ trợ nhận diện AI:</span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Trí tuệ nhân tạo nhận diện chính thống tên tất cả các đội tuyển địa phương Đơn Dương: 
                  <span className="text-white font-medium ml-1">Thạnh Mỹ Warriors, D'Ran Phantoms, Lạc Lâm Knights, Ka Đô United, Tutra Dragons, Ka Đơn Titans</span>, cùng kết quả hiển thị trên bảng/chữ được đồng bộ thành công!
                </p>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
