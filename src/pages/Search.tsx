import React, { useState } from 'react';
import { Search as SearchIcon, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { SongCard } from '@/components/cards/SongCard';
import { useMusicLibrary } from '@/contexts/MusicLibraryContext';
import { SectionHeader } from '@/components/sections/SectionHeader';

const Search: React.FC = () => {
  const [query, setQuery] = useState('');
  const { songs, loading } = useMusicLibrary();

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  const filteredSongs = query
    ? songs.filter(
        (song) =>
          song.title.toLowerCase().includes(query.toLowerCase()) ||
          song.artist.toLowerCase().includes(query.toLowerCase()) ||
          song.album.toLowerCase().includes(query.toLowerCase())
      )
    : songs;

  return (
    <div className="min-h-full px-4 md:px-8 py-6">
      {/* Search Input */}
      <div className="relative max-w-md mb-8">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar músicas..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-12 h-12 text-base bg-card border-none rounded-full"
        />
      </div>

      {filteredSongs.length > 0 ? (
        <div className="animate-fade-in">
          <SectionHeader title={query ? `Resultados para "${query}"` : 'Todas as músicas'} />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {filteredSongs.map((song, index) => (
              <SongCard key={song.id} song={song} index={index} songList={filteredSongs} />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-xl font-semibold text-foreground mb-2">
            {query ? `Nenhum resultado para "${query}"` : 'Nenhuma música encontrada'}
          </p>
          <p className="text-muted-foreground">
            {query ? 'Tente termos diferentes.' : 'Adicione músicas pelo painel admin.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Search;
