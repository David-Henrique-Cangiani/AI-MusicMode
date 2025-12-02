import React from 'react';
import { SectionHeader } from '@/components/sections/SectionHeader';
import { SongCard } from '@/components/cards/SongCard';
import { PlaylistCard } from '@/components/cards/PlaylistCard';
import { ArtistCard } from '@/components/cards/ArtistCard';
import { recentlyPlayed, featuredPlaylists, topArtists, mockSongs } from '@/data/mockData';
import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePlayer } from '@/contexts/PlayerContext';

const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
};

const Index: React.FC = () => {
  const { playPlaylist } = usePlayer();

  return (
    <div className="min-h-full">
      {/* Hero Section */}
      <div className="hero-gradient px-8 pt-8 pb-12">
        <h1 className="text-4xl font-bold text-foreground mb-8">{getGreeting()}</h1>
        
        {/* Quick Access Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
          {recentlyPlayed.slice(0, 6).map((song) => (
            <div
              key={song.id}
              className="group flex items-center gap-4 bg-card/50 hover:bg-card rounded-md overflow-hidden transition-all cursor-pointer"
              onClick={() => playPlaylist([song], 0)}
            >
              <img
                src={song.coverUrl}
                alt={song.title}
                className="w-16 h-16 object-cover"
              />
              <span className="font-semibold text-foreground truncate flex-1 pr-2">
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
      </div>

      {/* Content Sections */}
      <div className="px-8 py-6 space-y-10">
        {/* Featured Playlists */}
        <section className="animate-slide-up" style={{ animationDelay: '100ms' }}>
          <SectionHeader title="Feito para você" showAll showAllLink="/discover" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {featuredPlaylists.map((playlist) => (
              <PlaylistCard key={playlist.id} playlist={playlist} />
            ))}
          </div>
        </section>

        {/* Recently Played */}
        <section className="animate-slide-up" style={{ animationDelay: '200ms' }}>
          <SectionHeader title="Tocados recentemente" showAll showAllLink="/recent" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {recentlyPlayed.map((song) => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        </section>

        {/* Top Artists */}
        <section className="animate-slide-up" style={{ animationDelay: '300ms' }}>
          <SectionHeader title="Seus artistas favoritos" showAll showAllLink="/artists" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {topArtists.map((artist) => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </div>
        </section>

        {/* Discover */}
        <section className="animate-slide-up" style={{ animationDelay: '400ms' }}>
          <SectionHeader title="Descobertas da semana" showAll showAllLink="/discover" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {mockSongs.slice(4).map((song) => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Index;
