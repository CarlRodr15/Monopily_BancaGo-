
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MonopolyManLogo } from '@/components/MonopolyManLogo';

export default function BankruptcyPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-red-800 p-4 text-white">
      <Card className="w-full max-w-md bg-red-700 text-center text-white border-white/50 shadow-2xl">
        <CardHeader>
          <div className="mx-auto flex flex-col h-auto w-auto items-center justify-center">
             <MonopolyManLogo className="w-48 h-auto" />
             <p className="text-2xl font-black uppercase tracking-widest text-white mt-2">Bancarrota</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <CardTitle className="text-4xl font-black">¡Oh no!</CardTitle>
          <p className="text-2xl font-semibold">¡La banca te ha vencido!</p>
          <p className="text-lg">
            Has caído en la temida bancarrota.
          </p>
        </CardContent>
      </Card>
       <Button asChild variant="ghost" className="mt-8 text-white hover:bg-white/10 hover:text-white">
          <Link href="/">Volver al Inicio</Link>
        </Button>
    </main>
  );
}
