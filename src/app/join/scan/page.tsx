'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, VideoOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import QrScanner from 'qr-scanner';

export default function ScanQrPage() {
  const router = useRouter();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [qrScanner, setQrScanner] = useState<QrScanner | null>(null);

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
      }
    };
    getCameraPermission();
  }, []);

  useEffect(() => {
    if (hasCameraPermission && videoRef.current) {
      const scanner = new QrScanner(
        videoRef.current,
        (result) => {
          console.log('decoded qr code:', result);
          qrScanner?.stop();
          
          try {
            const url = new URL(result.data);
            const gameId = url.searchParams.get('gameId');
            if (gameId) {
              toast({ title: 'Código QR Escaneado', description: `Uniéndose al juego ${gameId}...` });
              router.push(`/create?gameId=${gameId}`);
            } else {
              throw new Error('No se encontró gameId en el código QR');
            }
          } catch(e) {
            toast({ variant: 'destructive', title: 'Código QR Inválido', description: 'Este código QR no parece ser una invitación de juego válida.' });
          }
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
        },
      );
      scanner.start();
      setQrScanner(scanner);

      return () => {
        scanner.stop();
        scanner.destroy();
      };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasCameraPermission, router, toast]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <Button variant="ghost" className="absolute top-4 left-4" asChild>
        <Link href="/join">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Link>
      </Button>
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold font-headline">Escanear Código QR</CardTitle>
          <CardDescription>Apunta tu cámara al código QR para unirte al juego.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="aspect-video w-full overflow-hidden rounded-lg border bg-muted">
            {hasCameraPermission === false ? (
              <div className="flex h-full flex-col items-center justify-center p-4 text-center">
                 <VideoOff className="h-12 w-12 text-destructive" />
                 <Alert variant="destructive" className="mt-4">
                    <AlertTitle>Se requiere acceso a la cámara</AlertTitle>
                    <AlertDescription>
                        Por favor, permite el acceso a la cámara en la configuración de tu navegador para escanear un código QR.
                    </AlertDescription>
                </Alert>
              </div>
            ) : (
                <video ref={videoRef} className="h-full w-full" />
            )}
             {hasCameraPermission === null && (
                <div className="flex h-full flex-col items-center justify-center p-4 text-center">
                    <p>Solicitando permiso de cámara...</p>
                </div>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
