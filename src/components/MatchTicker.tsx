import { useState, useEffect } from 'react';
import { LiveMatch } from '../types';
import { Activity, Tv, Trophy } from 'lucide-react';

interface MatchTickerProps {
  matches: LiveMatch[];
  onNavigate: (view: string) => void;
}

export default function MatchTicker({ matches, onNavigate }: MatchTickerProps) {
  const [tickerOffset, setTickerOffset] = useState(0);

  // Simple auto scroll simulator or just a lovely wrap
  useEffect(() => {
    const timer = setInterval(() => {
      setTickerOffset((prev) => (prev - 1) % 400);
    }, 150);
    return () => clearInterval(timer);
  }, []);

  return (
    <div 
      id="match-ticker-bar"
      className="bg-[#0f0f1b] border-b border-yellow-500/20 text-xs py-2 px-4 shadow-md overflow-hidden relative"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Lọc nhanh tình trạng */}
        <div className="flex items-center space-x-2 text-yellow-500 font-bold shrink-0 z-10 bg-[#0f0f1b] pr-4">
          <Activity className="w-3.5 h-3.5 animate-pulse text-red-500" />
          <span className="uppercase tracking-wider">Tình Trạng Giải Đấu:</span>
        </div>

        {/* Thùng chứa cuộn ticker */}
        <div className="flex-1 overflow-hidden relative">
          <div className="flex items-center space-x-12 whitespace-nowrap animate-marquee">
            {matches.map((match) => {
              const isLive = match.status === 'live';
              return (
                <div 
                  key={match.id}
                  id={`ticker-match-${match.id}`}
                  onClick={() => onNavigate('livestream')}
                  className={`inline-flex items-center space-x-3 cursor-pointer py-0.5 px-2.5 rounded-full transition-colors ${
                    isLive 
                      ? 'bg-red-950/40 border border-red-500/30 hover:bg-red-900/40' 
                      : 'bg-slate-900/50 border border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {isLive && (
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                  )}
                  <span className="font-semibold text-slate-300">
                    {match.stage}
                  </span>
                  <div className="flex items-center space-x-1.5 font-bold">
                    <span className="text-white">{match.teamA}</span>
                    <span className={`px-1.5 py-0.2 rounded text-center text-[10px] ${isLive ? 'bg-red-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
                      {match.scoreA} - {match.scoreB}
                    </span>
                    <span className="text-white">{match.teamB}</span>
                  </div>

                  {isLive ? (
                    <span className="text-red-400 text-[10px] flex items-center space-x-1">
                      <Tv className="w-3 h-3 animate-pulse" />
                      <span>TRỰC TIẾP Phút {match.liveEvents?.[match.liveEvents.length-1]?.time || '11:30'}</span>
                    </span>
                  ) : match.status === 'upcoming' ? (
                    <span className="text-yellow-500 text-[10px] flex items-center space-x-a">
                      <Trophy className="w-3 h-3" />
                      <span>{match.scheduledTime}</span>
                    </span>
                  ) : (
                    <span className="text-slate-400 text-[10px]">Đã kết thúc</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
