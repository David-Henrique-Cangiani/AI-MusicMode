import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MusicPlayer } from '@/components/player/MusicPlayer';
import { ScrollArea } from '@/components/ui/scroll-area';

export const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="ml-[280px] pb-[90px]">
        <ScrollArea className="h-[calc(100vh-90px)]">
          <Outlet />
        </ScrollArea>
      </main>
      <MusicPlayer />
    </div>
  );
};
