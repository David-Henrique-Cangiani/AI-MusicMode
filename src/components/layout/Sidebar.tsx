import React, { useState, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Search, PlusSquare, Heart, Music2, Menu, LogIn, LogOut, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMusicLibrary } from '@/contexts/MusicLibraryContext';
import { useAuth } from '@/contexts/AuthContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DonationButton } from '@/components/DonationButton';

const navItems = [
  { icon: Home, label: 'Início', path: '/' },
  { icon: Search, label: 'Buscar', path: '/search' },
];

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const { playlists } = useMusicLibrary();
  const { user, profile, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleLogoClick = () => {
    clickCountRef.current += 1;
    
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
    }
    
    if (clickCountRef.current >= 3) {
      clickCountRef.current = 0;
      navigate('/admin');
      setIsOpen(false);
    } else {
      clickTimerRef.current = setTimeout(() => {
        clickCountRef.current = 0;
      }, 500);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  const SidebarContent = () => (
    <>
      {/* Logo with triple-click Admin access */}
      <div className="p-6">
        <button 
          onClick={handleLogoClick}
          className="flex items-center gap-2 group outline-none"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg">
            <Music2 className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold text-foreground">AI-MusicMode</span>
        </button>
      </div>

      {/* User Section */}
      <div className="px-3 mb-4">
        {user ? (
          <div className="bg-card/50 rounded-lg p-3">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {profile?.name || 'Usuário'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => {
              navigate('/auth');
              setIsOpen(false);
            }}
            className="w-full gap-2"
          >
            <LogIn className="w-4 h-4" />
            Entrar / Cadastrar
          </Button>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="px-3">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                onClick={() => setIsOpen(false)}
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

      {/* Library Actions - Only for logged in users */}
      {user && (
        <>
          <nav className="px-3">
            <ul className="space-y-1">
              <li>
                <NavLink
                  to="/create-playlist"
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-medium transition-all',
                      isActive
                        ? 'bg-sidebar-accent text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    )
                  }
                >
                  <PlusSquare className="w-6 h-6" />
                  Criar Playlist
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/liked"
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-medium transition-all',
                      isActive
                        ? 'bg-sidebar-accent text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    )
                  }
                >
                  <Heart className="w-6 h-6" />
                  Músicas Curtidas
                </NavLink>
              </li>
            </ul>
          </nav>

          {/* Divider */}
          <div className="mx-6 my-4 border-t border-border" />

          {/* Playlists */}
          <ScrollArea className="flex-1 px-3">
            <p className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Suas Playlists
            </p>
            <ul className="space-y-1 pb-4">
              {playlists.map((playlist) => (
                <li key={playlist.id}>
                  <NavLink
                    to={`/playlist/${playlist.id}`}
                    onClick={() => setIsOpen(false)}
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
              {playlists.length === 0 && (
                <li className="px-4 py-2 text-sm text-muted-foreground">
                  Nenhuma playlist criada
                </li>
              )}
            </ul>
          </ScrollArea>
        </>
      )}

      {/* Message for non-logged users */}
      {!user && (
        <div className="px-6 py-4">
          <p className="text-sm text-muted-foreground text-center">
            Faça login para criar playlists e curtir músicas
          </p>
        </div>
      )}

      {/* Donation Button */}
      <div className="mt-auto px-3 pb-4">
        <DonationButton />
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 bottom-[90px] w-[280px] bg-sidebar flex-col z-40 hidden md:flex">
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-sidebar/95 backdrop-blur-xl border-b border-border z-50 flex items-center px-4 md:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="mr-3">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-0 bg-sidebar border-border">
            <SidebarContent />
          </SheetContent>
        </Sheet>
        
        <button onClick={handleLogoClick} className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
            <Music2 className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">AI-MusicMode</span>
        </button>
      </header>
    </>
  );
};
