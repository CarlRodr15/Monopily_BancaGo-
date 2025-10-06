
'use client';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { HistoryEntry, Player } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Repeat } from 'lucide-react';

interface HistorySheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  history: HistoryEntry[];
  players: Player[];
}

export function HistorySheet({ isOpen, onOpenChange, history, players }: HistorySheetProps) {
    
  const getPlayerName = (id: string) => players.find(p => p.id === id)?.playerName || 'Jugador Desconocido';

  const renderHistoryEntry = (entry: HistoryEntry) => {
    if (entry.description) {
      return (
        <div>
            <p className="font-medium">{entry.description}</p>
            <p className="text-sm text-muted-foreground mt-1">
                {formatDistanceToNow(entry.timestamp, { addSuffix: true, locale: es })}
            </p>
        </div>
      );
    }
    if (entry.trade) {
      const { fromPlayerId, toPlayerId, offer } = entry.trade;
      const fromPlayerName = getPlayerName(fromPlayerId);
      const toPlayerName = getPlayerName(toPlayerId);

      const offeredItems = [
        ...offer.propertiesOffered.map(p => p.propertyName),
        offer.moneyOffered > 0 && `$${offer.moneyOffered}`
      ].filter(Boolean).join(', ');

      const requestedItems = [
        ...offer.propertiesRequested.map(p => p.propertyName),
        offer.moneyRequested > 0 && `$${offer.moneyRequested}`
      ].filter(Boolean).join(', ');

      return (
         <div>
            <div className="flex flex-col text-sm">
                <div className="flex items-center gap-2 font-bold">
                    <Repeat className="h-4 w-4" />
                    <span>Intercambio Completado</span>
                </div>
                <div className="pl-6 border-l-2 ml-2 mt-1 space-y-1">
                    <p><span className="font-semibold">{fromPlayerName}</span> entregó: {offeredItems || 'Nada'}.</p>
                    <p><span className="font-semibold">{toPlayerName}</span> entregó: {requestedItems || 'Nada'}.</p>
                </div>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
                {formatDistanceToNow(entry.timestamp, { addSuffix: true, locale: es })}
            </p>
         </div>
      );
    }
    return null;
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="text-2xl font-headline">Historial de Transacciones</SheetTitle>
          <SheetDescription>Un registro de todas las acciones tomadas en este juego.</SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100%-8rem)] pr-4 mt-4">
          <div className="space-y-6">
            {history.map((entry, index) => (
              <div key={index} className="relative flex">
                <div className="absolute left-2.5 top-2.5 h-full w-px bg-border -z-10" />
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                </div>
                <div className="ml-4 flex-1">
                    {renderHistoryEntry(entry)}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
