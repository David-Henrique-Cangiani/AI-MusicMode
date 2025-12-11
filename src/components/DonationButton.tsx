import React, { useState } from 'react';
import { Heart, Coffee, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface DonationButtonProps {
  className?: string;
}

export const DonationButton: React.FC<DonationButtonProps> = ({ className }) => {
  const [open, setOpen] = useState(false);

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

            {/* QR Code placeholder - replace with actual QR code image */}
            <div className="w-48 h-48 bg-card border-2 border-dashed border-primary/30 rounded-lg flex items-center justify-center">
              <p className="text-xs text-muted-foreground text-center p-4">
                Envie seu QR code PIX para exibir aqui
              </p>
            </div>

            <p className="text-xs text-muted-foreground">
              Escaneie o QR Code com seu app de banco
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
