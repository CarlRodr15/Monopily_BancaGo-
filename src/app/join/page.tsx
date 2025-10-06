'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, QrCode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function JoinGamePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [gameId, setGameId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleJoinGame = () => {
    if (!gameId.trim()) {
      toast({
        title: 'Se requiere ID del juego',
        description: 'Por favor, ingresa un ID de juego válido.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    // In a real app, you would check if the game ID exists in Firestore.
    // We navigate to the create page, but pass the gameId so the user can
    // create their player profile and join the lobby.
    setTimeout(() => {
      router.push(`/create?gameId=${gameId.trim().toUpperCase()}`);
    }, 1000);
  };

  const handleScanQr = () => {
     router.push('/join/scan');
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <Button variant="ghost" className="absolute top-4 left-4" asChild>
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al Inicio
        </Link>
      </Button>
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold font-headline">Unirse a un Juego</CardTitle>
          <CardDescription>Ingresa el ID del juego de tu anfitrión o escanea un código QR.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="gameId" className="text-lg">ID del Juego</Label>
            <Input
              id="gameId"
              placeholder="Ej: A1B2C3"
              value={gameId}
              onChange={(e) => setGameId(e.target.value.toUpperCase())}
              className="py-6 text-lg tracking-widest text-center"
              maxLength={6}
            />
          </div>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                O
              </span>
            </div>
          </div>
          <Button variant="outline" size="lg" className="w-full py-7" onClick={handleScanQr}>
            <QrCode className="mr-2 h-5 w-5" />
            Escanear Código QR
          </Button>
        </CardContent>
        <CardFooter>
          <Button onClick={handleJoinGame} disabled={isLoading} size="lg" className="w-full text-lg py-7 font-bold">
            {isLoading ? 'Uniéndose...' : 'Unirse al Juego'}
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
