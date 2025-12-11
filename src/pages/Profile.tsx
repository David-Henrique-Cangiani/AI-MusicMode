import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Camera, Mail, Lock, Loader2, ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';

const nameSchema = z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100, 'Nome muito longo');

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setAvatarUrl(profile.avatar_url || null);
    }
  }, [profile]);

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Imagem muito grande (máximo 5MB)');
      return;
    }

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile || !user) return avatarUrl;

    setUploadingAvatar(true);
    try {
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('covers')
        .upload(filePath, avatarFile, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('covers')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast.error('Erro ao fazer upload da imagem');
      return null;
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async () => {
    const nameResult = nameSchema.safeParse(name);
    if (!nameResult.success) {
      setNameError(nameResult.error.errors[0].message);
      return;
    }
    setNameError(null);

    if (!user) return;

    setSaving(true);
    try {
      let newAvatarUrl = avatarUrl;
      
      if (avatarFile) {
        const uploadedUrl = await uploadAvatar();
        if (uploadedUrl) {
          newAvatarUrl = uploadedUrl;
        }
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          name: name.trim(),
          avatar_url: newAvatarUrl,
        })
        .eq('id', user.id);

      if (error) throw error;

      setAvatarUrl(newAvatarUrl);
      setAvatarFile(null);
      setAvatarPreview(null);
      toast.success('Perfil atualizado com sucesso!');
      
      // Force reload to update profile in context
      window.location.reload();
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      toast.error('Erro ao salvar perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async () => {
    if (!user?.email) {
      toast.error('Email não encontrado');
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) throw error;

      toast.success('Email de recuperação enviado! Verifique sua caixa de entrada.');
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      toast.error('Erro ao enviar email de recuperação');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const displayAvatar = avatarPreview || avatarUrl;
  const initials = name ? name.slice(0, 2).toUpperCase() : 'U';

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Meu Perfil</h1>
        </div>

        <div className="space-y-8">
          {/* Avatar Section */}
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4 text-foreground">Foto de Perfil</h2>
            
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative">
                <Avatar className="w-24 h-24 border-4 border-primary/20">
                  <AvatarImage src={displayAvatar || undefined} />
                  <AvatarFallback className="text-2xl bg-primary/20 text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-2 bg-primary rounded-full text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <Camera className="w-4 h-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarSelect}
                  className="hidden"
                />
              </div>

              <div className="text-center sm:text-left">
                <p className="text-sm text-muted-foreground mb-2">
                  Clique no ícone da câmera para alterar sua foto
                </p>
                <p className="text-xs text-muted-foreground">
                  Formatos aceitos: JPG, PNG, GIF (máx. 5MB)
                </p>
              </div>
            </div>
          </div>

          {/* Personal Info Section */}
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4 text-foreground">Informações Pessoais</h2>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setNameError(null);
                    }}
                    placeholder="Seu nome"
                    className="pl-10 bg-background/50"
                  />
                </div>
                {nameError && <p className="text-sm text-destructive">{nameError}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={user.email || ''}
                    disabled
                    className="pl-10 bg-background/30 text-muted-foreground cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-muted-foreground">O email não pode ser alterado</p>
              </div>
            </div>
          </div>

          {/* Security Section */}
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4 text-foreground">Segurança</h2>
            
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="font-medium text-foreground">Alterar Senha</p>
                  <p className="text-sm text-muted-foreground">
                    Enviaremos um link para seu email para redefinir sua senha
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleResetPassword}
                  className="shrink-0"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Enviar Email
                </Button>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSaveProfile}
            disabled={saving || uploadingAvatar}
            className="w-full"
            size="lg"
          >
            {(saving || uploadingAvatar) ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Salvar Alterações
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
