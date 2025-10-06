
'use client';

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
import { Building, Train, Lightbulb } from 'lucide-react';
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

interface AddPropertyDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  properties: Property[];
  player: Player;
  game: Game;
  onStateChange: (newState: Partial<Game>) => void;
}

const typeIcons = {
    railroad: <Train className="h-4 w-4 ml-2 text-muted-foreground" />,
    utility: <Lightbulb className="h-4 w-4 ml-2 text-muted-foreground" />,
    property: null,
};


export function AddPropertyDialog({ isOpen, onOpenChange, properties, player, game, onStateChange }: AddPropertyDialogProps) {
  const { toast } = useToast();

  const handleBuyProperty = (property: Property) => {
    if (player.balance < property.price) {
        toast({
            title: 'Fondos Insuficientes',
            description: `No tienes suficiente dinero para comprar ${property.propertyName}.`,
            variant: 'destructive',
        });
        return;
    }

    const newPlayers = game.players.map(p => {
        if (p.id === player.id) {
            return {
                ...p,
                balance: p.balance - property.price,
                properties: [...p.properties, { ...property, houses: 0 }] // Añadir propiedad con 0 casas
            };
        }
        return p;
    });
    
    const description = `${player.playerName} compró ${property.propertyName} por $${property.price}.`;
    const newHistoryEntry: HistoryEntry = { timestamp: Date.now(), description };

    onStateChange({ 
        players: newPlayers, 
        history: [newHistoryEntry, ...game.history]
    });

    toast({
      title: 'Propiedad Comprada',
      description: `Has comprado ${property.propertyName}.`,
    });
    
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-headline">Comprar Propiedad</DialogTitle>
          <DialogDescription>
            Selecciona una propiedad para comprarla del banco.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-96 pr-4 -mr-4">
          <div className="space-y-4 py-4">
            {properties.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <Building className="mx-auto h-12 w-12 mb-4" />
                No hay propiedades disponibles para comprar.
              </div>
            )}
            {properties.map((prop) => (
              <div
                key={prop.id}
                className="flex items-center justify-between rounded-lg border p-4 relative pl-6"
              >
                <div 
                    className="absolute left-0 top-0 bottom-0 w-2 rounded-l-lg" 
                    style={{ backgroundColor: prop.color }}
                />
                <div className="flex-1">
                  <div className="flex items-center">
                    <p className="font-semibold">{prop.propertyName}</p>
                    {typeIcons[prop.type]}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Precio: ${prop.price}
                  </p>
                </div>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button>Comprar</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Comprar {prop.propertyName}?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esto deducirá ${prop.price} de tu saldo.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleBuyProperty(prop)}>Confirmar Compra</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
              </div>
            ))}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
