import React from 'react';
import { Play, Pause, Heart, Clock3 } from 'lucide-react';
import { usePlayer } from '@/contexts/PlayerContext';
import { useMusicLibrary } from '@/contexts/MusicLibraryContext';
import { Button } from '@/components/ui/button';
import { SongCard } from '@/components/cards/SongCard';

const LikedSongs: React.FC = () => {
  const { currentSong, isPlaying, playPlaylist, pause, play } = usePlayer();
  const { songs } = useMusicLibrary();

  const likedSongs = songs.filter((song) => song.liked);
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
        <div className="flex items-end gap-6">
          <div className="w-56 h-56 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center shadow-2xl">
            <Heart className="w-24 h-24 text-foreground fill-current" />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-foreground uppercase">Playlist</span>
            <h1 className="text-5xl font-bold text-foreground">Músicas Curtidas</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4">
              <span className="font-semibold text-foreground">SoundWave</span>
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
        >
          {isCurrentlyPlaying ? (
            <Pause className="w-7 h-7 fill-current" />
          ) : (
            <Play className="w-7 h-7 fill-current ml-1" />
          )}
        </Button>
      </div>

      {/* Track List Header */}
      <div className="px-8">
        <div className="grid grid-cols-[40px_1fr_1fr_80px] gap-4 px-4 py-2 border-b border-border text-sm text-muted-foreground">
          <span>#</span>
          <span>Título</span>
          <span>Álbum</span>
          <span className="flex justify-end">
            <Clock3 className="w-4 h-4" />
          </span>
        </div>

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
