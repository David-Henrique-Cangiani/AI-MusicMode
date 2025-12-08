import React, { useState, useRef } from 'react';
import { useMusicLibrary } from '@/contexts/MusicLibraryContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Plus, Trash2, Music, LogOut, FileText, Image, FileAudio, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Admin() {
  const { songs, addSong, removeSong, updateSong, isAdmin, login, logout } = useMusicLibrary();
  const [password, setPassword] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [duration, setDuration] = useState('180');
  const [audioFileName, setAudioFileName] = useState('');
  const [coverFileName, setCoverFileName] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState('');

  // File input refs
  const audioInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Lyrics edit state
  const [editingLyricsId, setEditingLyricsId] = useState<string | null>(null);
  const [editingLyrics, setEditingLyrics] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(password)) {
      toast.success('Login realizado com sucesso!');
      setPassword('');
    } else {
      toast.error('Senha incorreta!');
    }
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      setAudioFileName(file.name);
      
      // Try to extract title from filename
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      if (!title) {
        setTitle(nameWithoutExt);
      }
      
      // Get audio duration
      const url = URL.createObjectURL(file);
      const audio = new Audio(url);
      audio.addEventListener('loadedmetadata', () => {
        setDuration(Math.floor(audio.duration).toString());
        URL.revokeObjectURL(url);
      });
      
      toast.success('Áudio selecionado!');
    }
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverFileName(file.name);
      
      // Create preview
      const url = URL.createObjectURL(file);
      setCoverPreview(url);
      
      toast.success('Capa selecionada!');
    }
  };

  const uploadToStorage = async (file: File, bucket: string): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error(`Error uploading to ${bucket}:`, error);
      return null;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  };

  const handleAddSong = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !artist || !audioFile) {
      toast.error('Preencha os campos obrigatórios e selecione um arquivo de áudio!');
      return;
    }

    setIsUploading(true);

    try {
      // Upload audio file
      const audioUrl = await uploadToStorage(audioFile, 'audio');
      if (!audioUrl) {
        toast.error('Erro ao fazer upload do áudio!');
        setIsUploading(false);
        return;
      }

      // Upload cover if provided
      let coverUrl = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop';
      if (coverFile) {
        const uploadedCoverUrl = await uploadToStorage(coverFile, 'covers');
        if (uploadedCoverUrl) {
          coverUrl = uploadedCoverUrl;
        }
      }

      await addSong({
        title,
        artist,
        album: album || 'Single',
        audioUrl,
        coverUrl,
        duration: parseInt(duration) || 180,
        lyrics: lyrics || undefined,
      });

      toast.success('Música adicionada com sucesso!');
      
      // Reset form
      setTitle('');
      setArtist('');
      setAlbum('');
      setLyrics('');
      setDuration('180');
      setAudioFileName('');
      setCoverFileName('');
      setAudioFile(null);
      setCoverFile(null);
      if (coverPreview) {
        URL.revokeObjectURL(coverPreview);
        setCoverPreview('');
      }
    } catch (error) {
      console.error('Error adding song:', error);
      toast.error('Erro ao adicionar música!');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveSong = (id: string, songTitle: string) => {
    if (confirm(`Remover "${songTitle}"?`)) {
      removeSong(id);
      toast.success('Música removida!');
    }
  };

  const handleSaveLyrics = (id: string) => {
    updateSong(id, { lyrics: editingLyrics });
    setEditingLyricsId(null);
    toast.success('Letra salva!');
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card/50 backdrop-blur-sm border-border">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Área Administrativa</CardTitle>
            <p className="text-muted-foreground mt-2">Entre com a senha de administrador</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite a senha..."
                  className="mt-1"
                />
              </div>
              <Button type="submit" className="w-full">
                Entrar
              </Button>
            </form>
            <p className="text-xs text-muted-foreground text-center mt-4">
              Senha padrão: admin123
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 pb-32">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Painel Admin</h1>
          <p className="text-muted-foreground">Gerencie suas músicas</p>
        </div>
        <Button variant="outline" onClick={logout}>
          <LogOut className="w-4 h-4 mr-2" />
          Sair
        </Button>
      </div>

      {/* Add Song Form */}
      <Card className="bg-card/50 backdrop-blur-sm border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Adicionar Música
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddSong} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nome da música"
                disabled={isUploading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="artist">Artista *</Label>
              <Input
                id="artist"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="Nome do artista"
                disabled={isUploading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="album">Álbum</Label>
              <Input
                id="album"
                value={album}
                onChange={(e) => setAlbum(e.target.value)}
                placeholder="Nome do álbum"
                disabled={isUploading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duração (segundos)</Label>
              <Input
                id="duration"
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="180"
                disabled={isUploading}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Arquivo de Áudio *</Label>
              <input
                ref={audioInputRef}
                type="file"
                accept="audio/*"
                onChange={handleAudioUpload}
                className="hidden"
                disabled={isUploading}
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => audioInputRef.current?.click()}
                  className="flex-1"
                  disabled={isUploading}
                >
                  <FileAudio className="w-4 h-4 mr-2" />
                  {audioFileName || 'Selecionar Áudio'}
                </Button>
                {audioFileName && (
                  <div className="flex items-center px-3 bg-primary/20 rounded-md text-sm text-primary">
                    ✓ Selecionado
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Capa (opcional)</Label>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverUpload}
                className="hidden"
                disabled={isUploading}
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => coverInputRef.current?.click()}
                  className="flex-1"
                  disabled={isUploading}
                >
                  <Image className="w-4 h-4 mr-2" />
                  {coverFileName || 'Selecionar Capa'}
                </Button>
                {coverPreview && (
                  <img src={coverPreview} alt="Preview" className="w-10 h-10 rounded object-cover" />
                )}
              </div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="lyrics">Letra da Música</Label>
              <Textarea
                id="lyrics"
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)}
                placeholder="Cole a letra aqui..."
                rows={4}
                disabled={isUploading}
              />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" className="w-full" disabled={isUploading}>
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Fazendo upload...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Música
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Song List */}
      <Card className="bg-card/50 backdrop-blur-sm border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="w-5 h-5" />
            Músicas ({songs.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {songs.map((song) => (
              <div
                key={song.id}
                className="flex items-center gap-4 p-3 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <img
                  src={song.coverUrl}
                  alt={song.title}
                  className="w-12 h-12 rounded object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{song.title}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {song.artist} • {song.album}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="iconSm"
                    onClick={() => {
                      setEditingLyricsId(song.id);
                      setEditingLyrics(song.lyrics || '');
                    }}
                    title="Editar letra"
                  >
                    <FileText className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="iconSm"
                    onClick={() => handleRemoveSong(song.id, song.title)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Lyrics Edit Modal */}
      {editingLyricsId && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl bg-card border-border">
            <CardHeader>
              <CardTitle>Editar Letra</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={editingLyrics}
                onChange={(e) => setEditingLyrics(e.target.value)}
                placeholder="Cole a letra aqui..."
                rows={12}
              />
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setEditingLyricsId(null)}>
                  Cancelar
                </Button>
                <Button onClick={() => handleSaveLyrics(editingLyricsId)}>
                  Salvar Letra
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Instructions */}
      <Card className="bg-primary/10 border-primary/20">
        <CardContent className="p-4">
          <h3 className="font-semibold mb-2">📁 Como adicionar músicas:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
            <li>Clique em "Selecionar Áudio" e escolha seu arquivo MP3</li>
            <li>Preencha o título e artista</li>
            <li>Opcionalmente, adicione uma capa e letra</li>
            <li>Clique em "Adicionar Música"</li>
          </ol>
          <p className="text-xs text-muted-foreground mt-3">
            ✅ As músicas são salvas na nuvem e ficam disponíveis para todos os usuários!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
