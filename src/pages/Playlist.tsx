import React from 'react';
import { useParams } from 'react-router-dom';
import { Play, Pause, Heart, MoreHorizontal, Clock3 } from 'lucide-react';
import { mockPlaylists } from '@/data/mockData';
import { usePlayer } from '@/contexts/PlayerContext';
import { Button } from '@/components/ui/button';
import { SongCard } from '@/components/cards/SongCard';
import { cn } from '@/lib/utils';

const Playlist: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentSong, isPlaying, playPlaylist, pause, play } = usePlayer();

  const playlist = mockPlaylists.find((p) => p.id === id);

  if (!playlist) {
    return (
      <div className="flex items-center justify-center min-h-full">
        <p className="text-muted-foreground">Playlist não encontrada</p>
      </div>
    );
  }

  const isPlayingFromPlaylist = playlist.songs.some((s) => s.id === currentSong?.id);
  const isCurrentlyPlaying = isPlayingFromPlaylist && isPlaying;

  const totalDuration = playlist.songs.reduce((acc, song) => acc + song.duration, 0);
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
    } else if (isPlayingFromPlaylist) {
      play();
    } else {
      playPlaylist(playlist.songs, 0);
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
        <div className="flex items-end gap-6">
          <img
            src={playlist.coverUrl}
            alt={playlist.name}
            className="w-56 h-56 rounded-lg object-cover shadow-2xl"
          />
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-foreground uppercase">Playlist</span>
            <h1 className="text-5xl font-bold text-foreground">{playlist.name}</h1>
            {playlist.description && (
              <p className="text-muted-foreground mt-2">{playlist.description}</p>
            )}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4">
              <span className="font-semibold text-foreground">AI-MusicMode</span>
              <span>•</span>
              <span>{playlist.songs.length} músicas,</span>
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
        <Button variant="icon" size="iconLg">
          <Heart className="w-8 h-8" />
        </Button>
        <Button variant="icon" size="iconLg">
          <MoreHorizontal className="w-8 h-8" />
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
          {playlist.songs.map((song, index) => (
            <SongCard key={song.id} song={song} index={index} showIndex compact />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Playlist;
