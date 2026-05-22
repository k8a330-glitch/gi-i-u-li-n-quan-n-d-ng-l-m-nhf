export interface User {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  role: 'admin' | 'user';
  ingameName?: string;
  avatar?: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  likesCount: number;
  timCount: number;
  sharesCount: number;
  comments: Comment[];
  hasLiked?: boolean;
  hasTimed?: boolean;
}

export interface LiveEvent {
  id: string;
  time: string; // MM:SS format or minute
  type: 'kill' | 'tower' | 'dragon' | 'caesar' | 'triple_kill' | 'team_fight';
  description: string;
}

export interface LiveMatch {
  id: string;
  teamA: string;
  teamB: string;
  scoreA: number;
  scoreB: number;
  logoA: string;
  logoB: string;
  status: 'live' | 'upcoming' | 'completed';
  stage: string; // Group, Semifinals, Finals
  scheduledTime: string; // Date or friendly string
  banA: string[];
  pickA: string[];
  banB: string[];
  pickB: string[];
  teamGoldA?: number;
  teamGoldB?: number;
  teamKillsA?: number;
  teamKillsB?: number;
  liveEvents?: LiveEvent[];
}

export interface Notification {
  id: string;
  type: 'match_score' | 'system' | 'news';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
}
