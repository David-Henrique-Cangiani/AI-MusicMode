-- Tabela de músicas (pública para leitura, restrita para escrita)
CREATE TABLE public.songs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  album TEXT NOT NULL DEFAULT 'Single',
  duration INTEGER NOT NULL DEFAULT 180,
  cover_url TEXT,
  audio_url TEXT NOT NULL,
  lyrics TEXT,
  liked BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;

-- Política: Qualquer pessoa pode VER as músicas
CREATE POLICY "Anyone can view songs" 
ON public.songs 
FOR SELECT 
USING (true);

-- Política: Apenas admin autenticado pode inserir/atualizar/deletar
-- (Por enquanto deixo aberto para insert/update/delete via anon key para o admin funcionar)
CREATE POLICY "Anyone can insert songs" 
ON public.songs 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update songs" 
ON public.songs 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete songs" 
ON public.songs 
FOR DELETE 
USING (true);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_songs_updated_at
BEFORE UPDATE ON public.songs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket para áudios
INSERT INTO storage.buckets (id, name, public) VALUES ('audio', 'audio', true);

-- Storage bucket para capas
INSERT INTO storage.buckets (id, name, public) VALUES ('covers', 'covers', true);

-- Políticas de storage: qualquer um pode ver
CREATE POLICY "Anyone can view audio files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'audio');

CREATE POLICY "Anyone can view cover files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'covers');

-- Políticas de storage: qualquer um pode fazer upload (admin)
CREATE POLICY "Anyone can upload audio" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'audio');

CREATE POLICY "Anyone can upload covers" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'covers');

CREATE POLICY "Anyone can delete audio" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'audio');

CREATE POLICY "Anyone can delete covers" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'covers');