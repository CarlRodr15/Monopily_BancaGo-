
'use client';

import { Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlayerIcons } from '@/lib/icons';
import { Users, Landmark, ArrowLeftRight, PiggyBank, Building, History, Frown, Repeat } from 'lucide-react';
import { TransactionDialog } from '@/components/game/TransactionDialog';
import { PropertyDialog } from '@/components/game/PropertyDialog';
import { HistorySheet } from '@/components/game/HistorySheet';
import { TradeDialog } from '@/components/game/TradeDialog';
import { OtherPlayersDialog } from '@/components/game/OtherPlayersDialog';
import type { Game, Player, HistoryEntry } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
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
import { mockGame } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import Image from 'next/image';

type TransactionType = 'pay-bank' | 'collect-bank' | 'pay-player' | 'collect-player';

function GamePageContent() {
  const router = useRouter();
  const params = useParams();
  const gameId = params.gameId as string;
  const { toast } = useToast();

  const [game, setGame] = useState<Game | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  
  const [balanceChange, setBalanceChange] = useState<'increase' | 'decrease' | null>(null);

  const [dialogType, setDialogType] = useState<TransactionType | null>(null);
  const [isPropertyDialogOpen, setIsPropertyDialogOpen] = useState(false);
  const [isHistorySheetOpen, setIsHistorySheetOpen] = useState(false);
  const [isTradeDialogOpen, setIsTradeDialogOpen] = useState(false);
  const [isOtherPlayersDialogOpen, setIsOtherPlayersDialogOpen] = useState(false);

  useEffect(() => {
    // Cargar el estado del juego desde sessionStorage
    const storedGameState = sessionStorage.getItem('currentGame');
    if (storedGameState) {
        setGame(JSON.parse(storedGameState));
    } else {
        // Como fallback, usamos el mock, pero esto no debería pasar en el flujo normal
        setGame(mockGame);
    }
    
    // Obtenemos el ID del jugador de sessionStorage
    const storedPlayerId = sessionStorage.getItem('currentPlayerId');
    setCurrentPlayerId(storedPlayerId);
  }, []);

  // Función para actualizar el estado local del juego (simula la actualización del backend)
  const handleUpdateState = useCallback((newState: Partial<Game>) => {
    setGame(prevGame => {
        if (!prevGame) return null;
        
        // Crea un nuevo estado actualizado
        const updatedGame: Game = { 
            ...prevGame, 
            ...newState,
            // Asegúrate de que los arrays se sobreescriban completamente si se proporcionan
            players: newState.players || prevGame.players,
            history: newState.history || prevGame.history,
        };

        // Lógica de comprobación de ganador
        const activePlayers = updatedGame.players.filter(p => p.status === 'active');
        if (activePlayers.length === 1 && updatedGame.players.length > 1) {
            const winner = activePlayers[0];
            const isCurrentPlayerWinner = winner.id === currentPlayerId;

            // Usamos un pequeño timeout para que el estado se actualice antes de redirigir
             setTimeout(() => {
                router.push(`/game/${updatedGame.gameId}/winner?playerName=${encodeURIComponent(winner.playerName)}&isWinner=${isCurrentPlayerWinner}`);
            }, 100);
        } else {
             // Actualizar sessionStorage para persistir los cambios
            sessionStorage.setItem('currentGame', JSON.stringify(updatedGame));
        }

        return updatedGame;
    });
     toast({
        title: "Acción Registrada",
        description: "El estado del juego ha sido actualizado localmente.",
    });
  }, [toast, router, currentPlayerId]);

  useEffect(() => {
      // Cuando el juego o el ID del jugador cambien, actualizamos el estado
      if (game && currentPlayerId) {
          const newCurrentPlayer = game.players.find(p => p.id === currentPlayerId);

          if (newCurrentPlayer) {
              // Si el jugador actual del mock fue personalizado en la pantalla de creación
              const localPlayerData = JSON.parse(sessionStorage.getItem('localPlayerData') || '{}');
              if (localPlayerData.playerName && newCurrentPlayer.id !== mockGame.players.find(p => p.isHost)?.id) {
                  newCurrentPlayer.playerName = localPlayerData.playerName;
                  newCurrentPlayer.playerIcon = localPlayerData.playerIcon;
              }

              // Lógica de animación de balance
              if (currentPlayer && newCurrentPlayer.balance > currentPlayer.balance) {
                setBalanceChange('increase');
              } else if (currentPlayer && newCurrentPlayer.balance < currentPlayer.balance) {
                setBalanceChange('decrease');
              }

              setCurrentPlayer(newCurrentPlayer);

              // Lógica de bancarrota manual
              if (newCurrentPlayer.status === 'bankrupt') {
                  router.push(`/game/${game.gameId}/bankruptcy`);
                  return;
              }
                            
              // Lógica de bancarrota automática para CUALQUIER jugador
              let wasPlayerBankrupted = false;
              const updatedPlayers = game.players.map(p => {
                  const hasUnmortgagedProperties = p.properties.some(prop => !prop.mortgaged);
                  if (p.status === 'active' && p.balance <= 0 && !hasUnmortgagedProperties) {
                      wasPlayerBankrupted = true;
                      const newHistoryEntry: HistoryEntry = {
                          timestamp: Date.now(),
                          description: `${p.playerName} ha caído en bancarrota automáticamente.`
                      };
                      game.history.unshift(newHistoryEntry);
                      return { ...p, status: 'bankrupt' as const, balance: 0 };
                  }
                  return p;
              });

              if (wasPlayerBankrupted) {
                  handleUpdateState({ players: updatedPlayers, history: [...game.history] });
                  return;
              }
          }
      }
      // Temporizador para limpiar la animación de balance
       if (balanceChange) {
            const timer = setTimeout(() => setBalanceChange(null), 500);
            return () => clearTimeout(timer);
        }
  }, [game, currentPlayerId, router, balanceChange, currentPlayer, handleUpdateState]);


  if (!currentPlayer || !game) {
    return <GamePageSkeleton />;
  }

  const playerIconSrc = PlayerIcons[currentPlayer.playerIcon];
  const otherPlayers = game.players.filter(p => p.id !== currentPlayer.id);

  const handleDeclareBankruptcy = async () => {
    const updatedPlayers = game.players.map(p => 
        p.id === currentPlayer.id ? { ...p, status: 'bankrupt' as const, balance: 0 } : p
    );
    const newHistoryEntry: HistoryEntry = {
        timestamp: Date.now(),
        description: `${currentPlayer.playerName} se ha declarado en bancarrota.`
    };
    handleUpdateState({ players: updatedPlayers, history: [newHistoryEntry, ...game.history] });
  };

  const balanceClasses = cn(
    "text-base sm:text-lg font-semibold",
    balanceChange === 'increase' && 'animate-in fade-in text-green-500',
    balanceChange === 'decrease' && 'animate-in fade-in text-red-500',
    !balanceChange && 'text-green-600'
  );

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-2 sm:p-4">
      <Card className="w-full max-w-md sm:max-w-lg shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <Image key={playerIconSrc} src={playerIconSrc} alt={currentPlayer.playerName} width={56} height={56} className="h-12 w-12 sm:h-14 sm:w-14 object-contain" />
            <div>
              <CardTitle className="text-xl sm:text-2xl font-bold font-headline">{currentPlayer.playerName}</CardTitle>
              <CardDescription className={balanceClasses}>
                ${currentPlayer.balance.toLocaleString()}
              </CardDescription>
            </div>
          </div>
           <div className="flex items-center gap-1 sm:gap-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                     <Button variant="destructive" size="sm" className="h-auto py-2 px-3">
                      <Frown className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
                      <span className="text-sm font-bold">Bancarrota</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-destructive text-2xl">¿Estás seguro?</AlertDialogTitle>
                      <AlertDialogDescription className="text-foreground">
                        Esta acción te declarará en bancarrota y terminará tu participación en el juego. No se puede deshacer.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction 
                        className="bg-red-600 hover:bg-red-700 text-white"
                        onClick={handleDeclareBankruptcy}>
                        Declarar Bancarrota
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
            </div>
        </CardHeader>

        <CardContent className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <Button variant="secondary" onClick={() => setDialogType('pay-bank')}>
                    <Landmark className="mr-2" /> Pagar al Banco
                </Button>
                <Button variant="secondary" onClick={() => setDialogType('collect-bank')}>
                    <PiggyBank className="mr-2" /> Cobrar del Banco
                </Button>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
                 <Button variant="secondary" onClick={() => setDialogType('pay-player')}>
                    <ArrowLeftRight className="mr-2" /> Pagar a Jugador
                </Button>
            </div>
            
            <div className="flex justify-center">
                <Button 
                    className="bg-yellow-400 text-yellow-900 hover:bg-yellow-500 h-auto py-1 px-3 text-xs" 
                    onClick={() => setDialogType('collect-player')}>
                    <Users className="mr-2 h-3 w-3" /> Cobrar a Jugador (Prueba)
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-2">
                 <Button onClick={() => setIsPropertyDialogOpen(true)}>
                    <Building className="mr-2" /> Administrar Propiedades
                </Button>
                 <Button onClick={() => setIsTradeDialogOpen(true)}>
                    <Repeat className="mr-2" /> Intercambiar
                </Button>
            </div>
            
             <Button variant="outline" className="w-full justify-between h-auto py-2 px-3 sm:px-4" onClick={() => setIsOtherPlayersDialogOpen(true)}>
                <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <span className="font-semibold">Otros Jugadores</span>
                </div>
                <div className="flex -space-x-4 overflow-hidden">
                    {otherPlayers.slice(0, 5).map(player => {
                        const iconSrc = PlayerIcons[player.playerIcon];
                        if (!iconSrc) return null;
                        return <Image key={player.id} src={iconSrc} alt={player.playerName} width={40} height={40} className="inline-block h-8 w-8 sm:h-10 sm:w-10 rounded-full ring-2 ring-background bg-gray-100 p-1 object-contain" title={player.playerName}/>;
                    })}
                     {otherPlayers.length > 5 && (
                        <div className="flex items-center justify-center h-8 w-8 sm:h-10 sm:w-10 rounded-full ring-2 ring-background bg-muted text-muted-foreground text-xs font-bold">
                            +{otherPlayers.length - 5}
                        </div>
                    )}
                </div>
            </Button>
        </CardContent>

         <CardContent>
            <Button variant="outline" className="w-full" onClick={() => setIsHistorySheetOpen(true)}>
                <History className="mr-2" /> Ver Historial
            </Button>
        </CardContent>
      </Card>
      
      {dialogType && (
          <TransactionDialog
            isOpen={!!dialogType}
            onOpenChange={() => setDialogType(null)}
            type={dialogType}
            game={game}
            currentPlayer={currentPlayer}
            onTransaction={handleUpdateState}
          />
      )}

       <PropertyDialog
            isOpen={isPropertyDialogOpen}
            onOpenChange={setIsPropertyDialogOpen}
            player={currentPlayer}
            game={game}
            onStateChange={handleUpdateState}
        />

        <TradeDialog
            isOpen={isTradeDialogOpen}
            onOpenChange={setIsTradeDialogOpen}
            currentPlayer={currentPlayer}
            game={game}
            onStateChange={handleUpdateState}
        />
        
        <OtherPlayersDialog
            isOpen={isOtherPlayersDialogOpen}
            onOpenChange={setIsOtherPlayersDialogOpen}
            players={otherPlayers}
        />

       <HistorySheet
            isOpen={isHistorySheetOpen}
            onOpenChange={setIsHistorySheetOpen}
            history={game.history}
            players={game.players}
       />
    </main>
  );
}

function GamePageSkeleton() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div>
              <Skeleton className="h-7 w-32" />
              <Skeleton className="h-5 w-24 mt-1" />
            </div>
          </div>
          <Skeleton className="h-8 w-8" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-14 w-full" />
        </CardContent>
        <CardContent>
            <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    </main>
  );
}

export default function GamePage() {
    return (
        <Suspense fallback={<GamePageSkeleton />}>
            <GamePageContent />
        </Suspense>
    )
}
