import React from 'react';
import { SectionHeader } from '@/components/sections/SectionHeader';
import { SongCard } from '@/components/cards/SongCard';
import { Play, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePlayer } from '@/contexts/PlayerContext';
import { useMusicLibrary } from '@/contexts/MusicLibraryContext';

const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
};

const Index: React.FC = () => {
  const { playPlaylist } = usePlayer();
  const { songs, loading } = useMusicLibrary();

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  const recentlyPlayed = songs.slice(0, 6);

  return (
    <div className="min-h-full">
      {/* Hero Section */}
      <div className="hero-gradient px-4 md:px-8 pt-8 pb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">{getGreeting()}</h1>
        
        {/* Quick Access Grid */}
        {recentlyPlayed.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-8">
            {recentlyPlayed.map((song, index) => (
              <div
                key={song.id}
                className="group flex items-center gap-4 bg-card/50 hover:bg-card rounded-md overflow-hidden transition-all cursor-pointer"
                onClick={() => playPlaylist(songs, index)}
              >
                <img
                  src={song.coverUrl}
                  alt={song.title}
                  className="w-12 md:w-16 h-12 md:h-16 object-cover"
                />
                <span className="font-semibold text-foreground truncate flex-1 pr-2 text-sm md:text-base">
                  {song.title}
                </span>
                <Button
                  variant="glow"
                  size="icon"
                  className="mr-4 opacity-0 group-hover:opacity-100 transition-opacity shadow-xl"
                >
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Content Sections */}
      <div className="px-4 md:px-8 py-6 space-y-10">
        {/* All Songs */}
        {songs.length > 0 ? (
          <section className="animate-slide-up">
            <SectionHeader title="Todas as músicas" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {songs.map((song, index) => (
                <SongCard key={song.id} song={song} index={index} songList={songs} />
              ))}
            </div>
          </section>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-xl font-semibold text-foreground mb-2">
              Nenhuma música ainda
            </p>
            <p className="text-muted-foreground">
              Adicione músicas pelo painel admin.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
