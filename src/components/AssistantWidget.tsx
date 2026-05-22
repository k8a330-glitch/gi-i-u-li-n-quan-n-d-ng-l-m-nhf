import { useState, useRef, useEffect } from 'react';
import { User } from '../types';
import { MessageSquare, X, Send, Sparkles, HelpCircle, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const krixiAvatar = '/src/assets/images/krixi_avatar_1779467532656.png';

interface AssistantWidgetProps {
  currentUser: User | null;
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
}

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export default function AssistantWidget({ currentUser, isOpen: propsIsOpen, setIsOpen: propsSetIsOpen }: AssistantWidgetProps) {
  const [localIsOpen, setLocalIsOpen] = useState(false);
  const isOpen = propsIsOpen !== undefined ? propsIsOpen : localIsOpen;
  const setIsOpen = propsSetIsOpen !== undefined ? propsSetIsOpen : setLocalIsOpen;
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      content: '🌿 Chào mừng chiến hữu đến với Đấu Trường Đơn Dương - Lâm Đồng! Krixi tinh nghịch ở đây để trả lời mọi thắc mắc của bạn về giải đấu, thông tin các đội gank cực khét như Thạnh Mỹ Warriors ⚔️ hay D\'Ran Phantoms 🔮, mẹo khống chế đường, hoặc bí kíp cấm chọn siêu sầu. Hãy hỏi Krixi chuyện gì bạn tò mò nhé! 🌸'
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || isLoading) return;

    const userText = inputVal;
    setInputVal('');
    
    // Append to thread
    const updatedMessages = [...messages, { role: 'user' as const, content: userText }];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: updatedMessages,
          userProfile: currentUser
        })
      });

      if (!response.ok) {
        throw new Error('Đường truyền tới Trợ Lý Krixi bị gián đoạn.');
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'model', content: data.text }]);
    } catch (error: any) {
      setMessages(prev => [...prev, { 
        role: 'model', 
        content: `🌸 Ôi hỏng rồi chiến hữu ơi! Triệu hồi phép thuật rừng sâu bị lỗi rồi: _${error.message || 'Mất kết nối máy chủ'}_. Bạn hãy kiểm tra lại kết nối mạng hoặc thử lại nhé!` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    setInputVal(question);
  };

  return (
    <div id="virtual-assistant-widget" className="fixed bottom-3 right-4 z-50">
      
      {/* Toggle Badge Button */}
      {!isOpen && (
        <button
          id="assistant-open-bubble"
          onClick={() => setIsOpen(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-red-600 to-yellow-600 hover:from-red-700 hover:to-yellow-700 text-white rounded-full p-3 shadow-[0_5px_20px_rgba(239,68,68,0.45)] border border-yellow-500/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Sparkles className="w-4.5 h-4.5 text-yellow-300" />
          <span className="text-[11px] font-black uppercase tracking-wider pr-1 hidden sm:inline-block leading-none">Trợ Lý Krixi</span>
          <div className="relative">
            <span className="absolute -top-1 -right-1 block h-1.5 w-1.5 rounded-full bg-green-400 border border-[#09090e]"></span>
            <Bot className="w-3.5 h-3.5 text-emerald-300" />
          </div>
        </button>
      )}

      {/* Slide-out Drawer Panel */}
      {isOpen && (
        <div 
          id="assistant-drawer-panel"
          className="w-72 sm:w-[290px] h-[390px] bg-[#121226]/95 backdrop-blur-md border border-indigo-950/80 rounded-xl shadow-2xl flex flex-col overflow-hidden animate-slide-up"
        >
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-[#121124] to-[#241315] p-3 border-b border-indigo-950/50 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <img 
                  src={krixiAvatar} 
                  alt="krixi avatar" 
                  className="w-8 h-8 rounded-full border-2 border-red-500 bg-red-950 object-cover"
                />
                <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-emerald-500 border border-[#121226]"></span>
              </div>
              <div>
                <div className="flex items-center space-x-1">
                  <h3 className="text-[11px] font-black text-white uppercase tracking-wider">Trợ Lý Krixi</h3>
                  <span className="text-[7px] bg-red-600 font-bold uppercase py-0.2 px-0.8 rounded text-white tracking-widest leading-none">AI</span>
                </div>
                <p className="text-[9px] text-yellow-500/80 font-semibold uppercase tracking-wider">🌿 Tinh Linh Đơn Dương</p>
              </div>
            </div>
            
            <button
              id="assistant-close-btn"
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-1 px-2 py-1 text-[10px] font-bold text-slate-300 hover:text-white bg-slate-800/40 hover:bg-red-600/80 rounded-full border border-slate-800 hover:border-red-500/30 transition-all cursor-pointer shadow-sm"
              title="Đóng trợ lý"
            >
              <span>Đóng</span>
              <X className="w-3 h-3" />
            </button>
          </div>

          {/* Chat Logs Window */}
          <div className="flex-1 p-3 bg-[#09090e] overflow-y-auto space-y-3">
            {messages.map((msg, index) => {
              const isUser = msg.role === 'user';
              return (
                <div 
                  key={index} 
                  id={`chat-bubble-${index}`}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-1.5 max-w-[90%] ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    
                    {/* Icon of sender */}
                    {!isUser && (
                      <img 
                        src={krixiAvatar} 
                        alt="Krixi" 
                        className="w-5.5 h-5.5 rounded-full border border-red-500/40 bg-slate-900 mt-0.5 flex-shrink-0 object-cover"
                      />
                    )}

                    {/* Speech box */}
                    <div 
                      className={`p-2.5 rounded-xl text-[11px] leading-relaxed border shadow-sm ${
                        isUser 
                          ? 'bg-red-600 text-white rounded-tr-none border-red-500' 
                          : 'bg-[#18182e] text-slate-200 rounded-tl-none border-indigo-950/40'
                      }`}
                    >
                      {/* Strictly formatted Markdown */}
                      <div className="markdown-body text-[11px] prose prose-invert font-sans">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex justify-start items-center space-x-1.5">
                <img 
                  src={krixiAvatar} 
                  alt="Krixi" 
                  className="w-5 h-5 rounded-full border border-red-500/40 bg-slate-900 animate-spin object-cover"
                />
                <div className="bg-[#18182e] text-slate-400 p-2 rounded-xl border border-indigo-950/40 rounded-tl-none text-[9px] flex items-center space-x-1.5">
                  <span className="flex space-x-1">
                    <span className="h-1 w-1 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="h-1 w-1 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="h-1 w-1 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </span>
                  <span>Krixi đang phân tích...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick recommendations panel */}
          <div className="px-2.5 py-1.5 bg-[#121226] border-t border-indigo-950/40 shrink-0">
            <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest block mb-1 flex items-center gap-1">
              <HelpCircle className="w-2.5 h-2.5 text-red-500" />
              <span>Gợi ý nhanh:</span>
            </span>
            <div className="flex flex-wrap gap-1 py-0.5">
              <button
                onClick={() => handleQuickQuestion('Tỉ số trận Thạnh Mỹ Warriors vs D\'Ran Phantoms hiện tại ra sao rồi?')}
                className="bg-slate-900/60 hover:bg-slate-800 text-[9px] text-yellow-500/90 font-medium py-0.5 px-2 rounded-full border border-slate-800 hover:border-yellow-500/20 truncate max-w-full text-left transition-all"
              >
                📊 Tỉ số TM vs DRP?
              </button>
              <button
                onClick={() => handleQuickQuestion('Hãy lên giáo án lên đồ đi rừng cực mạnh cho Aoi')}
                className="bg-slate-900/60 hover:bg-slate-800 text-[9px] text-slate-300 py-0.5 px-2 rounded-full border border-slate-800 hover:border-yellow-500/20 truncate max-w-full text-left transition-all"
              >
                ⚔️ Đồ rừng Aoi?
              </button>
            </div>
          </div>

          {/* Form input messaging box */}
          <form 
            onSubmit={handleSendMessage}
            className="p-2 bg-slate-950 border-t border-indigo-950/50 flex items-center space-x-1.5"
          >
            <input
              id="assistant-chat-input"
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Hỏi Krixi..."
              disabled={isLoading}
              className="flex-1 text-[11px] bg-slate-900 text-white rounded-lg px-2.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-yellow-500 border border-slate-800 placeholder-slate-500"
            />
            <button
              id="assistant-submit-btn"
              type="submit"
              disabled={isLoading || !inputVal.trim()}
              className="px-2.5 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-slate-850 disabled:text-slate-600 text-white rounded-lg transition-colors shadow-md"
            >
              <Send className="w-3 h-3" />
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
