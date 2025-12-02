export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  coverUrl: string;
  audioUrl: string;
  liked?: boolean;
  lyrics?: string;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  coverUrl: string;
  songs: Song[];
  createdBy: string;
  isPublic: boolean;
  createdAt: Date;
}

export interface Album {
  id: string;
  name: string;
  artist: string;
  coverUrl: string;
  releaseYear: number;
  songs: Song[];
}

export interface Artist {
  id: string;
  name: string;
  imageUrl: string;
  bio?: string;
  monthlyListeners: number;
  albums: Album[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  playlists: Playlist[];
  likedSongs: string[];
  recentlyPlayed: string[];
}

export type RepeatMode = 'off' | 'all' | 'one';

export interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  volume: number;
  progress: number;
  duration: number;
  shuffle: boolean;
  repeat: RepeatMode;
  queue: Song[];
  queueIndex: number;
}

export interface LocalSong {
  id: string;
  title: string;
  artist: string;
  album: string;
  filename: string;
  coverFilename?: string;
  lyricsFilename?: string;
}
