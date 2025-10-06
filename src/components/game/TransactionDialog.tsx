
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { Player, Game, HistoryEntry } from '@/lib/types';
import { Landmark } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type TransactionType = 'pay-bank' | 'collect-bank' | 'pay-player' | 'collect-player';

interface TransactionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  type: TransactionType;
  game: Game;
  currentPlayer: Player;
  onTransaction: (newState: Partial<Game>) => void;
}

export function TransactionDialog({ isOpen, onOpenChange, type, game, currentPlayer, onTransaction }: TransactionDialogProps) {
  const [amount, setAmount] = useState('');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const { toast } = useToast();

  const otherPlayers = game.players.filter((p) => p.id !== currentPlayer.id && p.status === 'active');

  const getTitle = () => {
    switch (type) {
      case 'pay-bank': return 'Pagar al Banco';
      case 'collect-bank': return 'Cobrar del Banco';
      case 'pay-player': return 'Pagar a Otro Jugador';
      case 'collect-player': return 'Cobrar de Otro Jugador';
      default: return 'Transacción';
    }
  };

  const getActionText = () => {
    return type.startsWith('pay') ? 'Pagar' : 'Cobrar';
  };
  
  const requiresPlayer = type === 'pay-player' || type === 'collect-player';

  const handleTransaction = () => {
    const numericAmount = parseInt(amount, 10);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast({ title: 'Monto Inválido', description: 'Por favor, ingrese un número positivo válido.', variant: 'destructive' });
      return;
    }

    if (requiresPlayer && !selectedPlayerId) {
      toast({ title: 'Ningún Jugador Seleccionado', description: 'Por favor, seleccione un jugador para la transacción.', variant: 'destructive' });
      return;
    }
    
    let description = '';
    const newPlayers = game.players.map(p => ({...p}));
    const payingPlayerIndex = newPlayers.findIndex(p => p.id === currentPlayer.id)!;
    
    if (type.startsWith('pay')) {
        if(newPlayers[payingPlayerIndex].balance < numericAmount) {
            toast({ title: 'Fondos Insuficientes', description: 'No tienes suficiente dinero para realizar este pago.', variant: 'destructive' });
            return;
        }
        newPlayers[payingPlayerIndex].balance -= numericAmount;
    } else {
        newPlayers[payingPlayerIndex].balance += numericAmount;
    }

    if(requiresPlayer) {
        const otherPlayerIndex = newPlayers.findIndex(p => p.id === selectedPlayerId)!;
        const otherPlayer = newPlayers[otherPlayerIndex];

        if(type === 'pay-player') {
            newPlayers[otherPlayerIndex].balance += numericAmount;
            description = `${currentPlayer.playerName} le pagó $${numericAmount} a ${otherPlayer.playerName}.`;
        } else { // collect-player
             if(otherPlayer.balance < numericAmount) {
                toast({ title: 'Fondos Insuficientes', description: `${otherPlayer.playerName} no tiene suficiente dinero para pagarte.`, variant: 'destructive' });
                return;
            }
            newPlayers[otherPlayerIndex].balance -= numericAmount;
            description = `${currentPlayer.playerName} cobró $${numericAmount} de ${otherPlayer.playerName}.`;
        }
    } else {
        if(type === 'pay-bank') {
            description = `${currentPlayer.playerName} le pagó $${numericAmount} al banco.`;
        } else {
            description = `${currentPlayer.playerName} cobró $${numericAmount} del banco.`;
        }
    }

    onTransaction({
      players: newPlayers,
      history: [{ timestamp: Date.now(), description }, ...game.history],
    });

    setAmount('');
    setSelectedPlayerId(null);
    onOpenChange(false);
  };

  const isFormValid = () => {
    const numericAmount = parseInt(amount, 10);
    if(isNaN(numericAmount) || numericAmount <= 0) return false;
    if(requiresPlayer && !selectedPlayerId) return false;
    return true;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-headline">{getTitle()}</DialogTitle>
          <DialogDescription>
            {type.startsWith('pay') ? 'Introduce la cantidad a pagar.' : 'Introduce la cantidad a cobrar.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {requiresPlayer ? (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="player" className="text-right">Jugador</Label>
              <Select onValueChange={setSelectedPlayerId}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecciona un jugador..." />
                </SelectTrigger>
                <SelectContent>
                  {otherPlayers.map((player) => (
                    <SelectItem key={player.id} value={player.id}>
                      {player.playerName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
             <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                <Landmark className="h-5 w-5" />
                <span>Al / Del Banco</span>
             </div>
          )}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">Monto</Label>
            <div className="relative col-span-3">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-7"
                    placeholder="0"
                />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button disabled={!isFormValid()}>
                {getActionText()} ${amount || 0}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Confirmar Transacción?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. ¿Estás seguro de que quieres {getActionText().toLowerCase()} ${amount || 0}?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleTransaction}>Confirmar</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
