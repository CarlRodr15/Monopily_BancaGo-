
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
import type { Player } from '@/lib/types';
import { PlayerIcons } from '@/lib/icons';
import { Building, Users } from 'lucide-react';
import { PlayerPropertiesViewerDialog } from './PlayerPropertiesViewerDialog';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

interface OtherPlayersDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  players: Player[];
}

/**
 * Diálogo que muestra una lista de los otros jugadores en la partida.
 * Permite ver su saldo, estado (activo/bancarrota) y acceder a sus propiedades.
 */
export function OtherPlayersDialog({ isOpen, onOpenChange, players }: OtherPlayersDialogProps) {
  // Estado para controlar qué jugador se ha seleccionado para ver sus propiedades.
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  /**
   * Abre el diálogo de visualización de propiedades para un jugador específico.
   * @param player - El jugador cuyas propiedades se van a ver.
   */
  const handleViewProperties = (player: Player) => {
    setSelectedPlayer(player);
  };

  /**
   * Cierra el diálogo de visualización de propiedades.
   */
  const handleCloseViewer = () => {
    setSelectedPlayer(null);
  };

  return (
    <>
      {/* Diálogo principal que lista a los jugadores */}
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-headline flex items-center">
              <Users className="mr-2" /> Otros Jugadores
            </DialogTitle>
            <DialogDescription>
              Consulta el estado y las propiedades de los demás jugadores.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-96 pr-4 -mr-4">
            <div className="space-y-4 py-4">
              {players.map((player) => {
                const iconSrc = PlayerIcons[player.playerIcon];
                // Guardia de seguridad: si el icono no existe, no renderizar este item para evitar crasheos.
                if (!iconSrc) return null;
                const isBankrupt = player.status === 'bankrupt';

                return (
                  <div
                    key={player.id}
                    className={cn(
                      "flex items-center justify-between rounded-lg border p-4 transition-colors",
                      isBankrupt && "bg-destructive/10 border-destructive/20"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Image key={iconSrc} src={iconSrc} alt={player.playerName} width={32} height={32} className={cn("h-8 w-8 object-contain", isBankrupt && "opacity-50")} />
                      <div>
                        <p className={cn("font-semibold", isBankrupt && "text-destructive line-through")}>
                          {player.playerName}
                        </p>
                        <p className={cn("text-sm font-bold text-accent", isBankrupt && "text-destructive/80")}>
                          ${player.balance.toLocaleString()}
                        </p>
                      </div>
                    </div>
                     {isBankrupt ? (
                        <Badge variant="destructive">BANCARROTA</Badge>
                     ) : (
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleViewProperties(player)}
                            disabled={isBankrupt}
                        >
                            <Building className="mr-2 h-4 w-4" />
                            Propiedades
                        </Button>
                     )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="secondary" onClick={() => onOpenChange(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* 
        Diálogo secundario para ver las propiedades de un jugador seleccionado.
        Se renderiza solo cuando `selectedPlayer` no es nulo.
      */}
      {selectedPlayer && (
        <PlayerPropertiesViewerDialog
          isOpen={!!selectedPlayer}
          onOpenChange={handleCloseViewer}
          player={selectedPlayer}
        />
      )}
    </>
  );
}
