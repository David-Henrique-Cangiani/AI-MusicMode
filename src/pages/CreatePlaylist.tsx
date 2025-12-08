import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, ImagePlus, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

const CreatePlaylist: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      const url = URL.createObjectURL(file);
      setCoverPreview(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: 'Erro',
        description: 'Nome da playlist é obrigatório',
        variant: 'destructive',
      });
      return;
    }

    // For now, just show a success message
    // In the future, this will save to the database
    toast({
      title: 'Playlist criada!',
      description: `"${name}" foi criada com sucesso.`,
    });
    
    navigate('/library');
  };

  return (
    <div className="min-h-full p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-foreground mb-8">Criar Playlist</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Cover Upload */}
          <div className="flex items-start gap-6">
            <label className="cursor-pointer group">
              <div className="w-48 h-48 bg-card rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-border hover:border-primary transition-colors overflow-hidden">
                {coverPreview ? (
                  <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <ImagePlus className="w-12 h-12 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="text-sm text-muted-foreground mt-2">Adicionar capa</span>
                  </>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                className="hidden"
              />
            </label>

            <div className="flex-1 space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Nome da Playlist
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Minha Playlist Incrível"
                  className="bg-card border-border"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Descrição (opcional)
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva sua playlist..."
                  className="bg-card border-border resize-none"
                  rows={4}
                />
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="bg-card/50 rounded-lg p-4 flex items-center gap-3">
            <Music className="w-5 h-5 text-primary" />
            <p className="text-sm text-muted-foreground">
              Após criar a playlist, você poderá adicionar músicas a ela navegando pela biblioteca.
            </p>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate(-1)}
            >
              Cancelar
            </Button>
            <Button type="submit" className="gap-2">
              <Save className="w-4 h-4" />
              Criar Playlist
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePlaylist;
