import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Song } from '@/types/music';

interface MusicLibraryContextType {
  songs: Song[];
  addSong: (song: Omit<Song, 'id'>) => void;
  removeSong: (id: string) => void;
  updateSong: (id: string, updates: Partial<Song>) => void;
  isAdmin: boolean;
  login: (password: string) => boolean;
  logout: () => void;
}

const MusicLibraryContext = createContext<MusicLibraryContextType | null>(null);

const ADMIN_PASSWORD = 'admin123'; // Em produção, use autenticação real
const STORAGE_KEY = 'soundwave_songs';
const ADMIN_KEY = 'soundwave_admin';

// Músicas padrão - você pode adicionar seus arquivos em public/music/
const defaultSongs: Song[] = [
  {
    id: '1',
    title: 'Neon Dreams',
    artist: 'Synthwave Collective',
    album: 'Digital Horizons',
    duration: 234,
    coverUrl: 'https://images.unsplash.com/photo-1614149162883-504ce4d13909?w=300&h=300&fit=crop',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    liked: true,
  },
  {
    id: '2',
    title: 'Midnight Drive',
    artist: 'Electric Pulse',
    album: 'Night Vibes',
    duration: 198,
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  },
  {
    id: '3',
    title: 'Crystal Waves',
    artist: 'Ocean Sound',
    album: 'Deep Blue',
    duration: 267,
    coverUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    liked: true,
  },
  {
    id: '4',
    title: 'Urban Echoes',
    artist: 'City Lights',
    album: 'Metropolitan',
    duration: 312,
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
  },
  {
    id: '5',
    title: 'Stellar Journey',
    artist: 'Cosmos',
    album: 'Interstellar',
    duration: 245,
    coverUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=300&h=300&fit=crop',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
  },
  {
    id: '6',
    title: 'Forest Rain',
    artist: 'Nature Sounds',
    album: 'Peaceful Moments',
    duration: 289,
    coverUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=300&fit=crop',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    liked: true,
  },
];

export const useMusicLibrary = () => {
  const context = useContext(MusicLibraryContext);
  if (!context) {
    throw new Error('useMusicLibrary must be used within a MusicLibraryProvider');
  }
  return context;
};

export const MusicLibraryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [songs, setSongs] = useState<Song[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : defaultSongs;
  });
  
  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem(ADMIN_KEY) === 'true';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(songs));
  }, [songs]);

  const addSong = useCallback((song: Omit<Song, 'id'>) => {
    const newSong: Song = {
      ...song,
      id: Date.now().toString(),
    };
    setSongs(prev => [...prev, newSong]);
  }, []);

  const removeSong = useCallback((id: string) => {
    setSongs(prev => prev.filter(song => song.id !== id));
  }, []);

  const updateSong = useCallback((id: string, updates: Partial<Song>) => {
    setSongs(prev => prev.map(song => 
      song.id === id ? { ...song, ...updates } : song
    ));
  }, []);

  const login = useCallback((password: string) => {
    if (password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      localStorage.setItem(ADMIN_KEY, 'true');
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setIsAdmin(false);
    localStorage.removeItem(ADMIN_KEY);
  }, []);

  return (
    <MusicLibraryContext.Provider
      value={{
        songs,
        addSong,
        removeSong,
        updateSong,
        isAdmin,
        login,
        logout,
      }}
    >
      {children}
    </MusicLibraryContext.Provider>
  );
};
