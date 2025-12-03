import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Song } from '@/types/music';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MusicLibraryContextType {
  songs: Song[];
  loading: boolean;
  addSong: (song: Omit<Song, 'id'>) => Promise<void>;
  removeSong: (id: string) => Promise<void>;
  updateSong: (id: string, updates: Partial<Song>) => Promise<void>;
  refreshSongs: () => Promise<void>;
  isAdmin: boolean;
  login: (password: string) => boolean;
  logout: () => void;
}

const MusicLibraryContext = createContext<MusicLibraryContextType | null>(null);

const ADMIN_PASSWORD = 'admin123';
const ADMIN_KEY = 'soundwave_admin';

export const useMusicLibrary = () => {
  const context = useContext(MusicLibraryContext);
  if (!context) {
    throw new Error('useMusicLibrary must be used within a MusicLibraryProvider');
  }
  return context;
};

export const MusicLibraryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem(ADMIN_KEY) === 'true';
  });

  const fetchSongs = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching songs:', error);
        toast.error('Erro ao carregar músicas');
        return;
      }

      const mappedSongs: Song[] = (data || []).map(song => ({
        id: song.id,
        title: song.title,
        artist: song.artist,
        album: song.album,
        duration: song.duration,
        coverUrl: song.cover_url || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
        audioUrl: song.audio_url,
        liked: song.liked || false,
        lyrics: song.lyrics || undefined,
      }));

      setSongs(mappedSongs);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSongs();
  }, [fetchSongs]);

  const addSong = useCallback(async (song: Omit<Song, 'id'>) => {
    try {
      const { error } = await supabase
        .from('songs')
        .insert({
          title: song.title,
          artist: song.artist,
          album: song.album,
          duration: song.duration,
          cover_url: song.coverUrl,
          audio_url: song.audioUrl,
          lyrics: song.lyrics || null,
          liked: song.liked || false,
        });

      if (error) {
        console.error('Error adding song:', error);
        toast.error('Erro ao adicionar música');
        return;
      }

      await fetchSongs();
    } catch (error) {
      console.error('Error:', error);
    }
  }, [fetchSongs]);

  const removeSong = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('songs')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error removing song:', error);
        toast.error('Erro ao remover música');
        return;
      }

      await fetchSongs();
    } catch (error) {
      console.error('Error:', error);
    }
  }, [fetchSongs]);

  const updateSong = useCallback(async (id: string, updates: Partial<Song>) => {
    try {
      const dbUpdates: Record<string, unknown> = {};
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.artist !== undefined) dbUpdates.artist = updates.artist;
      if (updates.album !== undefined) dbUpdates.album = updates.album;
      if (updates.duration !== undefined) dbUpdates.duration = updates.duration;
      if (updates.coverUrl !== undefined) dbUpdates.cover_url = updates.coverUrl;
      if (updates.audioUrl !== undefined) dbUpdates.audio_url = updates.audioUrl;
      if (updates.lyrics !== undefined) dbUpdates.lyrics = updates.lyrics;
      if (updates.liked !== undefined) dbUpdates.liked = updates.liked;

      const { error } = await supabase
        .from('songs')
        .update(dbUpdates)
        .eq('id', id);

      if (error) {
        console.error('Error updating song:', error);
        toast.error('Erro ao atualizar música');
        return;
      }

      await fetchSongs();
    } catch (error) {
      console.error('Error:', error);
    }
  }, [fetchSongs]);

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
        loading,
        addSong,
        removeSong,
        updateSong,
        refreshSongs: fetchSongs,
        isAdmin,
        login,
        logout,
      }}
    >
      {children}
    </MusicLibraryContext.Provider>
  );
};
