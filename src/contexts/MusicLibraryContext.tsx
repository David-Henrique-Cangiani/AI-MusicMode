import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Song, Playlist } from '@/types/music';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PlaylistData {
  id: string;
  name: string;
  description?: string;
  coverUrl?: string;
  createdAt: Date;
}

interface MusicLibraryContextType {
  songs: Song[];
  playlists: PlaylistData[];
  loading: boolean;
  addSong: (song: Omit<Song, 'id'>) => Promise<void>;
  removeSong: (id: string) => Promise<void>;
  updateSong: (id: string, updates: Partial<Song>) => Promise<void>;
  refreshSongs: () => Promise<void>;
  createPlaylist: (name: string, description?: string, coverUrl?: string) => Promise<string | null>;
  deletePlaylist: (id: string) => Promise<void>;
  addSongToPlaylist: (playlistId: string, songId: string) => Promise<void>;
  removeSongFromPlaylist: (playlistId: string, songId: string) => Promise<void>;
  getPlaylistSongs: (playlistId: string) => Promise<Song[]>;
  refreshPlaylists: () => Promise<void>;
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
  const [playlists, setPlaylists] = useState<PlaylistData[]>([]);
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

  const fetchPlaylists = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('playlists')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching playlists:', error);
        return;
      }

      const mappedPlaylists: PlaylistData[] = (data || []).map(p => ({
        id: p.id,
        name: p.name,
        description: p.description || undefined,
        coverUrl: p.cover_url || undefined,
        createdAt: new Date(p.created_at),
      }));

      setPlaylists(mappedPlaylists);
    } catch (error) {
      console.error('Error:', error);
    }
  }, []);

  useEffect(() => {
    fetchSongs();
    fetchPlaylists();
  }, [fetchSongs, fetchPlaylists]);

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

  const createPlaylist = useCallback(async (name: string, description?: string, coverUrl?: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from('playlists')
        .insert({
          name,
          description: description || null,
          cover_url: coverUrl || null,
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error creating playlist:', error);
        toast.error('Erro ao criar playlist');
        return null;
      }

      await fetchPlaylists();
      return data.id;
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  }, [fetchPlaylists]);

  const deletePlaylist = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('playlists')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting playlist:', error);
        toast.error('Erro ao excluir playlist');
        return;
      }

      await fetchPlaylists();
    } catch (error) {
      console.error('Error:', error);
    }
  }, [fetchPlaylists]);

  const addSongToPlaylist = useCallback(async (playlistId: string, songId: string) => {
    try {
      const { error } = await supabase
        .from('playlist_songs')
        .insert({
          playlist_id: playlistId,
          song_id: songId,
        });

      if (error) {
        if (error.code === '23505') {
          toast.info('Música já está na playlist');
          return;
        }
        console.error('Error adding song to playlist:', error);
        toast.error('Erro ao adicionar música à playlist');
        return;
      }

      toast.success('Música adicionada à playlist');
    } catch (error) {
      console.error('Error:', error);
    }
  }, []);

  const removeSongFromPlaylist = useCallback(async (playlistId: string, songId: string) => {
    try {
      const { error } = await supabase
        .from('playlist_songs')
        .delete()
        .eq('playlist_id', playlistId)
        .eq('song_id', songId);

      if (error) {
        console.error('Error removing song from playlist:', error);
        toast.error('Erro ao remover música da playlist');
        return;
      }

      toast.success('Música removida da playlist');
    } catch (error) {
      console.error('Error:', error);
    }
  }, []);

  const getPlaylistSongs = useCallback(async (playlistId: string): Promise<Song[]> => {
    try {
      const { data, error } = await supabase
        .from('playlist_songs')
        .select('song_id, songs(*)')
        .eq('playlist_id', playlistId)
        .order('added_at', { ascending: true });

      if (error) {
        console.error('Error fetching playlist songs:', error);
        return [];
      }

      return (data || []).map((item: any) => ({
        id: item.songs.id,
        title: item.songs.title,
        artist: item.songs.artist,
        album: item.songs.album,
        duration: item.songs.duration,
        coverUrl: item.songs.cover_url || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
        audioUrl: item.songs.audio_url,
        liked: item.songs.liked || false,
        lyrics: item.songs.lyrics || undefined,
      }));
    } catch (error) {
      console.error('Error:', error);
      return [];
    }
  }, []);

  return (
    <MusicLibraryContext.Provider
      value={{
        songs,
        playlists,
        loading,
        addSong,
        removeSong,
        updateSong,
        refreshSongs: fetchSongs,
        createPlaylist,
        deletePlaylist,
        addSongToPlaylist,
        removeSongFromPlaylist,
        getPlaylistSongs,
        refreshPlaylists: fetchPlaylists,
        isAdmin,
        login,
        logout,
      }}
    >
      {children}
    </MusicLibraryContext.Provider>
  );
};
