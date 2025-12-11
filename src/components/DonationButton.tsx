import React, { useState, useEffect } from 'react';
import { Heart, Coffee, Copy, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface DonationButtonProps {
  className?: string;
}

export const DonationButton: React.FC<DonationButtonProps> = ({ className }) => {
  const [open, setOpen] = useState(false);
  const [pixKey, setPixKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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
    loadPixKey();
  }, []);

  const isImageUrl = pixKey?.startsWith('http') || pixKey?.startsWith('data:');

  const handleCopy = async () => {
    if (pixKey && !isImageUrl) {
      await navigator.clipboard.writeText(pixKey);
      setCopied(true);
      toast.success('Chave PIX copiada!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`group flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 hover:border-primary/50 transition-all cursor-pointer ${className}`}
      >
        <div className="flex items-center gap-2 text-primary">
          <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="font-semibold text-sm">Curtiu? Faça uma doação!</span>
        </div>
        <p className="text-xs text-muted-foreground text-center flex items-center gap-1">
          <Coffee className="w-3 h-3" />
          Feito com muito carinho e café
        </p>
        <p className="text-xs text-muted-foreground/70 text-center">
          Sem anúncios • Clique para ajudar
        </p>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-primary">
              <Heart className="w-5 h-5" />
              Obrigado por considerar uma doação!
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col items-center gap-4 py-4">
            <p className="text-sm text-muted-foreground text-center">
              Este site não possui nenhum tipo de adsense, foi feito com muito carinho e café ☕
            </p>
            
            <p className="text-sm text-muted-foreground text-center">
              Qualquer valor é bem-vindo e me ajuda a manter o projeto!
            </p>

            {pixKey ? (
              isImageUrl ? (
                <img 
                  src={pixKey} 
                  alt="QR Code PIX" 
                  className="w-48 h-48 rounded-lg object-contain bg-white p-2"
                />
              ) : (
                <div className="w-full space-y-2">
                  <div className="p-3 bg-card border border-border rounded-lg text-center break-all font-mono text-sm">
                    {pixKey}
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={handleCopy}
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copiar Chave PIX
                      </>
                    )}
                  </Button>
                </div>
              )
            ) : (
              <div className="w-48 h-48 bg-card border-2 border-dashed border-primary/30 rounded-lg flex items-center justify-center">
                <p className="text-xs text-muted-foreground text-center p-4">
                  Chave PIX não configurada
                </p>
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              {isImageUrl ? 'Escaneie o QR Code com seu app de banco' : 'Use a chave acima no seu app de banco'}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
