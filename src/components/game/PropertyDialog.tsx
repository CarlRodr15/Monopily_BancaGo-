
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import type { Player, Property, Game, HistoryEntry } from '@/lib/types';
import { Building, PlusCircle, Train, Lightbulb, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
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
} from "@/components/ui/alert-dialog";
import { AddPropertyDialog } from './AddPropertyDialog';
import { allProperties } from '@/lib/mock-data';

interface PropertyDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  player: Player | null; // Acepta que el jugador puede ser nulo inicialmente
  game: Game | null; // Acepta que el juego puede ser nulo inicialmente
  onStateChange: (newState: Partial<Game>) => void;
}

const typeIcons = {
    railroad: <Train className="h-4 w-4 ml-2 text-muted-foreground" />,
    utility: <Lightbulb className="h-4 w-4 ml-2 text-muted-foreground" />,
    property: null,
};


export function PropertyDialog({ isOpen, onOpenChange, player, game, onStateChange }: PropertyDialogProps) {
  const { toast } = useToast();
  const [isAddPropertyOpen, setIsAddPropertyOpen] = useState(false);

  // Añadimos una guarda para no renderizar nada si los datos no están listos
  if (!player || !game) {
    return null;
  }

  const handleMortgage = (property: Property) => {
    const newPlayers = game.players.map(p => {
        if(p.id === player.id) {
            const newBalance = p.balance + property.mortgageValue;
            const newProperties = p.properties.map(prop => prop.id === property.id ? {...prop, mortgaged: true} : prop);
            return {...p, balance: newBalance, properties: newProperties};
        }
        return p;
    });
    
    const description = `${player.playerName} hipotecó ${property.propertyName} por $${property.mortgageValue}.`;
    const newHistoryEntry: HistoryEntry = { timestamp: Date.now(), description };
    onStateChange({ players: newPlayers, history: [newHistoryEntry, ...game.history] });

    toast({
      title: 'Propiedad Hipotecada',
      description: description,
    });
  };

  const handleUnmortgage = (property: Property) => {
    const cost = Math.round(property.mortgageValue * 1.1);
     if (player.balance < cost) {
        toast({ title: 'Fondos Insuficientes', description: 'No tienes suficiente dinero para pagar la hipoteca.', variant: 'destructive'});
        return;
    }
    const newPlayers = game.players.map(p => {
        if(p.id === player.id) {
            const newBalance = p.balance - cost;
            const newProperties = p.properties.map(prop => prop.id === property.id ? {...prop, mortgaged: false} : prop);
            return {...p, balance: newBalance, properties: newProperties};
        }
        return p;
    });
    
    const description = `${player.playerName} pagó la hipoteca de ${property.propertyName} por $${cost}.`;
    const newHistoryEntry: HistoryEntry = { timestamp: Date.now(), description };
    onStateChange({ players: newPlayers, history: [newHistoryEntry, ...game.history] });

    toast({
      title: 'Hipoteca Pagada',
      description: description,
    });
  };

  const handleBuyHouse = (property: Property) => {
    if (!property.houseCost) return;
    if (player.balance < property.houseCost) {
      toast({ title: 'Fondos Insuficientes', description: 'No tienes dinero para comprar una casa.', variant: 'destructive' });
      return;
    }

    const newPlayers = game.players.map(p => {
      if (p.id === player.id) {
        const newProperties = p.properties.map(prop => {
          if (prop.id === property.id) {
            return { ...prop, houses: (prop.houses ?? 0) + 1 };
          }
          return prop;
        });
        return { ...p, balance: p.balance - property.houseCost!, properties: newProperties };
      }
      return p;
    });

    const description = `${player.playerName} compró una casa en ${property.propertyName}.`;
    const newHistoryEntry: HistoryEntry = { timestamp: Date.now(), description };
    onStateChange({ players: newPlayers, history: [newHistoryEntry, ...game.history] });
    toast({ title: 'Casa Comprada', description });
  };

  const canBuyHouse = (property: Property) => {
    if (property.type !== 'property' || (property.houses ?? 0) >= 5 || !property.color) {
      return false;
    }
    const colorGroupProperties = allProperties.filter(p => p.color === property.color);
    const playerColorGroupProperties = player.properties.filter(p => p.color === property.color);

    if (playerColorGroupProperties.length !== colorGroupProperties.length) {
      return false;
    }

    // Even build rule
    for (const otherProp of playerColorGroupProperties) {
      if ((otherProp.houses ?? 0) < (property.houses ?? 0)) {
        return false;
      }
    }
    
    return true;
  };

  const ownedPropertyIds = new Set(game.players.flatMap(p => p.properties.map(prop => prop.id)));
  const unownedProperties = allProperties.filter(p => !ownedPropertyIds.has(p.id));

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-headline">Administrar Propiedades</DialogTitle>
          <DialogDescription>
            Hipotecar, pagar hipotecas, comprar casas o adquirir nuevas propiedades.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-80 pr-4 -mr-4">
          <div className="space-y-4 py-4">
            {player.properties.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <Building className="mx-auto h-12 w-12 mb-4" />
                Aún no posees ninguna propiedad.
              </div>
            )}
            {player.properties.map((prop) => (
              <div
                key={prop.id}
                className={cn(
                    "flex flex-col gap-3 rounded-lg border p-4 relative pl-6 transition-colors",
                    prop.mortgaged && "bg-destructive/10 border-destructive/20"
                )}
              >
                 <div 
                    className="absolute left-0 top-0 bottom-0 w-2 rounded-l-lg" 
                    style={{ backgroundColor: prop.color }}
                />
                <div className="flex items-center justify-between">
                    <div className="flex-1 pr-4">
                        <div className="flex items-center">
                            <p className={cn("font-semibold", prop.mortgaged && "text-destructive line-through")}>{prop.propertyName}</p>
                            {typeIcons[prop.type]}
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {prop.mortgaged
                            ? `Hipotecada (Pagar $${Math.round(prop.mortgageValue * 1.1)})`
                            : `Valor de hipoteca: $${prop.mortgageValue}`}
                        </p>
                         {prop.type === 'property' && (prop.houses ?? 0) > 0 && (
                            <div className='flex items-center gap-1 mt-1'>
                                {Array.from({length: prop.houses!}).map((_, i) => (
                                    <Home key={i} className={cn("h-4 w-4", prop.houses === 5 ? 'text-red-500' : 'text-green-500')} />
                                ))}
                            </div>
                        )}
                    </div>
                    {prop.mortgaged ? (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                        <Button variant="outline">Pagar Hipoteca</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>¿Pagar hipoteca de {prop.propertyName}?</AlertDialogTitle>
                            <AlertDialogDescription>
                            Esto deducirá ${Math.round(prop.mortgageValue * 1.1)} de tu saldo.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleUnmortgage(prop)}>Confirmar Pago</AlertDialogAction>
                        </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    ) : (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                        <Button variant="secondary">Hipotecar</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-destructive">¿Hipotecar {prop.propertyName}?</AlertDialogTitle>
                            <AlertDialogDescription className="text-foreground">
                            Recibirás ${prop.mortgageValue} en tu saldo. No podrás cobrar alquiler ni construir casas en esta propiedad.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction className="bg-destructive hover:bg-destructive/90 text-destructive-foreground" onClick={() => handleMortgage(prop)}>Confirmar Hipoteca</AlertDialogAction>
                        </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    )}
                </div>
                {canBuyHouse(prop) && !prop.mortgaged && (
                    <div className="flex items-center justify-between border-t pt-3">
                         <div className='text-sm'>
                            <p className='font-medium'>Comprar Casa</p>
                            <p className='text-muted-foreground'>Costo: ${prop.houseCost}</p>
                        </div>
                        <Button size="sm" onClick={() => handleBuyHouse(prop)}>
                            <Home className="mr-2 h-4 w-4" /> Comprar
                        </Button>
                    </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
        <DialogFooter className="sm:justify-between gap-2">
          <Button variant="ghost" onClick={() => setIsAddPropertyOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Agregar Propiedad
          </Button>
          <Button onClick={() => onOpenChange(false)}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <AddPropertyDialog 
        isOpen={isAddPropertyOpen}
        onOpenChange={setIsAddPropertyOpen}
        properties={unownedProperties}
        player={player}
        game={game}
        onStateChange={onStateChange}
    />
    </>
  );
}
