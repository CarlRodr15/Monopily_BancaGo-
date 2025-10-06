
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
import type { Player } from '@/lib/types';
import { Building, Train, Lightbulb, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PlayerIcons } from '@/lib/icons';
import { Skeleton } from '../ui/skeleton';
import Image from 'next/image';

interface PlayerPropertiesViewerDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  player: Player;
}

const typeIcons = {
    railroad: <Train className="h-4 w-4 ml-2 text-muted-foreground" />,
    utility: <Lightbulb className="h-4 w-4 ml-2 text-muted-foreground" />,
    property: null,
};

export function PlayerPropertiesViewerDialog({ isOpen, onOpenChange, player }: PlayerPropertiesViewerDialogProps) {
    const playerIconSrc = PlayerIcons[player.playerIcon];

    if (!playerIconSrc) {
        return (
            <Dialog open={isOpen} onOpenChange={onOpenChange}>
                <DialogContent>
                    <DialogHeader>
                        <Skeleton className="h-8 w-1/2" />
                        <Skeleton className="h-4 w-3/4" />
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        )
    }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
                 <Image key={playerIconSrc} src={playerIconSrc} alt={player.playerName} width={32} height={32} className="h-8 w-8 object-contain" />
                 <DialogTitle className="text-2xl font-headline">Propiedades de {player.playerName}</DialogTitle>
            </div>
          <DialogDescription>
            Estas son las propiedades que posee actualmente este jugador.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-80 pr-4 -mr-4">
          <div className="space-y-4 py-4">
            {player.properties.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Building className="mx-auto h-12 w-12 mb-4" />
                Este jugador no posee ninguna propiedad.
              </div>
            ) : (
              player.properties.map((prop) => (
                <div
                  key={prop.id}
                  className={cn(
                    "flex items-center justify-between rounded-lg border p-4 relative pl-6 transition-colors",
                    prop.mortgaged && "bg-destructive/10 border-destructive/20"
                  )}
                >
                    <div 
                        className="absolute left-0 top-0 bottom-0 w-2 rounded-l-lg" 
                        style={{ backgroundColor: prop.color }}
                    />
                  <div className="flex-1">
                    <div className="flex items-center">
                        <p className={cn("font-semibold", prop.mortgaged && "text-destructive line-through")}>
                        {prop.propertyName}
                        </p>
                         {typeIcons[prop.type]}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {prop.mortgaged ? "Hipotecada" : "Activa"}
                    </p>
                    {prop.type === 'property' && (prop.houses ?? 0) > 0 && (
                        <div className='flex items-center gap-1 mt-1'>
                            {Array.from({length: prop.houses!}).map((_, i) => (
                                <Home key={i} className={cn("h-4 w-4", prop.houses === 5 ? 'text-red-500' : 'text-green-500')} />
                            ))}
                        </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
