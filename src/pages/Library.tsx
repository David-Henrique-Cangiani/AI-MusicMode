import React, { useState } from 'react';
import { PlaylistCard } from '@/components/cards/PlaylistCard';
import { ArtistCard } from '@/components/cards/ArtistCard';
import { mockPlaylists, mockArtists } from '@/data/mockData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Grid, List, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

const Library: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  return (
    <div className="min-h-full px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-foreground">Sua Biblioteca</h1>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setViewMode('grid')}>
            <Grid className={cn('w-5 h-5', viewMode === 'grid' ? 'text-foreground' : 'text-muted-foreground')} />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setViewMode('list')}>
            <List className={cn('w-5 h-5', viewMode === 'list' ? 'text-foreground' : 'text-muted-foreground')} />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="playlists" className="w-full">
        <TabsList className="mb-6 bg-transparent gap-2">
          <TabsTrigger
            value="playlists"
            className="data-[state=active]:bg-foreground data-[state=active]:text-background rounded-full px-4"
          >
            Playlists
          </TabsTrigger>
          <TabsTrigger
            value="artists"
            className="data-[state=active]:bg-foreground data-[state=active]:text-background rounded-full px-4"
          >
            Artistas
          </TabsTrigger>
          <TabsTrigger
            value="albums"
            className="data-[state=active]:bg-foreground data-[state=active]:text-background rounded-full px-4"
          >
            Álbuns
          </TabsTrigger>
        </TabsList>

        <TabsContent value="playlists" className="animate-fade-in">
          <div className={cn(
            viewMode === 'grid'
              ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6'
              : 'flex flex-col gap-2'
          )}>
            {/* Create Playlist Card */}
            <div
              className={cn(
                'group cursor-pointer',
                viewMode === 'grid'
                  ? 'bg-card hover:bg-card-hover rounded-lg p-4 transition-all'
                  : 'flex items-center gap-4 p-3 bg-card hover:bg-card-hover rounded-lg transition-all'
              )}
            >
              {viewMode === 'grid' ? (
                <>
                  <div className="w-full aspect-square rounded-md bg-muted flex items-center justify-center mb-4">
                    <Plus className="w-12 h-12 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                  <h3 className="font-semibold text-foreground">Criar Playlist</h3>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded bg-muted flex items-center justify-center">
                    <Plus className="w-6 h-6 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                  <span className="font-medium text-foreground">Criar Playlist</span>
                </>
              )}
            </div>

            {mockPlaylists.map((playlist) =>
              viewMode === 'grid' ? (
                <PlaylistCard key={playlist.id} playlist={playlist} />
              ) : (
                <div
                  key={playlist.id}
                  className="flex items-center gap-4 p-3 bg-card hover:bg-card-hover rounded-lg transition-all cursor-pointer"
                >
                  <img
                    src={playlist.coverUrl}
                    alt={playlist.name}
                    className="w-12 h-12 rounded object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{playlist.name}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      Playlist • {playlist.songs.length} músicas
                    </p>
                  </div>
                </div>
              )
            )}
          </div>
        </TabsContent>

        <TabsContent value="artists" className="animate-fade-in">
          <div className={cn(
            viewMode === 'grid'
              ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6'
              : 'flex flex-col gap-2'
          )}>
            {mockArtists.map((artist) =>
              viewMode === 'grid' ? (
                <ArtistCard key={artist.id} artist={artist} />
              ) : (
                <div
                  key={artist.id}
                  className="flex items-center gap-4 p-3 bg-card hover:bg-card-hover rounded-lg transition-all cursor-pointer"
                >
                  <img
                    src={artist.imageUrl}
                    alt={artist.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{artist.name}</p>
                    <p className="text-sm text-muted-foreground">Artista</p>
                  </div>
                </div>
              )
            )}
          </div>
        </TabsContent>

        <TabsContent value="albums" className="animate-fade-in">
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-xl font-semibold text-foreground mb-2">
              Salve seus álbuns favoritos
            </p>
            <p className="text-muted-foreground mb-4">
              Toque no coração para salvar álbuns que você gosta.
            </p>
            <Button variant="default">Explorar álbuns</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Library;
