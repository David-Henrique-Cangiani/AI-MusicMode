import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MusicPlayer } from '@/components/player/MusicPlayer';
import { ScrollArea } from '@/components/ui/scroll-area';

export const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      {/* Desktop: margin-left for sidebar, Mobile: margin-top for header */}
      <main className="md:ml-[280px] pb-[140px] md:pb-[90px] pt-14 md:pt-0">
        <ScrollArea className="h-[calc(100vh-140px)] md:h-[calc(100vh-90px)]">
          <Outlet />
        </ScrollArea>
      </main>
      <MusicPlayer />
    </div>
  );
};
