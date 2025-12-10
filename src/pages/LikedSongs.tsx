import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, Heart, Clock3, Loader2 } from 'lucide-react';
import { usePlayer } from '@/contexts/PlayerContext';
import { useMusicLibrary } from '@/contexts/MusicLibraryContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { SongCard } from '@/components/cards/SongCard';
import { Song } from '@/types/music';

const LikedSongs: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { currentSong, isPlaying, playPlaylist, pause, play } = usePlayer();
  const { getLikedSongs } = useMusicLibrary();
  const [likedSongs, setLikedSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }

    const loadLikedSongs = async () => {
      if (user) {
        setLoading(true);
        const songs = await getLikedSongs();
        setLikedSongs(songs);
        setLoading(false);
      }
    };

    loadLikedSongs();
  }, [user, authLoading, navigate, getLikedSongs]);

  if (loading || authLoading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  const isPlayingFromLiked = likedSongs.some((s) => s.id === currentSong?.id);
  const isCurrentlyPlaying = isPlayingFromLiked && isPlaying;

  const totalDuration = likedSongs.reduce((acc, song) => acc + song.duration, 0);
  const formatTotalDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours} h ${mins} min`;
    }
    return `${mins} min`;
  };

  const handlePlayClick = () => {
    if (likedSongs.length === 0) return;
    
    if (isCurrentlyPlaying) {
      pause();
    } else if (isPlayingFromLiked) {
      play();
    } else {
      playPlaylist(likedSongs, 0);
    }
  };

  return (
    <div className="min-h-full">
      {/* Header */}
      <div
        className="relative px-8 pt-16 pb-8"
        style={{
          background: `linear-gradient(180deg, hsl(250, 60%, 40%) 0%, hsl(var(--background)) 100%)`,
        }}
      >
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
          <div className="w-56 h-56 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center shadow-2xl">
            <Heart className="w-24 h-24 text-foreground fill-current" />
          </div>
          <div className="flex flex-col gap-2 text-center md:text-left">
            <span className="text-sm font-medium text-foreground uppercase">Playlist</span>
            <h1 className="text-3xl md:text-5xl font-bold text-foreground">Músicas Curtidas</h1>
            <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-muted-foreground mt-4">
              <span className="font-semibold text-foreground">AI-MusicMode</span>
              <span>•</span>
              <span>{likedSongs.length} músicas,</span>
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
          disabled={likedSongs.length === 0}
        >
          {isCurrentlyPlaying ? (
            <Pause className="w-7 h-7 fill-current" />
          ) : (
            <Play className="w-7 h-7 fill-current ml-1" />
          )}
        </Button>
      </div>

      {/* Track List */}
      <div className="px-8">
        {likedSongs.length > 0 && (
          <div className="hidden md:grid grid-cols-[40px_1fr_1fr_80px] gap-4 px-4 py-2 border-b border-border text-sm text-muted-foreground">
            <span>#</span>
            <span>Título</span>
            <span>Álbum</span>
            <span className="flex justify-end">
              <Clock3 className="w-4 h-4" />
            </span>
          </div>
        )}

        {/* Track List */}
        <div className="py-2">
          {likedSongs.map((song, index) => (
            <SongCard key={song.id} song={song} index={index} showIndex compact songList={likedSongs} />
          ))}
        </div>

        {likedSongs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Heart className="w-16 h-16 text-muted-foreground mb-4" />
            <p className="text-xl font-semibold text-foreground mb-2">
              As músicas que você curtir aparecem aqui
            </p>
            <p className="text-muted-foreground">
              Salve músicas tocando no ícone de coração.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LikedSongs;
