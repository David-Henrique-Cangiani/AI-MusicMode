import React, { useState, useRef, useEffect } from 'react';
import { useMusicLibrary } from '@/contexts/MusicLibraryContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Lock, Plus, Trash2, Music, LogOut, FileText, Image, FileAudio, Loader2, QrCode, MessageSquare, Send } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

interface SupportTicket {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  message: string;
  status: string;
  created_at: string;
}

export default function Admin() {
  const navigate = useNavigate();
  const { songs, addSong, removeSong, updateSong, isAdmin } = useMusicLibrary();
  const { user, signOut } = useAuth();
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

  // PIX key state
  const [pixKey, setPixKey] = useState('');
  const [isSavingPix, setIsSavingPix] = useState(false);
  const [pixQrFile, setPixQrFile] = useState<File | null>(null);
  const [pixQrPreview, setPixQrPreview] = useState('');
  const [isUploadingPix, setIsUploadingPix] = useState(false);
  const pixQrInputRef = useRef<HTMLInputElement>(null);

  // Load PIX key on mount
  useEffect(() => {
    const loadPixKey = async () => {
      const { data } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'pix_key')
        .maybeSingle();
      if (data?.value) {
        setPixKey(data.value);
      }
    };
    if (isAdmin) {
      loadPixKey();
    }
  }, [isAdmin]);

  const handlePixQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPixQrFile(file);
      const url = URL.createObjectURL(file);
      setPixQrPreview(url);
      toast.success('Imagem selecionada!');
    }
  };

  const handleSavePixKey = async () => {
    setIsSavingPix(true);
    try {
      let valueToSave = pixKey;

      // If there's a file to upload, upload it first
      if (pixQrFile) {
        setIsUploadingPix(true);
        const uploadedUrl = await uploadToStorage(pixQrFile, 'covers');
        if (uploadedUrl) {
          valueToSave = uploadedUrl;
          setPixKey(uploadedUrl);
          setPixQrFile(null);
          if (pixQrPreview) {
            URL.revokeObjectURL(pixQrPreview);
            setPixQrPreview('');
          }
        } else {
          toast.error('Erro ao fazer upload da imagem!');
          setIsSavingPix(false);
          setIsUploadingPix(false);
          return;
        }
        setIsUploadingPix(false);
      }

      const { error } = await supabase
        .from('app_settings')
        .upsert({ key: 'pix_key', value: valueToSave }, { onConflict: 'key' });
      
      if (error) throw error;
      toast.success('Chave PIX salva com sucesso!');
    } catch (error) {
      console.error('Error saving PIX key:', error);
      toast.error('Erro ao salvar chave PIX');
    } finally {
      setIsSavingPix(false);
      setIsUploadingPix(false);
    }
  };

  // Support tickets state
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');
  const [sendingResponse, setSendingResponse] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      fetchTickets();
    }
  }, [isAdmin]);

  const fetchTickets = async () => {
    setLoadingTickets(true);
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setTickets(data);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoadingTickets(false);
    }
  };

  const handleSendResponse = async (ticketId: string, userId: string) => {
    if (!responseText.trim()) {
      toast.error('Digite uma resposta');
      return;
    }

    setSendingResponse(true);
    try {
      // Insert response
      const { error: responseError } = await supabase
        .from('support_responses')
        .insert({ ticket_id: ticketId, response: responseText.trim() });

      if (responseError) throw responseError;

      // Update ticket status
      await supabase
        .from('support_tickets')
        .update({ status: 'answered' })
        .eq('id', ticketId);

      // Create notification for user
      const { error: notifError } = await supabase
        .from('user_notifications')
        .insert({
          user_id: userId,
          title: 'Resposta do Suporte',
          message: responseText.trim().substring(0, 100) + (responseText.length > 100 ? '...' : ''),
          ticket_id: ticketId,
        });

      if (notifError) console.error('Error creating notification:', notifError);

      toast.success('Resposta enviada!');
      setResponseText('');
      setRespondingTo(null);
      fetchTickets();
    } catch (error) {
      console.error('Error sending response:', error);
      toast.error('Erro ao enviar resposta');
    } finally {
      setSendingResponse(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
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
            <div className="mx-auto w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Acesso Negado</CardTitle>
            <p className="text-muted-foreground mt-2">
              {user ? 'Você não tem permissão para acessar esta área.' : 'Faça login com a conta de administrador.'}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {!user ? (
              <Button onClick={() => navigate('/auth')} className="w-full">
                Fazer Login
              </Button>
            ) : (
              <Button variant="outline" onClick={() => navigate('/')} className="w-full">
                Voltar para Início
              </Button>
            )}
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
          <p className="text-muted-foreground">Gerencie suas músicas e suporte</p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
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

      {/* PIX Configuration */}
      <Card className="bg-card/50 backdrop-blur-sm border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            Configurar Doação PIX
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Upload do QR Code PIX</Label>
            <input
              ref={pixQrInputRef}
              type="file"
              accept="image/*"
              onChange={handlePixQrUpload}
              className="hidden"
              disabled={isSavingPix}
            />
            <div className="flex gap-2 items-center">
              <Button
                type="button"
                variant="outline"
                onClick={() => pixQrInputRef.current?.click()}
                className="flex-1"
                disabled={isSavingPix}
              >
                <Image className="w-4 h-4 mr-2" />
                {pixQrFile ? pixQrFile.name : 'Selecionar Imagem QR Code'}
              </Button>
              {(pixQrPreview || (pixKey && pixKey.startsWith('http'))) && (
                <img 
                  src={pixQrPreview || pixKey} 
                  alt="QR Code Preview" 
                  className="w-12 h-12 rounded object-contain bg-white p-1"
                />
              )}
            </div>
          </div>
          
          <div className="relative flex items-center">
            <div className="flex-grow border-t border-border"></div>
            <span className="px-3 text-xs text-muted-foreground">ou</span>
            <div className="flex-grow border-t border-border"></div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pixKey">Chave PIX (texto)</Label>
            <Input
              id="pixKey"
              value={pixKey}
              onChange={(e) => setPixKey(e.target.value)}
              placeholder="CPF, email, telefone ou chave aleatória..."
              disabled={isSavingPix || !!pixQrFile}
            />
            <p className="text-xs text-muted-foreground">
              Cole sua chave PIX para exibir como texto copiável.
            </p>
          </div>
          
          <Button onClick={handleSavePixKey} disabled={isSavingPix} className="w-full">
            {isSavingPix ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isUploadingPix ? 'Fazendo upload...' : 'Salvando...'}
              </>
            ) : (
              'Salvar Configuração PIX'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Support Tickets */}
      <Card className="bg-card/50 backdrop-blur-sm border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Tickets de Suporte
          </CardTitle>
          <CardDescription>
            Mensagens dos usuários
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingTickets ? (
            <p className="text-center text-muted-foreground py-4">Carregando...</p>
          ) : tickets.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">Nenhum ticket pendente</p>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{ticket.user_name}</p>
                      <p className="text-sm text-muted-foreground">{ticket.user_email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={ticket.status === 'open' ? 'secondary' : 'default'}>
                        {ticket.status === 'open' ? 'Aguardando' : ticket.status === 'answered' ? 'Respondido' : ticket.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(ticket.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-muted/50 rounded p-3">
                    <p className="text-sm whitespace-pre-wrap">{ticket.message}</p>
                  </div>
                  
                  {respondingTo === ticket.id ? (
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Digite sua resposta..."
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleSendResponse(ticket.id, ticket.user_id)}
                          disabled={sendingResponse}
                        >
                          {sendingResponse ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4 mr-2" />
                          )}
                          Enviar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setRespondingTo(null);
                            setResponseText('');
                          }}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setRespondingTo(ticket.id)}
                    >
                      Responder
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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
