import React, { createContext, useContext, useState, useEffect } from 'react';
import { Heart, ListMusic, Plus, Trash2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Tipos
interface Song {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
}

interface Playlist {
  id: string;
  name: string;
  songIds: string[];
  createdAt: string;
}

interface UserMusicData {
  likedSongs: string[];
  playlists: Playlist[];
}

// Context para gerenciar dados locais
const LocalMusicContext = createContext<{
  likedSongs: string[];
  playlists: Playlist[];
  toggleLike: (songId: string) => void;
  isLiked: (songId: string) => boolean;
  createPlaylist: (name: string) => void;
  deletePlaylist: (playlistId: string) => void;
  addToPlaylist: (playlistId: string, songId: string) => void;
  removeFromPlaylist: (playlistId: string, songId: string) => void;
  loading: boolean;
} | null>(null);

// Provider Component
export const LocalMusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [likedSongs, setLikedSongs] = useState<string[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar dados ao iniciar
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const result = await window.storage.get('user-music-data');
      if (result) {
        const data: UserMusicData = JSON.parse(result.value);
        setLikedSongs(data.likedSongs || []);
        setPlaylists(data.playlists || []);
      }
    } catch (error) {
      console.log('Nenhum dado salvo ainda');
    } finally {
      setLoading(false);
    }
  };

  const saveUserData = async (newLikedSongs: string[], newPlaylists: Playlist[]) => {
    try {
      const data: UserMusicData = {
        likedSongs: newLikedSongs,
        playlists: newPlaylists
      };
      await window.storage.set('user-music-data', JSON.stringify(data));
    } catch (error) {
      console.error('Erro ao salvar:', error);
    }
  };

  const toggleLike = (songId: string) => {
    const newLikedSongs = likedSongs.includes(songId)
      ? likedSongs.filter(id => id !== songId)
      : [...likedSongs, songId];
    
    setLikedSongs(newLikedSongs);
    saveUserData(newLikedSongs, playlists);
  };

  const isLiked = (songId: string) => likedSongs.includes(songId);

  const createPlaylist = (name: string) => {
    const newPlaylist: Playlist = {
      id: `playlist-${Date.now()}`,
      name,
      songIds: [],
      createdAt: new Date().toISOString()
    };
    const newPlaylists = [...playlists, newPlaylist];
    setPlaylists(newPlaylists);
    saveUserData(likedSongs, newPlaylists);
  };

  const deletePlaylist = (playlistId: string) => {
    const newPlaylists = playlists.filter(p => p.id !== playlistId);
    setPlaylists(newPlaylists);
    saveUserData(likedSongs, newPlaylists);
  };

  const addToPlaylist = (playlistId: string, songId: string) => {
    const newPlaylists = playlists.map(p => {
      if (p.id === playlistId && !p.songIds.includes(songId)) {
        return { ...p, songIds: [...p.songIds, songId] };
      }
      return p;
    });
    setPlaylists(newPlaylists);
    saveUserData(likedSongs, newPlaylists);
  };

  const removeFromPlaylist = (playlistId: string, songId: string) => {
    const newPlaylists = playlists.map(p => {
      if (p.id === playlistId) {
        return { ...p, songIds: p.songIds.filter(id => id !== songId) };
      }
      return p;
    });
    setPlaylists(newPlaylists);
    saveUserData(likedSongs, newPlaylists);
  };

  return (
    <LocalMusicContext.Provider value={{
      likedSongs,
      playlists,
      toggleLike,
      isLiked,
      createPlaylist,
      deletePlaylist,
      addToPlaylist,
      removeFromPlaylist,
      loading
    }}>
      {children}
    </LocalMusicContext.Provider>
  );
};

// Hook personalizado
export const useLocalMusic = () => {
  const context = useContext(LocalMusicContext);
  if (!context) {
    throw new Error('useLocalMusic deve ser usado dentro de LocalMusicProvider');
  }
  return context;
};

