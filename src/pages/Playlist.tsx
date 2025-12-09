import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Play, Pause, Heart, MoreHorizontal, Clock3, Music } from 'lucide-react';
import { useMusicLibrary, PlaylistData } from '@/contexts/MusicLibraryContext';
import { usePlayer } from '@/contexts/PlayerContext';
import { Button } from '@/components/ui/button';
import { SongCard } from '@/components/cards/SongCard';
import { Song } from '@/types/music';

const Playlist: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { playlists, getPlaylistSongs } = useMusicLibrary();
  const { currentSong, isPlaying, playPlaylist, pause, play } = usePlayer();
  const [playlistSongs, setPlaylistSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  const playlist = playlists.find((p) => p.id === id);

  useEffect(() => {
    const loadSongs = async () => {
      if (id) {
        setLoading(true);
        const songs = await getPlaylistSongs(id);
        setPlaylistSongs(songs);
        setLoading(false);
      }
    };
    loadSongs();
  }, [id, getPlaylistSongs]);

  if (!playlist) {
    return (
      <div className="flex items-center justify-center min-h-full">
        <p className="text-muted-foreground">Playlist não encontrada</p>
      </div>
    );
  }

  const isPlayingFromPlaylist = playlistSongs.some((s) => s.id === currentSong?.id);
  const isCurrentlyPlaying = isPlayingFromPlaylist && isPlaying;

  const totalDuration = playlistSongs.reduce((acc, song) => acc + song.duration, 0);
  const formatTotalDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours} h ${mins} min`;
    }
    return `${mins} min`;
  };

  const handlePlayClick = () => {
    if (playlistSongs.length === 0) return;
    
    if (isCurrentlyPlaying) {
      pause();
    } else if (isPlayingFromPlaylist) {
      play();
    } else {
      playPlaylist(playlistSongs, 0);
    }
  };

  return (
    <div className="min-h-full">
      {/* Header */}
      <div
        className="relative px-8 pt-16 pb-8"
        style={{
          background: `linear-gradient(180deg, hsl(270, 40%, 25%) 0%, hsl(var(--background)) 100%)`,
        }}
      >
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
          <div className="w-56 h-56 rounded-lg bg-muted flex items-center justify-center shadow-2xl overflow-hidden">
            {playlist.coverUrl ? (
              <img
                src={playlist.coverUrl}
                alt={playlist.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Music className="w-20 h-20 text-muted-foreground" />
            )}
          </div>
          <div className="flex flex-col gap-2 text-center md:text-left">
            <span className="text-sm font-medium text-foreground uppercase">Playlist</span>
            <h1 className="text-3xl md:text-5xl font-bold text-foreground">{playlist.name}</h1>
            {playlist.description && (
              <p className="text-muted-foreground mt-2">{playlist.description}</p>
            )}
            <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-muted-foreground mt-4">
              <span className="font-semibold text-foreground">AI-MusicMode</span>
              <span>•</span>
              <span>{playlistSongs.length} músicas,</span>
              <span>{formatTotalDuration(totalDuration)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="px-8 py-6 flex items-center gap-6">
        <Button
          variant="glow"
          size="iconXl"
          onClick={handlePlayClick}
          className="shadow-xl"
          disabled={playlistSongs.length === 0}
        >
          {isCurrentlyPlaying ? (
            <Pause className="w-7 h-7 fill-current" />
          ) : (
            <Play className="w-7 h-7 fill-current ml-1" />
          )}
        </Button>
        <Button variant="icon" size="iconLg">
          <Heart className="w-8 h-8" />
        </Button>
        <Button variant="icon" size="iconLg">
          <MoreHorizontal className="w-8 h-8" />
        </Button>
      </div>

      {/* Track List */}
      <div className="px-8">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Carregando músicas...</div>
        ) : playlistSongs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-lg mb-2">Esta playlist está vazia</p>
            <p className="text-sm">Adicione músicas clicando nos três pontos de uma música</p>
          </div>
        ) : (
          <>
            <div className="hidden md:grid grid-cols-[40px_1fr_1fr_80px] gap-4 px-4 py-2 border-b border-border text-sm text-muted-foreground">
              <span>#</span>
              <span>Título</span>
              <span>Álbum</span>
              <span className="flex justify-end">
                <Clock3 className="w-4 h-4" />
              </span>
            </div>

            <div className="py-2">
              {playlistSongs.map((song, index) => (
                <SongCard key={song.id} song={song} index={index} showIndex compact songList={playlistSongs} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Playlist;