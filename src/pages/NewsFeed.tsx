import { useState, useRef } from 'react';
import { User, Post, Comment } from '../types';
import { Newspaper, ThumbsUp, Heart, Share2, MessageSquare, Send, Calendar, ShieldAlert, Upload, X, Trash2, Award } from 'lucide-react';

interface NewsFeedProps {
  currentUser: User | null;
  posts: Post[];
  onAddPost: (newPost: Post) => void;
  onUpdatePostInteraction: (postId: string, updatedFields: Partial<Post>) => void;
  onAddComment: (postId: string, comment: Comment) => void;
  onDeletePost: (postId: string) => void;
  onNavigate: (view: string) => void;
}

export default function NewsFeed({
  currentUser,
  posts,
  onAddPost,
  onUpdatePostInteraction,
  onAddComment,
  onDeletePost,
  onNavigate
}: NewsFeedProps) {
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [activeDetailPost, setActiveDetailPost] = useState<Post | null>(null);

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Comment state inside dialog
  const [commentText, setCommentText] = useState('');
  const [formErr, setFormErr] = useState('');

  // Drag and drop base64 file helper
  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const processSelectedFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert("⚠️ Định dạng tệp tin không hợp lệ. Vui lòng chọn tệp hình ảnh (.png, .jpg, .webp).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setNewImageUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Submit new tournament post
  const handlePublishPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      setFormErr("Vui lòng nhập đầy đủ tiêu đề và nội dung.");
      return;
    }

    setFormErr('');
    try {
      const resp = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: newTitle,
          content: newContent,
          imageUrl: newImageUrl || undefined,
          adminId: currentUser?.id
        })
      });

      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error);

      onAddPost(data.post);
      
      // Reset form fields
      setNewTitle('');
      setNewContent('');
      setNewImageUrl('');
      setShowUploadForm(false);
      alert("📢 Tin tức và ảnh thực chiến đã được đăng tải thành công!");
    } catch (err: any) {
      setFormErr(err.message);
    }
  };

  // Like action
  const handleLike = async (postId: string, currentLikedState: boolean) => {
    try {
      const resp = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isLiked: currentLikedState })
      });
      const data = await resp.json();
      onUpdatePostInteraction(postId, { likesCount: data.likesCount, hasLiked: !currentLikedState });
    } catch (err) {
      console.error(err);
    }
  };

  // Tim (love) action
  const handleTim = async (postId: string, currentTimedState: boolean) => {
    try {
      const resp = await fetch(`/api/posts/${postId}/tim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isTimed: currentTimedState })
      });
      const data = await resp.json();
      onUpdatePostInteraction(postId, { timCount: data.timCount, hasTimed: !currentTimedState });
    } catch (err) {
      console.error(err);
    }
  };

  // Share action
  const handleShare = async (postId: string) => {
    try {
      const resp = await fetch(`/api/posts/${postId}/share`, { method: 'POST' });
      const data = await resp.json();
      onUpdatePostInteraction(postId, { sharesCount: data.sharesCount });
      navigator.clipboard.writeText(window.location.origin + `/news/story/${postId}`);
      alert("🔗 Đã nhân bản liên kết bài phóng sự Liên Quân thành công! Hãy chia sẻ tin vui này cho người dùng khác.");
    } catch (err) {
      console.error(err);
    }
  };

  // Comment action
  const handleAddCommentSubmit = async (e: React.FormEvent, postId: string) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    if (!currentUser) {
      alert("Vui lòng đăng nhập hoặc tài khoản Google để tham gia bình luận trực tiếp.");
      return;
    }

    try {
      const resp = await fetch(`/api/posts/${postId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: currentUser.id,
          userName: currentUser.ingameName || currentUser.fullName,
          content: commentText.trim()
        })
      });

      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error);

      onAddComment(postId, data.comment);
      setCommentText('');

      // Refresh local modal details state
      if (activeDetailPost && activeDetailPost.id === postId) {
        setActiveDetailPost(prev => prev ? {
          ...prev,
          comments: [...prev.comments, data.comment]
        } : null);
      }
    } catch (err: any) {
      alert("Lỗi gửi bình luận: " + err.message);
    }
  };

  // Admin Delete Post
  const handlePostDeleteSubmit = async (postId: string) => {
    if (!window.confirm("Bạn có tin chắc muốn xóa bài tin tức này không?")) return;

    try {
      const resp = await fetch(`/api/posts/${postId}?adminId=${currentUser?.id}`, {
        method: 'DELETE'
      });

      if (!resp.ok) {
        const data = await resp.json();
        throw new Error(data.error);
      }

      onDeletePost(postId);
      alert("Đã xóa bài viết thành công!");
    } catch (err: any) {
      alert("Lỗi xóa: " + err.message);
    }
  };

  return (
    <div id="newsfeed-page" className="space-y-6 page-enter">
      
      {/* Header section with admin publishing option */}
      <div className="flex items-center justify-between border-b border-indigo-950/40 pb-4 flex-wrap gap-4">
        <div>
          <h2 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-red-500" />
            <span>Phim Ảnh & Tin Tức Giải Đấu</span>
          </h2>
          <p className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest mt-1">Nơi lưu giữ các khoảnh khắc đọ súng, cướp tà thần đỉnh cao của tuyển thủ</p>
        </div>

        {/* Admin publisher switch */}
        {currentUser?.role === 'admin' && (
          <button
            id="admin-new-post-btn"
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-slate-950 rounded text-xs font-black uppercase tracking-wider transition-all"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{showUploadForm ? "Đóng Form Đăng" : "Đăng Tin & Ảnh Mới"}</span>
          </button>
        )}
      </div>

      {/* --- FORM ĐĂNG TẢI TIN TỨC & ẢNH (ADMIN ONLY) --- */}
      {showUploadForm && currentUser?.role === 'admin' && (
        <div 
          id="admin-post-form-card" 
          className="p-5 bg-[#171113] border border-yellow-700/30 rounded-2xl shadow-xl animate-slide-up"
        >
          <div className="flex items-center justify-between border-b border-yellow-500/10 pb-2 mb-4">
            <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-1.5">
              <Award className="w-4 h-4 text-yellow-500 animate-pulse" />
              <span>Giao Diện Đăng Hình & Bài Viết Giải Đấu</span>
            </h3>
            <button 
              onClick={() => setShowUploadForm(false)}
              className="p-1 text-slate-400 hover:text-white rounded-full hover:bg-slate-800"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {formErr && (
            <div className="mb-4 bg-red-950/30 border border-red-500/30 text-red-400 text-xs p-3 rounded-lg">
              {formErr}
            </div>
          )}

          <form onSubmit={handlePublishPost} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Text metadata */}
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Tiêu đề tin tức giải đấu</label>
                  <input
                    id="new-post-title"
                    type="text"
                    required
                    placeholder="Ví dụ: Phỏng vấn Lai Bâng sau chuỗi trận hủy diệt..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-slate-950 text-white rounded p-2 text-xs focus:ring-1 focus:ring-yellow-500 border border-slate-800 font-semibold"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Nội dung chi tiết (Phóng sự)</label>
                  <textarea
                    id="new-post-content"
                    rows={5}
                    required
                    placeholder="Nhập phần phân tích trận đấu kịch tính hoặc các thống kê cấm chọn tại đây..."
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    className="w-full bg-slate-950 text-white rounded p-2 text-xs focus:ring-1 focus:ring-yellow-500 border border-slate-800 leading-relaxed"
                  />
                </div>
              </div>

              {/* Real Drag and Drop File Upload attachment container */}
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Hình ảnh giải đấu thực tế (.PNG/JPG)</label>
                
                <div
                  id="drag-drop-zone"
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleFileDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center min-h-[170px] ${
                    isDragging 
                      ? 'border-yellow-500 bg-yellow-950/10' 
                      : newImageUrl 
                      ? 'border-green-500 bg-green-950/10' 
                      : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />

                  {newImageUrl ? (
                    <div className="relative group/thumb w-full aspect-video max-h-[150px] overflow-hidden rounded-lg">
                      <img 
                        src={newImageUrl} 
                        alt="Uploaded thumbnail preview" 
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setNewImageUrl('');
                        }}
                        className="absolute top-2 right-2 bg-black/60 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-yellow-500/60 mb-2 animate-bounce" />
                      <p className="text-xs font-semibold text-slate-300">Kéo & thả ảnh trận đấu vào đây</p>
                      <p className="text-[10px] text-slate-500 mt-1">Hoặc bấm vào để duyệt từ máy tính</p>
                    </>
                  )}
                </div>

                <div className="mt-2.5">
                  <span className="text-[10.5px] text-slate-500 font-mono tracking-widest">HOẶC DÙNG LIÊN KẾT ẢNH MẪU NHANH:</span>
                  <div className="flex gap-1.5 mt-1">
                    <button
                      type="button"
                      onClick={() => setNewImageUrl("https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80")}
                      className="px-2 py-1 text-[8.5px] font-mono bg-slate-900 border border-slate-800 text-slate-400 rounded hover:text-white"
                    >
                      Mẫu 1: Game thi đấu
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewImageUrl("https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80")}
                      className="px-2 py-1 text-[8.5px] font-mono bg-slate-900 border border-slate-800 text-slate-400 rounded hover:text-white"
                    >
                      Mẫu 2: Esport Neon
                    </button>
                  </div>
                </div>

              </div>

            </div>

            <button
              id="submit-register-new-post"
              type="submit"
              className="w-full bg-gradient-to-r from-red-600 to-yellow-600 hover:from-red-700 hover:to-yellow-700 text-white text-xs font-black py-2 px-4 rounded shadow-md uppercase tracking-wider transition-all"
            >
              Phát Bản Tin Phim Phóng Sự & Ảnh Giải Đấu ➔
            </button>
          </form>
        </div>
      )}

      {/* --- GRID OF TOURNAMENT POSTS CARDS --- */}
      <div id="posts-feed-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-500 text-xs">
            Chưa có tin tức nào được đăng tải. Admin hãy đăng hình ảnh trận đấu nhé!
          </div>
        ) : (
          posts.map((post) => (
            <div 
              key={post.id}
              id={`post-card-${post.id}`}
              className="bg-[#121226]/80 rounded-2xl border border-indigo-950/40 shadow-xl overflow-hidden flex flex-col group hover:-translate-y-1 transition-all duration-300 card-glow-red relative"
            >
              
              {/* Optional delete button for tech admin */}
              {currentUser?.role === 'admin' && (
                <button
                  id={`delete-post-${post.id}`}
                  onClick={() => handlePostDeleteSubmit(post.id)}
                  title="Xóa bài viết"
                  className="absolute top-3 right-3 z-20 bg-black/60 hover:bg-red-600 text-white rounded-full p-1.5 transition-colors shadow"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Post picture cover */}
              {post.imageUrl && (
                <div 
                  onClick={() => setActiveDetailPost(post)}
                  className="aspect-video relative overflow-hidden cursor-pointer"
                >
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
                  
                  <span className="absolute bottom-2 left-3 bg-red-600/35 backdrop-blur text-[9px] font-mono text-white px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">
                    PHÓNG SỰ ẢNH
                  </span>
                </div>
              )}

              {/* Feed Card core */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center text-[10px] text-slate-500 space-x-2 mb-2 font-mono">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                  
                  <h3 
                    onClick={() => setActiveDetailPost(post)}
                    className="text-xs font-bold text-white leading-snug cursor-pointer hover:text-red-400 transition-colors line-clamp-2"
                  >
                    {post.title}
                  </h3>
                  
                  <p className="text-[11px] text-slate-400 mt-2.5 line-clamp-3 leading-relaxed">
                    {post.content}
                  </p>
                </div>

                {/* Bottom interaction indicators */}
                <div className="mt-4 pt-3.5 border-t border-indigo-950/20 flex items-center justify-between text-[11px] text-slate-400">
                  
                  {/* Likes / Tims */}
                  <div className="flex items-center space-x-3.5">
                    
                    {/* Thích */}
                    <button 
                      onClick={() => handleLike(post.id, !!post.hasLiked)}
                      className={`flex items-center space-x-1.5 hover:text-red-400 cursor-pointer ${post.hasLiked ? 'text-red-500' : ''}`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span className="font-semibold">{post.likesCount}</span>
                    </button>

                    {/* Tim */}
                    <button 
                      onClick={() => handleTim(post.id, !!post.hasTimed)}
                      className={`flex items-center space-x-1.5 hover:text-pink-400 cursor-pointer ${post.hasTimed ? 'text-pink-500' : ''}`}
                    >
                      <Heart className="w-3.5 h-3.5 fill-current" />
                      <span className="font-semibold">{post.timCount}</span>
                    </button>

                    {/* Bình luận counts */}
                    <button 
                      onClick={() => setActiveDetailPost(post)}
                      className="flex items-center space-x-1.5 hover:text-white"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span className="font-semibold">{post.comments ? post.comments.length : 0}</span>
                    </button>

                  </div>

                  {/* Share button */}
                  <button 
                    onClick={() => handleShare(post.id)}
                    className="hover:text-white"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>

                </div>

              </div>

            </div>
          ))
        )}
      </div>

      {/* --- DETAILS MODAL DIALOG (SHOW ALL COMMENTS, READING POST) --- */}
      {activeDetailPost && (
        <div 
          id="post-detail-dialog-modal"
          className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto"
        >
          <div className="bg-[#121226] border border-indigo-950 max-w-2xl w-full rounded-2xl shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden page-enter">
            
            {/* Modal header */}
            <div className="p-4 border-b border-indigo-950/40 flex items-center justify-between bg-slate-950">
              <span className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest flex items-center gap-1">
                <Newspaper className="w-3.5 h-3.5 text-red-500" />
                <span>Chi tiết bản tin & bình luận</span>
              </span>
              <button 
                onClick={() => setActiveDetailPost(null)}
                className="p-1.5 text-slate-400 hover:text-white bg-slate-900 rounded-full hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable contents */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              
              {/* Photo cover */}
              {activeDetailPost.imageUrl && (
                <div className="aspect-video w-full rounded-xl overflow-hidden shadow-lg border border-slate-800">
                  <img src={activeDetailPost.imageUrl} alt={activeDetailPost.title} className="w-full h-full object-cover" />
                </div>
              )}

              <div>
                <span className="text-[10px] text-slate-500 font-mono italic block mb-1">
                  Đăng ngày: {new Date(activeDetailPost.createdAt).toLocaleString('vi-VN')}
                </span>
                <h3 className="text-sm font-extrabold text-white leading-snug text-glow-gold">
                  {activeDetailPost.title}
                </h3>
                <p className="text-xs text-slate-300 mt-3 leading-relaxed whitespace-pre-wrap font-sans">
                  {activeDetailPost.content}
                </p>
              </div>

              {/* Interactions counters inside bar */}
              <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-850 flex items-center space-x-4 text-xs font-mono text-slate-400">
                <span className="flex items-center gap-1">
                  <ThumbsUp className="w-3.5 h-3.5 text-red-500" />
                  <span>{activeDetailPost.likesCount} Thích</span>
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-pink-500 fill-current" />
                  <span>{activeDetailPost.timCount} Thả tim</span>
                </span>
                <span className="flex items-center gap-1">
                  <Share2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>{activeDetailPost.sharesCount} Chia sẻ</span>
                </span>
              </div>

              {/* --- COMMENTS BOARD SECTION --- */}
              <div className="space-y-3.5 border-t border-indigo-950/20 pt-4">
                <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-red-500" />
                  <span>Góc người hâm mộ bình chọn ({activeDetailPost.comments ? activeDetailPost.comments.length : 0})</span>
                </h4>

                {/* List comments */}
                <div className="space-y-2.5 max-h-48 overflow-y-auto p-1">
                  {!activeDetailPost.comments || activeDetailPost.comments.length === 0 ? (
                    <p className="text-slate-500 text-xs text-center py-4 italic font-sans">Chưa có bình luận nào. Hãy là người đầu tiên bộc lộ suy nghĩ!</p>
                  ) : (
                    activeDetailPost.comments.map((comm) => (
                      <div 
                        key={comm.id} 
                        id={`comm-item-${comm.id}`}
                        className="p-2.5 bg-slate-950/50 rounded-lg border border-indigo-950/20 text-xs flex items-start space-x-2.5 hover:bg-slate-950 transition-colors"
                      >
                        <img 
                          src={comm.userAvatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${comm.userId}`} 
                          alt="avatar" 
                          className="w-5.5 h-5.5 rounded-full border border-indigo-950 bg-slate-900 mt-0.5"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="font-bold text-slate-200 font-mono">{comm.userName}</span>
                            <span className="text-slate-500">
                              {new Date(comm.createdAt).toLocaleString('vi-VN')}
                            </span>
                          </div>
                          <p className="text-slate-350 mt-1 leading-relaxed font-sans">{comm.content}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Form to post comments */}
                {currentUser ? (
                  <form 
                    onSubmit={(e) => handleAddCommentSubmit(e, activeDetailPost.id)}
                    className="flex space-x-2 bg-slate-950 p-1.5 rounded-lg border border-slate-800"
                  >
                    <input
                      type="text"
                      required
                      placeholder="Viết cảm nghĩ về trận đấu, hình ảnh..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="flex-1 bg-transparent text-xs text-white px-2 focus:outline-none border-none placeholder-slate-600"
                    />
                    <button
                      type="submit"
                      className="bg-red-600 hover:bg-red-700 text-white rounded p-1.5 transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                ) : (
                  <div className="p-3 bg-slate-950 border border-slate-850 rounded-lg text-center text-slate-500 text-xs">
                    Để bình chọn bình luận, vui lòng{" "}
                    <button 
                      onClick={() => {
                        setActiveDetailPost(null);
                        onNavigate('auth');
                      }}
                      className="text-red-500 hover:text-red-400 font-bold"
                    >
                      Đăng Nhập
                    </button>
                    .
                  </div>
                )}

              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
