
'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MonopolyManLogo } from '@/components/MonopolyManLogo';
import { Suspense } from 'react';
import { cn } from '@/lib/utils';

function WinnerPageContent() {
  const searchParams = useSearchParams();
  const playerName = searchParams.get('playerName');
  const isWinner = searchParams.get('isWinner') === 'true';

  const mainClasses = cn(
    "flex min-h-screen flex-col items-center justify-center p-4 text-primary-foreground",
    isWinner ? 'bg-green-600' : 'bg-yellow-500'
  );

  const logoTextClasses = cn(
    "text-2xl font-black uppercase tracking-widest mt-4",
    isWinner ? 'text-green-600' : 'text-yellow-600'
  );
  
  const titleText = isWinner ? `¡Felicidades, ${playerName || 'Jugador'}!` : `¡La partida ha terminado!`;
  const subtitleText = isWinner ? "¡Has demostrado ser el mejor magnate!" : `El ganador es ${playerName || 'otro jugador'}.`;
  const descriptionText = isWinner ? "¡Disfruta de tu imperio!" : "Mejor suerte la próxima vez.";


  return (
    <main className={mainClasses}>
      <Card className="w-full max-w-md bg-card text-card-foreground text-center border-border shadow-2xl">
        <CardHeader>
          <div className="mx-auto flex flex-col items-center justify-center">
             <MonopolyManLogo className="w-48 h-auto" />
             <p className={logoTextClasses}>{isWinner ? '¡GANADOR!' : 'FIN DEL JUEGO'}</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <CardTitle className="text-4xl font-black">{titleText}</CardTitle>
          <p className="text-2xl font-semibold">{subtitleText}</p>
          <p className="text-lg text-muted-foreground">
            {descriptionText}
          </p>
        </CardContent>
      </Card>
       <Button asChild variant="ghost" className="mt-8 text-white hover:bg-white/10 hover:text-white">
          <Link href="/">Volver al Inicio</Link>
        </Button>
    </main>
  );
}

export default function WinnerPage() {
    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <WinnerPageContent />
        </Suspense>
    )
}
