import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PlayerProvider } from "@/contexts/PlayerContext";
import { MusicLibraryProvider } from "@/contexts/MusicLibraryContext";
import { MainLayout } from "@/components/layout/MainLayout";
import Index from "./pages/Index";
import Search from "./pages/Search";
import Library from "./pages/Library";
import Playlist from "./pages/Playlist";
import LikedSongs from "./pages/LikedSongs";
import Admin from "./pages/Admin";
import CreatePlaylist from "./pages/CreatePlaylist";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <MusicLibraryProvider>
        <PlayerProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route element={<MainLayout />}>
                <Route path="/" element={<Index />} />
                <Route path="/search" element={<Search />} />
                <Route path="/library" element={<Library />} />
                <Route path="/playlist/:id" element={<Playlist />} />
                <Route path="/liked" element={<LikedSongs />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/create-playlist" element={<CreatePlaylist />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </PlayerProvider>
      </MusicLibraryProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
