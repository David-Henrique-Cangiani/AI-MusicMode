import React, { useState } from 'react';
import { usePlayer } from '@/contexts/PlayerContext';
import { useMusicLibrary } from '@/contexts/MusicLibraryContext';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { LyricsModal } from './LyricsModal';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Volume1,
  Heart,
  ListMusic,
  Maximize2,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const formatTime = (seconds: number): string => {
  if (isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const MusicPlayer: React.FC = () => {
  const {
    currentSong,
    isPlaying,
    volume,
    progress,
    duration,
    shuffle,
    repeat,
    toggle,
    next,
    previous,
    seek,
    setVolume,
    toggleShuffle,
    toggleRepeat,
  } = usePlayer();

  const { updateSong, songs } = useMusicLibrary();
  const [showLyrics, setShowLyrics] = useState(false);

  // Get the latest song data from the library
  const currentSongData = currentSong ? songs.find(s => s.id === currentSong.id) || currentSong : null;

  const handleToggleLike = async () => {
    if (currentSongData) {
      await updateSong(currentSongData.id, { liked: !currentSongData.liked });
      toast.success(currentSongData.liked ? 'Removido das curtidas' : 'Adicionado às curtidas');
    }
  };

  const handleProgressChange = (value: number[]) => {
    seek(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
  };

  const VolumeIcon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  if (!currentSong) {
    return (
      <div className="fixed bottom-0 left-0 right-0 h-[140px] md:h-[90px] bg-background/95 backdrop-blur-xl border-t border-border z-50">
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <p className="text-sm">Selecione uma música para começar</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Player */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-xl border-t border-border z-50 md:hidden">
        <div className="flex flex-col p-3 gap-2">
          {/* Song Info & Controls Row */}
          <div className="flex items-center gap-3">
            <img
              src={currentSong.coverUrl}
              alt={currentSong.title}
              className="w-12 h-12 rounded-md object-cover shadow-lg flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{currentSong.title}</p>
              <p className="text-xs text-muted-foreground truncate">{currentSong.artist}</p>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="icon"
                size="iconSm"
                onClick={handleToggleLike}
                className={cn(currentSongData?.liked && 'text-primary')}
              >
                <Heart className={cn('w-5 h-5', currentSongData?.liked && 'fill-current')} />
              </Button>
              <Button variant="player" size="iconSm" onClick={previous}>
                <SkipBack className="w-5 h-5 fill-current" />
              </Button>
              <Button
                variant="playerPrimary"
                size="icon"
                onClick={toggle}
                className="shadow-lg"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                )}
              </Button>
              <Button variant="player" size="iconSm" onClick={next}>
                <SkipForward className="w-5 h-5 fill-current" />
              </Button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground w-8 text-right">
              {formatTime(progress)}
            </span>
            <Slider
              value={[progress]}
              max={duration || 100}
              step={1}
              onValueChange={handleProgressChange}
              className="flex-1"
            />
            <span className="text-[10px] text-muted-foreground w-8">
              {formatTime(duration)}
            </span>
          </div>
        </div>
      </div>

      {/* Desktop Player */}
      <div className="fixed bottom-0 left-0 right-0 h-[90px] bg-background/95 backdrop-blur-xl border-t border-border z-50 hidden md:block">
        <div className="flex items-center justify-between h-full px-4 max-w-screen-2xl mx-auto">
          {/* Song Info */}
          <div className="flex items-center gap-4 w-[30%] min-w-[180px]">
            <div className="relative group">
              <img
                src={currentSong.coverUrl}
                alt={currentSong.title}
                className="w-14 h-14 rounded-md object-cover shadow-lg"
              />
              <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
                <Maximize2 className="w-5 h-5 text-foreground" />
              </div>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-foreground truncate hover:underline cursor-pointer">
                {currentSong.title}
              </span>
              <span className="text-xs text-muted-foreground truncate hover:underline cursor-pointer">
                {currentSong.artist}
              </span>
            </div>
            <Button
              variant="icon"
              size="iconSm"
              onClick={handleToggleLike}
              className={cn(currentSongData?.liked && 'text-primary')}
            >
              <Heart className={cn('w-4 h-4', currentSongData?.liked && 'fill-current')} />
            </Button>
          </div>

          {/* Player Controls */}
          <div className="flex flex-col items-center gap-2 w-[40%] max-w-[722px]">
            <div className="flex items-center gap-4">
              <Button
                variant="icon"
                size="iconSm"
                onClick={toggleShuffle}
                className={cn(shuffle && 'text-primary')}
              >
                <Shuffle className="w-4 h-4" />
              </Button>
              <Button variant="player" size="iconSm" onClick={previous}>
                <SkipBack className="w-5 h-5 fill-current" />
              </Button>
              <Button
                variant="playerPrimary"
                size="icon"
                onClick={toggle}
                className="shadow-lg"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                )}
              </Button>
              <Button variant="player" size="iconSm" onClick={next}>
                <SkipForward className="w-5 h-5 fill-current" />
              </Button>
              <Button
                variant="icon"
                size="iconSm"
                onClick={toggleRepeat}
                className={cn(repeat !== 'off' && 'text-primary')}
              >
                {repeat === 'one' ? (
                  <Repeat1 className="w-4 h-4" />
                ) : (
                  <Repeat className="w-4 h-4" />
                )}
              </Button>
            </div>
            <div className="flex items-center gap-2 w-full">
              <span className="text-xs text-muted-foreground w-10 text-right">
                {formatTime(progress)}
              </span>
              <Slider
                value={[progress]}
                max={duration || 100}
                step={1}
                onValueChange={handleProgressChange}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground w-10">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Volume & Extra Controls */}
          <div className="flex items-center justify-end gap-2 w-[30%] min-w-[180px]">
            <Button
              variant="icon"
              size="iconSm"
              onClick={() => setShowLyrics(true)}
              className={cn(currentSong.lyrics && 'text-primary')}
              title="Ver letra"
            >
              <FileText className="w-4 h-4" />
            </Button>
            <Button variant="icon" size="iconSm">
              <ListMusic className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="icon"
                size="iconSm"
                onClick={() => setVolume(volume === 0 ? 0.7 : 0)}
              >
                <VolumeIcon className="w-4 h-4" />
              </Button>
              <Slider
                value={[volume]}
                max={1}
                step={0.01}
                onValueChange={handleVolumeChange}
                className="w-24"
              />
            </div>
          </div>
        </div>
      </div>

      <LyricsModal
        isOpen={showLyrics}
        onClose={() => setShowLyrics(false)}
        title={currentSong.title}
        artist={currentSong.artist}
        lyrics={currentSong.lyrics}
      />
    </>
  );
};
