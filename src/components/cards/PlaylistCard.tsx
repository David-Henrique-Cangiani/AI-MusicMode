import React from 'react';
import { Play, Pause } from 'lucide-react';
import { Playlist } from '@/types/music';
import { usePlayer } from '@/contexts/PlayerContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface PlaylistCardProps {
  playlist: Playlist;
}

export const PlaylistCard: React.FC<PlaylistCardProps> = ({ playlist }) => {
  const navigate = useNavigate();
  const { currentSong, isPlaying, playPlaylist, pause, play } = usePlayer();
  
  const isPlayingFromPlaylist = playlist.songs.some(s => s.id === currentSong?.id);
  const isCurrentlyPlaying = isPlayingFromPlaylist && isPlaying;

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrentlyPlaying) {
      pause();
    } else if (isPlayingFromPlaylist) {
      play();
    } else {
      playPlaylist(playlist.songs, 0);
    }
  };

  return (
    <div
      className="group relative bg-card hover:bg-card-hover rounded-lg p-4 transition-all duration-300 cursor-pointer"
      onClick={() => navigate(`/playlist/${playlist.id}`)}
    >
      <div className="relative mb-4">
        <img
          src={playlist.coverUrl}
          alt={playlist.name}
          className="w-full aspect-square rounded-md object-cover shadow-lg"
        />
        <Button
          variant="glow"
          size="iconLg"
          className="absolute bottom-2 right-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-xl"
          onClick={handlePlayClick}
        >
          {isCurrentlyPlaying ? (
            <Pause className="w-6 h-6 fill-current" />
          ) : (
            <Play className="w-6 h-6 fill-current ml-0.5" />
          )}
        </Button>
      </div>
      <h3 className="font-semibold text-foreground truncate mb-1">{playlist.name}</h3>
      <p className="text-sm text-muted-foreground line-clamp-2">{playlist.description}</p>
    </div>
  );
};
