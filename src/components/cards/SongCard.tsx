import React from 'react';
import { Play, Pause, Heart, MoreHorizontal, ListPlus } from 'lucide-react';
import { Song } from '@/types/music';
import { usePlayer } from '@/contexts/PlayerContext';
import { useMusicLibrary } from '@/contexts/MusicLibraryContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

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
  const { updateSong, playlists, addSongToPlaylist } = useMusicLibrary();
  const isCurrentSong = currentSong?.id === song.id;
  const isCurrentlyPlaying = isCurrentSong && isPlaying;

  const handlePlay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
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

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await updateSong(song.id, { liked: !song.liked });
    toast.success(song.liked ? 'Removido das curtidas' : 'Adicionado às curtidas');
  };

  const handleAddToPlaylist = async (playlistId: string, playlistName: string) => {
    await addSongToPlaylist(playlistId, song.id);
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
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 opacity-0 group-hover:opacity-100"
          onClick={handleLike}
        >
          <Heart className={cn('w-4 h-4', song.liked && 'fill-primary text-primary')} />
        </Button>
        <span className="text-sm text-muted-foreground">
          {formatDuration(song.duration)}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-popover border-border">
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="cursor-pointer">
                <ListPlus className="w-4 h-4 mr-2" />
                Adicionar à playlist
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className="bg-popover border-border">
                  {playlists.length === 0 ? (
                    <DropdownMenuItem disabled>
                      Nenhuma playlist criada
                    </DropdownMenuItem>
                  ) : (
                    playlists.map((playlist) => (
                      <DropdownMenuItem 
                        key={playlist.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToPlaylist(playlist.id, playlist.name);
                        }}
                      >
                        {playlist.name}
                      </DropdownMenuItem>
                    ))
                  )}
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
            <DropdownMenuItem onClick={handleLike}>
              <Heart className={cn('w-4 h-4 mr-2', song.liked && 'fill-primary text-primary')} />
              {song.liked ? 'Remover das curtidas' : 'Curtir'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <div className="group relative bg-card hover:bg-card-hover rounded-lg p-4 transition-all duration-300 cursor-pointer">
      <div className="relative mb-4" onClick={handlePlay}>
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
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/60 hover:bg-background/80"
          onClick={handleLike}
        >
          <Heart className={cn('w-5 h-5', song.liked && 'fill-primary text-primary')} />
        </Button>
      </div>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-foreground truncate mb-1">{song.title}</h3>
          <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-popover border-border">
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="cursor-pointer">
                <ListPlus className="w-4 h-4 mr-2" />
                Adicionar à playlist
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className="bg-popover border-border">
                  {playlists.length === 0 ? (
                    <DropdownMenuItem disabled>
                      Nenhuma playlist criada
                    </DropdownMenuItem>
                  ) : (
                    playlists.map((playlist) => (
                      <DropdownMenuItem 
                        key={playlist.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToPlaylist(playlist.id, playlist.name);
                        }}
                      >
                        {playlist.name}
                      </DropdownMenuItem>
                    ))
                  )}
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
            <DropdownMenuItem onClick={handleLike}>
              <Heart className={cn('w-4 h-4 mr-2', song.liked && 'fill-primary text-primary')} />
              {song.liked ? 'Remover das curtidas' : 'Curtir'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
