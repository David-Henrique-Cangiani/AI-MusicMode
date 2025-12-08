import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Search, Library, PlusSquare, Heart, Music2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { mockPlaylists } from '@/data/mockData';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const navItems = [
  { icon: Home, label: 'Início', path: '/' },
  { icon: Search, label: 'Buscar', path: '/search' },
  { icon: Library, label: 'Sua Biblioteca', path: '/library' },
];

const libraryItems = [
  { icon: PlusSquare, label: 'Criar Playlist', path: '/create-playlist' },
  { icon: Heart, label: 'Músicas Curtidas', path: '/liked' },
];

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <aside className="fixed left-0 top-0 bottom-[90px] w-[280px] bg-sidebar flex flex-col z-40">
      {/* Logo with hidden Admin access */}
      <div className="p-6">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 group outline-none">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg">
                <Music2 className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold text-foreground">AI-MusicMode</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuItem onClick={() => navigate('/admin')}>
              Painel Admin
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Main Navigation */}
      <nav className="px-3">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-medium transition-all',
                    isActive
                      ? 'bg-sidebar-accent text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )
                }
              >
                <item.icon className="w-6 h-6" />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Divider */}
      <div className="mx-6 my-4 border-t border-border" />

      {/* Library Actions */}
      <nav className="px-3">
        <ul className="space-y-1">
          {libraryItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-medium transition-all',
                    isActive
                      ? 'bg-sidebar-accent text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )
                }
              >
                <item.icon className="w-6 h-6" />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Divider */}
      <div className="mx-6 my-4 border-t border-border" />

      {/* Playlists */}
      <ScrollArea className="flex-1 px-3">
        <ul className="space-y-1 pb-4">
          {mockPlaylists.map((playlist) => (
            <li key={playlist.id}>
              <NavLink
                to={`/playlist/${playlist.id}`}
                className={({ isActive }) =>
                  cn(
                    'block px-4 py-2 rounded-lg text-sm transition-all truncate',
                    isActive
                      ? 'bg-sidebar-accent text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )
                }
              >
                {playlist.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </ScrollArea>
    </aside>
  );
};
