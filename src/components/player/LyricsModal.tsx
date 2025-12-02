import React from 'react';
import { X, Music2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface LyricsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  artist: string;
  lyrics?: string;
}

export const LyricsModal: React.FC<LyricsModalProps> = ({
  isOpen,
  onClose,
  title,
  artist,
  lyrics,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/90 backdrop-blur-md z-[60] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-card/95 rounded-2xl border border-border shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h2 className="text-xl font-bold">{title}</h2>
            <p className="text-sm text-muted-foreground">{artist}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        <ScrollArea className="h-[60vh] p-6">
          {lyrics ? (
            <pre className="whitespace-pre-wrap font-sans text-foreground/90 leading-relaxed">
              {lyrics}
            </pre>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Music2 className="w-16 h-16 mb-4 opacity-50" />
              <p>Letra não disponível</p>
              <p className="text-sm mt-2">Adicione a letra no painel admin</p>
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};
