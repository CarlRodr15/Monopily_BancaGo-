
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Copy, Check, LogOut } from 'lucide-react';
import { PlayerIcons } from '@/lib/icons';
import type { Game, Player, PlayerIconType } from '@/lib/types';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';

function LobbyContent() {
  const router = useRouter();
  const params = useParams();
  const gameId = params.gameId as string;
  
  const [game, setGame] = useState<Game | null>(null);
  const [copied, setCopied] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);

  useEffect(() => {
    const storedPlayerId = sessionStorage.getItem('currentPlayerId');
    const storedGame = sessionStorage.getItem('currentGame');
    const localPlayerData: { playerName: string; playerIcon: PlayerIconType } | null = JSON.parse(sessionStorage.getItem('localPlayerData') || 'null');
    
    if (!storedPlayerId || !localPlayerData || !storedGame) {
      router.push('/');
      return;
    }

    const gameData: Game = JSON.parse(storedGame);
    setGame(gameData);
    setCurrentPlayerId(storedPlayerId);
    
    const hostPlayer = gameData.players.find(p => p.isHost);
    const isCurrentPlayerHost = hostPlayer?.id === storedPlayerId;
    setIsHost(isCurrentPlayerHost);

  }, [router]);

  const handleCopy = () => {
    if (!game) return;
    navigator.clipboard.writeText(game.gameId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleStartGame = () => {
    router.push(`/game/${gameId}`);
  };

  const handleReady = () => {
    // Simplemente redirigimos. La página del juego leerá el estado desde sessionStorage.
    setTimeout(() => {
        router.push(`/game/${gameId}`);
    }, 1000);
  }

  const handleLeaveGame = () => {
    sessionStorage.clear();
    router.push('/');
  };
  
  if (!game) {
    return <LobbySkeleton />;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold font-headline">Sala de Espera</CardTitle>
          <CardDescription>Comparte el ID del juego o el código QR para que se unan.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-around gap-4">
            <div className="flex flex-col items-center space-y-2">
              <p className="text-sm text-muted-foreground">Escanea para Unirte</p>
              <div className="p-2 border rounded-lg bg-white h-[166px] w-[166px] flex items-center justify-center">
                <Image 
                  src={game.qrCode}
                  alt="Código QR para unirse al juego" 
                  width={150} 
                  height={150}
                  data-ai-hint="qr code"
                />
              </div>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <p className="text-sm text-muted-foreground">O comparte el ID del Juego</p>
              <div className="flex items-center gap-2 p-3 border-2 border-dashed rounded-lg">
                <span className="text-2xl font-black tracking-widest">{gameId}</span>
                <Button size="icon" variant="ghost" onClick={handleCopy}>
                  {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                </Button>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="flex items-center text-lg font-semibold"><Users className="mr-2 h-5 w-5" /> Jugadores ({game.players.length}/6)</h3>
            <div className="space-y-3 rounded-md border p-4 min-h-[150px]">
              {game.players.map((player) => {
                const iconSrc = PlayerIcons[player.playerIcon];
                const isCurrentPlayer = player.id === currentPlayerId;
                
                return (
                  <div key={player.id} className="flex items-center gap-4 animate-in fade-in">
                    <Image key={iconSrc} src={iconSrc} alt={player.playerName} width={32} height={32} className="h-8 w-8 object-contain" />
                    <p className="text-lg font-medium">{player.playerName} {isCurrentPlayer && "(Tú)"}</p>
                    {player.isHost && <span className="text-xs font-bold text-primary-foreground bg-primary px-2 py-0.5 rounded-full">ANFITRIÓN</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-4">
          {isHost ? (
            <Button onClick={handleStartGame} disabled={(game.players.length < 2)} size="lg" className="w-full text-lg py-7 font-bold">
              Empezar Juego
            </Button>
          ) : (
             <Button onClick={handleReady} size="lg" className="w-full text-lg py-7 font-bold">
              Estoy Listo
            </Button>
          )}
          <Button variant="link" onClick={handleLeaveGame}>
            <LogOut className="mr-2 h-4 w-4" />
            Salir del Juego
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}

export default function LobbyPage() {
    return (
        <Suspense fallback={<LobbySkeleton />}>
            <LobbyContent />
        </Suspense>
    )
}

function LobbySkeleton() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4">
            <Card className="w-full max-w-lg shadow-2xl">
                <CardHeader className="text-center">
                    <Skeleton className="h-8 w-48 mx-auto" />
                    <Skeleton className="h-4 w-64 mx-auto mt-2" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-center justify-around gap-4">
                         <div className="flex flex-col items-center space-y-2">
                           <Skeleton className="h-4 w-32" />
                           <Skeleton className="h-[166px] w-[166px]" />
                         </div>
                         <div className="flex flex-col items-center space-y-2">
                           <Skeleton className="h-4 w-40" />
                           <Skeleton className="h-12 w-48" />
                         </div>
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-32" />
                        <div className="space-y-3 rounded-md border p-4 min-h-[150px]">
                            {Array.from({ length: 2 }).map((_, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <Skeleton className="h-8 w-8 rounded-full" />
                                    <Skeleton className="h-6 w-1/2" />
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex-col gap-4">
                    <Skeleton className="h-14 w-full" />
                    <Skeleton className="h-6 w-24" />
                </CardFooter>
            </Card>
        </main>
    );
}
