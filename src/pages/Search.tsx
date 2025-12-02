import React, { useState } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { SongCard } from '@/components/cards/SongCard';
import { mockSongs, mockPlaylists, mockArtists } from '@/data/mockData';
import { PlaylistCard } from '@/components/cards/PlaylistCard';
import { ArtistCard } from '@/components/cards/ArtistCard';
import { SectionHeader } from '@/components/sections/SectionHeader';

const categories = [
  { name: 'Pop', color: 'from-pink-500 to-rose-500' },
  { name: 'Hip Hop', color: 'from-amber-500 to-orange-600' },
  { name: 'Rock', color: 'from-red-500 to-red-700' },
  { name: 'Electronic', color: 'from-cyan-400 to-blue-600' },
  { name: 'Jazz', color: 'from-emerald-500 to-green-700' },
  { name: 'Classical', color: 'from-purple-500 to-violet-700' },
  { name: 'R&B', color: 'from-fuchsia-500 to-pink-700' },
  { name: 'Country', color: 'from-yellow-500 to-amber-700' },
];

const Search: React.FC = () => {
  const [query, setQuery] = useState('');

  const filteredSongs = mockSongs.filter(
    (song) =>
      song.title.toLowerCase().includes(query.toLowerCase()) ||
      song.artist.toLowerCase().includes(query.toLowerCase())
  );

  const filteredPlaylists = mockPlaylists.filter((playlist) =>
    playlist.name.toLowerCase().includes(query.toLowerCase())
  );

  const filteredArtists = mockArtists.filter((artist) =>
    artist.name.toLowerCase().includes(query.toLowerCase())
  );

  const hasResults =
    filteredSongs.length > 0 || filteredPlaylists.length > 0 || filteredArtists.length > 0;

  return (
    <div className="min-h-full px-8 py-6">
      {/* Search Input */}
      <div className="relative max-w-md mb-8">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="O que você quer ouvir?"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-12 h-12 text-base bg-card border-none rounded-full"
        />
      </div>

      {query ? (
        hasResults ? (
          <div className="space-y-10">
            {filteredSongs.length > 0 && (
              <section className="animate-fade-in">
                <SectionHeader title="Músicas" />
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                  {filteredSongs.map((song) => (
                    <SongCard key={song.id} song={song} />
                  ))}
                </div>
              </section>
            )}

            {filteredArtists.length > 0 && (
              <section className="animate-fade-in">
                <SectionHeader title="Artistas" />
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                  {filteredArtists.map((artist) => (
                    <ArtistCard key={artist.id} artist={artist} />
                  ))}
                </div>
              </section>
            )}

            {filteredPlaylists.length > 0 && (
              <section className="animate-fade-in">
                <SectionHeader title="Playlists" />
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                  {filteredPlaylists.map((playlist) => (
                    <PlaylistCard key={playlist.id} playlist={playlist} />
                  ))}
                </div>
              </section>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-xl font-semibold text-foreground mb-2">
              Nenhum resultado encontrado para "{query}"
            </p>
            <p className="text-muted-foreground">
              Verifique a ortografia ou tente termos diferentes.
            </p>
          </div>
        )
      ) : (
        <div className="animate-fade-in">
          <SectionHeader title="Navegar por categorias" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {categories.map((category) => (
              <div
                key={category.name}
                className={`relative h-48 rounded-lg overflow-hidden cursor-pointer bg-gradient-to-br ${category.color} hover:scale-105 transition-transform`}
              >
                <h3 className="absolute bottom-4 left-4 text-2xl font-bold text-foreground">
                  {category.name}
                </h3>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;
