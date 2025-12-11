import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, MessageCircle, Clock, CheckCircle } from 'lucide-react';
import { Navigate } from 'react-router-dom';

interface Ticket {
  id: string;
  message: string;
  status: string;
  created_at: string;
  responses: { id: string; response: string; created_at: string }[];
}

export default function Help() {
  const { user, profile } = useAuth();
  const [message, setMessage] = useState('');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      fetchTickets();
    }
  }, [user]);

  const fetchTickets = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (ticketsError) throw ticketsError;

      const ticketsWithResponses = await Promise.all(
        (ticketsData || []).map(async (ticket) => {
          const { data: responses } = await supabase
            .from('support_responses')
            .select('*')
            .eq('ticket_id', ticket.id)
            .order('created_at', { ascending: true });

          return {
            ...ticket,
            responses: responses || [],
          };
        })
      );

      setTickets(ticketsWithResponses);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !profile) {
      toast.error('Você precisa estar logado');
      return;
    }

    if (!message.trim()) {
      toast.error('Por favor, descreva seu problema');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('support_tickets')
        .insert({
          user_id: user.id,
          user_email: user.email || '',
          user_name: profile.name,
          message: message.trim(),
        });

      if (error) throw error;

      toast.success('Mensagem enviada com sucesso!');
      setMessage('');
      fetchTickets();
    } catch (error) {
      console.error('Error submitting ticket:', error);
      toast.error('Erro ao enviar mensagem');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="secondary" className="gap-1"><Clock className="w-3 h-3" /> Aguardando</Badge>;
      case 'answered':
        return <Badge variant="default" className="gap-1 bg-green-600"><CheckCircle className="w-3 h-3" /> Respondido</Badge>;
      case 'closed':
        return <Badge variant="outline" className="gap-1">Fechado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-6 pb-32">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Central de Ajuda</h1>
          <p className="text-muted-foreground">
            Encontrou algum problema? Envie sua mensagem e responderemos o mais breve possível.
          </p>
        </div>

        {/* New Ticket Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Enviar Nova Mensagem
            </CardTitle>
            <CardDescription>
              Descreva o problema encontrado com o máximo de detalhes possível
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Nome:</span>
                  <p className="font-medium">{profile?.name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">E-mail:</span>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
              
              <Textarea
                placeholder="Descreva o problema encontrado..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                className="resize-none"
              />
              
              <Button type="submit" disabled={submitting} className="w-full gap-2">
                <Send className="w-4 h-4" />
                {submitting ? 'Enviando...' : 'Enviar Mensagem'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Tickets List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Suas Mensagens</h2>
          
          {loading ? (
            <p className="text-muted-foreground text-center py-8">Carregando...</p>
          ) : tickets.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Você ainda não enviou nenhuma mensagem
              </CardContent>
            </Card>
          ) : (
            tickets.map((ticket) => (
              <Card key={ticket.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {new Date(ticket.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {getStatusBadge(ticket.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-sm whitespace-pre-wrap">{ticket.message}</p>
                  </div>
                  
                  {ticket.responses.length > 0 && (
                    <div className="space-y-3 pt-2 border-t">
                      <p className="text-sm font-medium text-muted-foreground">Respostas:</p>
                      {ticket.responses.map((response) => (
                        <div key={response.id} className="bg-primary/10 rounded-lg p-4 border-l-4 border-primary">
                          <p className="text-sm whitespace-pre-wrap">{response.response}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(response.created_at).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}