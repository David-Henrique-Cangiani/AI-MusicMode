import React from 'react';
import { Play } from 'lucide-react';
import { Artist } from '@/types/music';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface ArtistCardProps {
  artist: Artist;
}

export const ArtistCard: React.FC<ArtistCardProps> = ({ artist }) => {
  const navigate = useNavigate();

  const formatListeners = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(0)}K`;
    }
    return count.toString();
  };

  return (
    <div
      className="group relative bg-card hover:bg-card-hover rounded-lg p-4 transition-all duration-300 cursor-pointer"
      onClick={() => navigate(`/artist/${artist.id}`)}
    >
      <div className="relative mb-4">
        <img
          src={artist.imageUrl}
          alt={artist.name}
          className="w-full aspect-square rounded-full object-cover shadow-lg"
        />
        <Button
          variant="glow"
          size="iconLg"
          className="absolute bottom-2 right-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-xl"
        >
          <Play className="w-6 h-6 fill-current ml-0.5" />
        </Button>
      </div>
      <h3 className="font-semibold text-foreground truncate mb-1">{artist.name}</h3>
      <p className="text-sm text-muted-foreground">
        {formatListeners(artist.monthlyListeners)} ouvintes mensais
      </p>
    </div>
  );
};
