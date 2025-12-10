-- Create profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  avatar_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create user_likes table for per-user likes
CREATE TABLE public.user_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  song_id uuid NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, song_id)
);

ALTER TABLE public.user_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own likes"
ON public.user_likes FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can add their own likes"
ON public.user_likes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own likes"
ON public.user_likes FOR DELETE
USING (auth.uid() = user_id);

-- Add user_id to playlists table
ALTER TABLE public.playlists ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop old permissive policies on playlists
DROP POLICY IF EXISTS "Anyone can create playlists" ON public.playlists;
DROP POLICY IF EXISTS "Anyone can delete playlists" ON public.playlists;
DROP POLICY IF EXISTS "Anyone can update playlists" ON public.playlists;
DROP POLICY IF EXISTS "Anyone can view playlists" ON public.playlists;

-- Create new user-specific policies for playlists
CREATE POLICY "Users can view their own playlists"
ON public.playlists FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own playlists"
ON public.playlists FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own playlists"
ON public.playlists FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own playlists"
ON public.playlists FOR DELETE
USING (auth.uid() = user_id);

-- Drop old permissive policies on playlist_songs
DROP POLICY IF EXISTS "Anyone can add songs to playlists" ON public.playlist_songs;
DROP POLICY IF EXISTS "Anyone can remove songs from playlists" ON public.playlist_songs;
DROP POLICY IF EXISTS "Anyone can view playlist songs" ON public.playlist_songs;

-- Create new policies for playlist_songs (based on playlist ownership)
CREATE POLICY "Users can view their playlist songs"
ON public.playlist_songs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.playlists
    WHERE playlists.id = playlist_songs.playlist_id
    AND playlists.user_id = auth.uid()
  )
);

CREATE POLICY "Users can add songs to their playlists"
ON public.playlist_songs FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.playlists
    WHERE playlists.id = playlist_songs.playlist_id
    AND playlists.user_id = auth.uid()
  )
);

CREATE POLICY "Users can remove songs from their playlists"
ON public.playlist_songs FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.playlists
    WHERE playlists.id = playlist_songs.playlist_id
    AND playlists.user_id = auth.uid()
  )
);

-- Make audio bucket private for signed URLs
UPDATE storage.buckets SET public = false WHERE id = 'audio';

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();