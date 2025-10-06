
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MonopolyManLogo } from '@/components/MonopolyManLogo';
import { ThemeToggle } from '@/components/ThemeToggle';

/**
 * Página de inicio de la aplicación (Landing Page).
 * Da la bienvenida al usuario y ofrece las opciones principales:
 * - Crear un nuevo juego.
 * - Unirse a un juego existente.
 */
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-background">
      {/* Sección principal de bienvenida */}
      <div className="flex flex-col items-center space-y-4 text-center">
        {/* Logo de la aplicación */}
        <MonopolyManLogo className="w-[350px] h-auto" />
        {/* Título principal */}
        <h1 className="text-4xl font-black tracking-tight font-headline text-foreground sm:text-5xl md:text-5xl">
          Monopoly ¡BancaGo!
        </h1>
        {/* Descripción corta de la aplicación */}
        <p className="max-w-xl text-lg text-muted-foreground">
            ¡Bienvenido al banco!<br/>Gestiona, cobra y paga<br/>como un magnate.
        </p>
      </div>
      
      {/* Sección de acciones con los botones principales */}
      <div className="mt-12 grid w-full max-w-sm grid-cols-1 gap-4 sm:max-w-md">
        {/* Botón para navegar a la página de creación de juego */}
        <Button asChild size="lg" className="w-full text-lg py-8 font-bold shadow-lg hover:shadow-primary/50 transition-shadow">
          <Link href="/create">CREAR JUEGO</Link>
        </Button>
        {/* Botón para navegar a la página para unirse a un juego */}
        <Button asChild variant="secondary" size="lg" className="w-full text-lg py-8 font-bold">
          <Link href="/join">UNIRSE AL JUEGO</Link>
        </Button>
      </div>

      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
    </main>
  );
}
