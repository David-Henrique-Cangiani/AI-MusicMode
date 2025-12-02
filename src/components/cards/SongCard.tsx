import React from 'react';
import { Play, Pause } from 'lucide-react';
import { Song } from '@/types/music';
import { usePlayer } from '@/contexts/PlayerContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SongCardProps {
  song: Song;
  index?: number;
  showIndex?: boolean;
  compact?: boolean;
  songList?: Song[];
}

export const SongCard: React.FC<SongCardProps> = ({
  song,
  index = 0,
  showIndex = false,
  compact = false,
  songList,
}) => {
  const { currentSong, isPlaying, play, pause, playPlaylist } = usePlayer();
  const isCurrentSong = currentSong?.id === song.id;
  const isCurrentlyPlaying = isCurrentSong && isPlaying;

  const handlePlay = () => {
    if (isCurrentSong) {
      if (isPlaying) {
        pause();
      } else {
        play();
      }
    } else if (songList && songList.length > 0) {
      playPlaylist(songList, index);
    } else {
      play(song, [song]);
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (compact) {
    return (
      <div
        className={cn(
          'group flex items-center gap-4 p-2 rounded-md hover:bg-card-hover transition-all cursor-pointer',
          isCurrentSong && 'bg-card-hover'
        )}
        onClick={handlePlay}
      >
        <div className="w-8 flex justify-center">
          {showIndex && !isCurrentlyPlaying && (
            <span className="text-muted-foreground group-hover:hidden">
              {index + 1}
            </span>
          )}
          {isCurrentlyPlaying ? (
            <div className="flex items-end gap-0.5 h-4">
              <span className="w-1 bg-primary animate-equalizer" style={{ animationDelay: '0ms' }} />
              <span className="w-1 bg-primary animate-equalizer" style={{ animationDelay: '150ms' }} />
              <span className="w-1 bg-primary animate-equalizer" style={{ animationDelay: '300ms' }} />
            </div>
          ) : (
            <Play className="w-4 h-4 hidden group-hover:block text-foreground fill-current" />
          )}
        </div>
        <img
          src={song.coverUrl}
          alt={song.title}
          className="w-10 h-10 rounded object-cover"
        />
        <div className="flex-1 min-w-0">
          <p className={cn('text-sm font-medium truncate', isCurrentSong && 'text-primary')}>
            {song.title}
          </p>
          <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
        </div>
        <span className="text-sm text-muted-foreground">
          {formatDuration(song.duration)}
        </span>
      </div>
    );
  }

  return (
    <div className="group relative bg-card hover:bg-card-hover rounded-lg p-4 transition-all duration-300 cursor-pointer">
      <div className="relative mb-4">
        <img
          src={song.coverUrl}
          alt={song.title}
          className="w-full aspect-square rounded-md object-cover shadow-lg"
        />
        <Button
          variant="glow"
          size="iconLg"
          className="absolute bottom-2 right-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-xl"
          onClick={handlePlay}
        >
          {isCurrentlyPlaying ? (
            <Pause className="w-6 h-6 fill-current" />
          ) : (
            <Play className="w-6 h-6 fill-current ml-0.5" />
          )}
        </Button>
      </div>
      <h3 className="font-semibold text-foreground truncate mb-1">{song.title}</h3>
      <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
    </div>
  );
};
