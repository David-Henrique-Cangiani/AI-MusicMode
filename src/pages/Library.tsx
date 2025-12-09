import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMusicLibrary } from '@/contexts/MusicLibraryContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Grid, List, Plus, Music } from 'lucide-react';
import { cn } from '@/lib/utils';

const Library: React.FC = () => {
  const navigate = useNavigate();
  const { playlists } = useMusicLibrary();
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
        </TabsList>

        <TabsContent value="playlists" className="animate-fade-in">
          <div className={cn(
            viewMode === 'grid'
              ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6'
              : 'flex flex-col gap-2'
          )}>
            {/* Create Playlist Card */}
            <div
              onClick={() => navigate('/create-playlist')}
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

            {playlists.map((playlist) =>
              viewMode === 'grid' ? (
                <div
                  key={playlist.id}
                  onClick={() => navigate(`/playlist/${playlist.id}`)}
                  className="group bg-card hover:bg-card-hover rounded-lg p-4 transition-all cursor-pointer"
                >
                  <div className="w-full aspect-square rounded-md bg-muted flex items-center justify-center mb-4 overflow-hidden">
                    {playlist.coverUrl ? (
                      <img src={playlist.coverUrl} alt={playlist.name} className="w-full h-full object-cover" />
                    ) : (
                      <Music className="w-12 h-12 text-muted-foreground" />
                    )}
                  </div>
                  <h3 className="font-semibold text-foreground truncate">{playlist.name}</h3>
                  <p className="text-sm text-muted-foreground truncate">Playlist</p>
                </div>
              ) : (
                <div
                  key={playlist.id}
                  onClick={() => navigate(`/playlist/${playlist.id}`)}
                  className="flex items-center gap-4 p-3 bg-card hover:bg-card-hover rounded-lg transition-all cursor-pointer"
                >
                  <div className="w-12 h-12 rounded bg-muted flex items-center justify-center overflow-hidden">
                    {playlist.coverUrl ? (
                      <img src={playlist.coverUrl} alt={playlist.name} className="w-full h-full object-cover" />
                    ) : (
                      <Music className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{playlist.name}</p>
                    <p className="text-sm text-muted-foreground truncate">Playlist</p>
                  </div>
                </div>
              )
            )}

            {playlists.length === 0 && (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                Nenhuma playlist criada ainda
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Library;