// Componente de demonstração
const MusicApp: React.FC = () => {
  const { 
    likedSongs, 
    playlists, 
    toggleLike, 
    isLiked, 
    createPlaylist,
    deletePlaylist,
    addToPlaylist,
    loading 
  } = useLocalMusic();

  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);

  // Músicas de exemplo (em produção viriam do seu backend)
  const allSongs: Song[] = [
    { id: '1', title: 'Bohemian Rhapsody', artist: 'Queen', coverUrl: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300&h=300&fit=crop' },
    { id: '2', title: 'Imagine', artist: 'John Lennon', coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop' },
    { id: '3', title: 'Billie Jean', artist: 'Michael Jackson', coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop' },
    { id: '4', title: 'Hotel California', artist: 'Eagles', coverUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300&h=300&fit=crop' }
  ];

  const handleCreatePlaylist = () => {
    if (newPlaylistName.trim()) {
      createPlaylist(newPlaylistName);
      setNewPlaylistName('');
    }
  };

  const likedSongsList = allSongs.filter(song => likedSongs.includes(song.id));

  if (loading) {
    return <div className="p-8 text-center">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Minha Biblioteca Local
        </h1>

        {/* Todas as Músicas */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <ListMusic className="w-6 h-6" />
            Todas as Músicas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {allSongs.map(song => (
              <div key={song.id} className="bg-white/10 backdrop-blur rounded-lg p-4 hover:bg-white/20 transition">
                <img src={song.coverUrl} alt={song.title} className="w-full aspect-square object-cover rounded-md mb-3" />
                <h3 className="font-semibold truncate">{song.title}</h3>
                <p className="text-sm text-gray-300 truncate mb-3">{song.artist}</p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => toggleLike(song.id)}
                    variant={isLiked(song.id) ? "default" : "outline"}
                    size="sm"
                    className="flex-1"
                  >
                    <Heart className={`w-4 h-4 ${isLiked(song.id) ? 'fill-current' : ''}`} />
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Play className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Músicas Curtidas */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Heart className="w-6 h-6 fill-current text-pink-500" />
            Músicas Curtidas ({likedSongs.length})
          </h2>
          {likedSongsList.length === 0 ? (
            <p className="text-gray-400">Nenhuma música curtida ainda. Curta algumas músicas acima!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {likedSongsList.map(song => (
                <div key={song.id} className="bg-pink-500/20 backdrop-blur rounded-lg p-4">
                  <img src={song.coverUrl} alt={song.title} className="w-full aspect-square object-cover rounded-md mb-3" />
                  <h3 className="font-semibold truncate">{song.title}</h3>
                  <p className="text-sm text-gray-300 truncate">{song.artist}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Criar Playlist */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Plus className="w-6 h-6" />
            Criar Nova Playlist
          </h2>
          <div className="flex gap-2 max-w-md">
            <input
              type="text"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              placeholder="Nome da playlist"
              className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:border-purple-400"
              onKeyDown={(e) => e.key === 'Enter' && handleCreatePlaylist()}
            />
            <Button onClick={handleCreatePlaylist} className="bg-purple-600 hover:bg-purple-700">
              Criar
            </Button>
          </div>
        </section>

        {/* Minhas Playlists */}
        <section>
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <ListMusic className="w-6 h-6" />
            Minhas Playlists ({playlists.length})
          </h2>
          {playlists.length === 0 ? (
            <p className="text-gray-400">Você ainda não criou nenhuma playlist.</p>
          ) : (
            <div className="space-y-4">
              {playlists.map(playlist => {
                const playlistSongs = allSongs.filter(song => playlist.songIds.includes(song.id));
                return (
                  <div key={playlist.id} className="bg-white/10 backdrop-blur rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-semibold">{playlist.name}</h3>
                      <Button 
                        onClick={() => deletePlaylist(playlist.id)}
                        variant="destructive"
                        size="sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-gray-300 mb-4">{playlist.songIds.length} músicas</p>
                    
                    {/* Adicionar músicas à playlist */}
                    <div className="mb-4">
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            addToPlaylist(playlist.id, e.target.value);
                            e.target.value = '';
                          }
                        }}
                        className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:border-purple-400"
                      >
                        <option value="">Adicionar música...</option>
                        {allSongs
                          .filter(song => !playlist.songIds.includes(song.id))
                          .map(song => (
                            <option key={song.id} value={song.id}>
                              {song.title} - {song.artist}
                            </option>
                          ))
                        }
                      </select>
                    </div>

                    {/* Lista de músicas da playlist */}
                    {playlistSongs.length === 0 ? (
                      <p className="text-gray-400 text-sm">Playlist vazia</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {playlistSongs.map(song => (
                          <div key={song.id} className="bg-white/5 rounded-lg p-3">
                            <img src={song.coverUrl} alt={song.title} className="w-full aspect-square object-cover rounded-md mb-2" />
                            <h4 className="font-medium text-sm truncate">{song.title}</h4>
                            <p className="text-xs text-gray-400 truncate">{song.artist}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

// App principal com Provider
export default function App() {
  return (
    <LocalMusicProvider>
      <MusicApp />
    </LocalMusicProvider>
  );
}
