-- Create playlists table
CREATE TABLE public.playlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create playlist_songs junction table
CREATE TABLE public.playlist_songs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  playlist_id UUID NOT NULL REFERENCES public.playlists(id) ON DELETE CASCADE,
  song_id UUID NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(playlist_id, song_id)
);

-- Enable RLS
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_songs ENABLE ROW LEVEL SECURITY;

-- Policies for playlists (public access since no auth)
CREATE POLICY "Anyone can view playlists" ON public.playlists FOR SELECT USING (true);
CREATE POLICY "Anyone can create playlists" ON public.playlists FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update playlists" ON public.playlists FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete playlists" ON public.playlists FOR DELETE USING (true);

-- Policies for playlist_songs
CREATE POLICY "Anyone can view playlist songs" ON public.playlist_songs FOR SELECT USING (true);
CREATE POLICY "Anyone can add songs to playlists" ON public.playlist_songs FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can remove songs from playlists" ON public.playlist_songs FOR DELETE USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_playlists_updated_at
  BEFORE UPDATE ON public.playlists
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();