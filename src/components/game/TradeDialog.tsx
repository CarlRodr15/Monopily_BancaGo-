
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import type { Player, Property, Game, HistoryEntry, TradeOffer } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { ArrowRightLeft, Lightbulb, Train } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { PlayerIcons } from '@/lib/icons';

interface TradeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlayer: Player;
  game: Game;
  onStateChange: (newState: Partial<Game>) => void;
}

const typeIcons = {
    railroad: <Train className="h-4 w-4 ml-1 text-muted-foreground inline" />,
    utility: <Lightbulb className="h-4 w-4 ml-1 text-muted-foreground inline" />,
    property: null,
};

export function TradeDialog({ isOpen, onOpenChange, currentPlayer, game, onStateChange }: TradeDialogProps) {
  const { toast } = useToast();
  const otherPlayers = game.players.filter(p => p.id !== currentPlayer.id && p.status === 'active');

  const [tradePartnerId, setTradePartnerId] = useState<string | null>(null);
  const [yourOffer, setYourOffer] = useState<{ properties: string[], money: number }>({ properties: [], money: 0 });
  const [theirOffer, setTheirOffer] = useState<{ properties: string[], money: number }>({ properties: [], money: 0 });

  const tradePartner = useMemo(() => game.players.find(p => p.id === tradePartnerId), [tradePartnerId, game.players]);

  // Limpiar el estado del formulario cuando se cierra o cambia el socio comercial
  useEffect(() => {
    if (isOpen) {
      setYourOffer({ properties: [], money: 0 });
      setTheirOffer({ properties: [], money: 0 });
    } else {
      // Retrasar el reseteo del socio comercial para evitar un parpadeo
      setTimeout(() => setTradePartnerId(null), 150);
    }
  }, [isOpen, tradePartnerId]);


  const yourTotalValue = useMemo(() => {
    const propertiesValue = yourOffer.properties.reduce((acc, propId) => {
        const property = currentPlayer.properties.find(p => p.id === propId);
        return acc + (property?.mortgageValue ?? 0);
    }, 0);
    return propertiesValue + yourOffer.money;
  }, [yourOffer, currentPlayer.properties]);

  const theirTotalValue = useMemo(() => {
    if (!tradePartner) return 0;
    const propertiesValue = theirOffer.properties.reduce((acc, propId) => {
        const property = tradePartner.properties.find(p => p.id === propId);
        return acc + (property?.mortgageValue ?? 0);
    }, 0);
    return propertiesValue + theirOffer.money;
  }, [theirOffer, tradePartner]);


  const handleProposeTrade = () => {
    if (!tradePartner) return;

    if (currentPlayer.balance < yourOffer.money) {
      toast({ title: "Fondos Insuficientes", description: "No tienes suficiente dinero para esta oferta.", variant: "destructive" });
      return;
    }
    if (tradePartner.balance < theirOffer.money) {
      toast({ title: "Fondos Insuficientes", description: `${tradePartner.playerName} no tiene suficiente dinero para esta oferta.`, variant: "destructive" });
      return;
    }
    
    const offer: TradeOffer = {
        fromPlayerId: currentPlayer.id,
        toPlayerId: tradePartner.id,
        propertiesOffered: currentPlayer.properties.filter(p => yourOffer.properties.includes(p.id)),
        moneyOffered: yourOffer.money,
        propertiesRequested: tradePartner.properties.filter(p => theirOffer.properties.includes(p.id)),
        moneyRequested: theirOffer.money,
    };

    const newPlayers = game.players.map(p => {
        if (p.id === currentPlayer.id) {
            const newBalance = p.balance - offer.moneyOffered + offer.moneyRequested;
            const propertiesToRemove = new Set(offer.propertiesOffered.map(pr => pr.id));
            const newProperties = [...p.properties.filter(pr => !propertiesToRemove.has(pr.id)), ...offer.propertiesRequested];
            return { ...p, balance: newBalance, properties: newProperties };
        }
        if (p.id === tradePartner.id) {
            const newBalance = p.balance + offer.moneyOffered - offer.moneyRequested;
            const propertiesToRemove = new Set(offer.propertiesRequested.map(pr => pr.id));
            const newProperties = [...p.properties.filter(pr => !propertiesToRemove.has(pr.id)), ...offer.propertiesOffered];
            return { ...p, balance: newBalance, properties: newProperties };
        }
        return p;
    });

    const newHistoryEntry: HistoryEntry = { 
        timestamp: Date.now(), 
        trade: {
            fromPlayerId: currentPlayer.id,
            toPlayerId: tradePartner.id,
            offer: offer,
        }
    };

    onStateChange({ players: newPlayers, history: [newHistoryEntry, ...game.history] });

    toast({ title: "¡Intercambio Realizado!", description: "Las propiedades y el dinero han sido transferidos." });
    onOpenChange(false);
  };

  const isProposalValid = yourOffer.properties.length > 0 || yourOffer.money > 0 || theirOffer.properties.length > 0 || theirOffer.money > 0;
  
  const propertiesWithoutHouses = (player: Player) => player.properties.filter(p => (p.houses ?? 0) === 0);

  const renderPropertyList = (
      player: Player, 
      selection: string[], 
      onToggle: (propertyId: string) => void
  ) => (
    <div className="space-y-2">
      {propertiesWithoutHouses(player).map(prop => (
        <div key={prop.id} className="flex items-center space-x-3 relative pl-4">
           <div 
                className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-1.5 rounded-full" 
                style={{ backgroundColor: prop.color }}
            />
          <Checkbox 
            id={`${player.id}-${prop.id}`} 
            checked={selection.includes(prop.id)}
            onCheckedChange={() => onToggle(prop.id)}
          />
          <label
            htmlFor={`${player.id}-${prop.id}`}
            className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center", prop.mortgaged && "text-destructive")}
          >
            {prop.propertyName} {prop.mortgaged && "(Hipotecada)"}
            {typeIcons[prop.type]}
          </label>
        </div>
      ))}
      {propertiesWithoutHouses(player).length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Sin propiedades intercambiables.</p>}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-headline">Proponer Intercambio</DialogTitle>
          <DialogDescription>
            Selecciona a un jugador y construye una oferta. Solo se pueden intercambiar propiedades sin casas.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
            <div className="space-y-2">
                <Label htmlFor="trade-partner">Intercambiar con:</Label>
                <Select onValueChange={(val) => setTradePartnerId(val)} value={tradePartnerId ?? undefined}>
                    <SelectTrigger id="trade-partner">
                        <SelectValue placeholder="Selecciona un jugador..." />
                    </SelectTrigger>
                    <SelectContent>
                        {otherPlayers.map(p => <SelectItem key={p.id} value={p.id}>{p.playerName}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>

            {tradePartner && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 animate-in fade-in">
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-center">Tu Oferta</h3>
                        <div className="p-4 border rounded-lg space-y-4">
                            <h4 className="font-medium">Propiedades:</h4>
                            <ScrollArea className="h-40 pr-3">
                                {renderPropertyList(
                                    currentPlayer,
                                    yourOffer.properties,
                                    (id) => setYourOffer(prev => ({...prev, properties: prev.properties.includes(id) ? prev.properties.filter(pId => pId !== id) : [...prev.properties, id]}))
                                )}
                            </ScrollArea>
                            <Separator />
                            <div className="space-y-2">
                                <Label htmlFor="your-money">Dinero:</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                                    <Input 
                                        id="your-money" 
                                        type="number" 
                                        placeholder="0"
                                        className="pl-7"
                                        value={yourOffer.money || ''}
                                        onChange={(e) => setYourOffer(prev => ({ ...prev, money: Math.max(0, parseInt(e.target.value) || 0) }))}
                                        max={currentPlayer.balance}
                                    />
                                </div>
                            </div>
                             <Separator />
                            <div className="flex justify-between items-center font-bold text-lg">
                                <span>Valor Total de la Oferta:</span>
                                <span>${yourTotalValue.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-center">Oferta de {tradePartner.playerName}</h3>
                         <div className="p-4 border rounded-lg space-y-4">
                            <h4 className="font-medium">Propiedades:</h4>
                             <ScrollArea className="h-40 pr-3">
                                {renderPropertyList(
                                    tradePartner,
                                    theirOffer.properties,
                                    (id) => setTheirOffer(prev => ({...prev, properties: prev.properties.includes(id) ? prev.properties.filter(pId => pId !== id) : [...prev.properties, id]}))
                                )}
                            </ScrollArea>
                            <Separator />
                            <div className="space-y-2">
                                <Label htmlFor="their-money">Dinero:</Label>
                                 <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                                    <Input 
                                        id="their-money" 
                                        type="number" 
                                        placeholder="0"
                                        className="pl-7"
                                        value={theirOffer.money || ''}
                                        onChange={(e) => setTheirOffer(prev => ({ ...prev, money: Math.max(0, parseInt(e.target.value) || 0) }))}
                                        max={tradePartner.balance}
                                    />
                                </div>
                            </div>
                             <Separator />
                             <div className="flex justify-between items-center font-bold text-lg">
                                <span>Valor Total de la Oferta:</span>
                                <span>${theirTotalValue.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button disabled={!tradePartner || !isProposalValid}>
                    <ArrowRightLeft className="mr-2 h-4 w-4" />
                    Proponer Intercambio
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar Intercambio</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta acción es irreversible y moverá las propiedades y el dinero inmediatamente. ¿Estás seguro de que deseas realizar este intercambio con {tradePartner?.playerName}?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleProposeTrade}>Confirmar</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
