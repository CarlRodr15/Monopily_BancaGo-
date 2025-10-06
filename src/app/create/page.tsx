
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { IconPicker } from '@/components/IconPicker';
import type { Player, PlayerIconType } from '@/lib/types';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mockGame, potentialPlayers, allProperties } from '@/lib/mock-data';
import { iconData } from '@/lib/icons';

const findProp = (id: string) => allProperties.find(p => p.id === id)!;

/**
 * Página para crear un nuevo juego o para que un jugador configure su perfil antes de unirse a una sala.
 */
export default function CreateGamePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [playerName, setPlayerName] = useState('');
  const [playerIcon, setPlayerIcon] = useState<PlayerIconType>('top-hat');
  const [isLoading, setIsLoading] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [gameMode, setGameMode] = useState('clasico');

  // En una app real, esta información vendría de la base de datos
  const [usedIcons, setUsedIcons] = useState<PlayerIconType[]>([]);
  const [existingPlayerNames, setExistingPlayerNames] = useState<string[]>([]);

  useEffect(() => {
    const gameId = searchParams.get('gameId');
    if (gameId) {
      setIsJoining(true);
      
      // En una simulación, creamos un estado de juego para que el jugador se una.
      // En una app real, se cargaría desde la BD.
      const mockJoiningGame = JSON.parse(JSON.stringify(mockGame));
      const playersForJoining = potentialPlayers.slice(0, 3).map(p => ({
        ...p,
        id: `player-${p.playerName}`,
        isHost: false, // El anfitrión ya existe
        properties: p.properties.map(prop => ({...prop, mortgaged: true})), // Hipotecar propiedades
        balance: 50 // Balance bajo
      }));

      // Asignar al primero de ellos como el anfitrión simulado
      if (playersForJoining.length > 0) {
        playersForJoining[0].isHost = true;
      }

      mockJoiningGame.players = playersForJoining;
      mockJoiningGame.gameId = gameId;
      mockJoiningGame.qrCode = mockJoiningGame.qrCode.replace(/MOCK123/g, gameId);

      sessionStorage.setItem('currentGame', JSON.stringify(mockJoiningGame));

      const initialUsedIcons = mockJoiningGame.players.map((p: Player) => p.playerIcon);
      const initialPlayerNames = mockJoiningGame.players.map((p: Player) => p.playerName.toLowerCase());
      setUsedIcons(initialUsedIcons);
      setExistingPlayerNames(initialPlayerNames);

      const availableIcon = iconData.map(i => i.name).find(icon => !initialUsedIcons.includes(icon as PlayerIconType));
      if (availableIcon) {
        setPlayerIcon(availableIcon as PlayerIconType);
      }
    }
  }, [searchParams]);

  const handleGameAction = () => {
    const trimmedName = playerName.trim();
    if (!trimmedName) {
      toast({
        title: 'El nombre del jugador es obligatorio',
        description: 'Por favor, ingresa un nombre para continuar.',
        variant: 'destructive',
      });
      return;
    }

    if (existingPlayerNames.includes(trimmedName.toLowerCase())) {
        toast({
            title: 'Nombre de jugador ya en uso',
            description: 'Ese nombre ya ha sido elegido. Por favor, ingresa un nombre diferente.',
            variant: 'destructive',
        });
        return;
    }

    setIsLoading(true);

    const localPlayerData = {
        playerName: trimmedName,
        playerIcon: playerIcon,
    };
    
    const gameIdToUse = isJoining ? searchParams.get('gameId')! : `MOCK${Date.now().toString().slice(-4)}`;
    let gameForSession;

    const newPlayer: Player = {
        id: `player-${Date.now()}`,
        playerName: localPlayerData.playerName,
        playerIcon: localPlayerData.playerIcon,
        balance: 1500,
        properties: [],
        status: 'active',
        isHost: false,
      };
    sessionStorage.setItem('currentPlayerId', newPlayer.id);

    if (isJoining) {
        // Cargar el juego simulado que creamos en useEffect
        gameForSession = JSON.parse(sessionStorage.getItem('currentGame')!);
        
        // Simplemente añadimos al jugador nuevo para completar los 4.
        gameForSession.players.push(newPlayer);
    } else {
        // Crear un juego nuevo con jugadores aleatorios
        gameForSession = JSON.parse(JSON.stringify(mockGame));
        gameForSession.gameId = gameIdToUse;
        gameForSession.qrCode = gameForSession.qrCode.replace(/MOCK123/g, gameIdToUse);

        newPlayer.isHost = true;
        newPlayer.properties = [
            {...findProp('mediterranean'), mortgaged: false},
            {...findProp('baltic'), mortgaged: false},
            {...findProp('oriental'), mortgaged: true},
            {...findProp('vermont'), mortgaged: true}
        ];
        sessionStorage.setItem('currentPlayerId', newPlayer.id);

        const finalPlayers = [newPlayer];
        const usedNames = new Set([trimmedName.toLowerCase()]);
        const usedIconsSet = new Set([playerIcon]);

        const keyNames = ['Manuel', 'Joselin', 'Bryan', 'Carlos'];
        const randomKeyPlayerName = keyNames[Math.floor(Math.random() * keyNames.length)];
        
        let keyPlayer = potentialPlayers.find(p => p.playerName === randomKeyPlayerName)!;
        
        if (usedNames.has(keyPlayer.playerName.toLowerCase())) {
            const availableKeyName = keyNames.find(kn => !usedNames.has(kn.toLowerCase()));
            keyPlayer = potentialPlayers.find(p => p.playerName === availableKeyName)!;
        }

        if (usedIconsSet.has(keyPlayer.playerIcon)) {
           const availableIcon = iconData.find(i => !usedIconsSet.has(i.name as PlayerIconType));
           if (availableIcon) keyPlayer.playerIcon = availableIcon.name as PlayerIconType;
        }
        
        const keyPlayerForGame = {
             ...keyPlayer,
             isHost: false, 
             id: `player-${keyPlayer.playerName}`,
             properties: keyPlayer.properties.map(p => ({...p, mortgaged: true})),
             balance: 50
        };

        finalPlayers.push(keyPlayerForGame);
        usedNames.add(keyPlayer.playerName.toLowerCase());
        usedIconsSet.add(keyPlayer.playerIcon);

        const remainingPotential = potentialPlayers.filter(p => !usedNames.has(p.playerName.toLowerCase()));
        
        while(finalPlayers.length < 4 && remainingPotential.length > 0) {
            const randomIndex = Math.floor(Math.random() * remainingPotential.length);
            let extraPlayer = remainingPotential.splice(randomIndex, 1)[0];

            if (usedIconsSet.has(extraPlayer.playerIcon)) {
                const availableIcon = iconData.find(i => !usedIconsSet.has(i.name as PlayerIconType));
                if (availableIcon) extraPlayer.playerIcon = availableIcon.name as PlayerIconType;
            }
            
            const extraPlayerForGame = {
                ...extraPlayer, 
                isHost: false, 
                id: `player-${extraPlayer.playerName}`,
                properties: extraPlayer.properties.map(p => ({...p, mortgaged: true})),
                balance: 50
            };

            finalPlayers.push(extraPlayerForGame);
            usedNames.add(extraPlayer.playerName.toLowerCase());
            usedIconsSet.add(extraPlayer.playerIcon);
        }

        gameForSession.players = finalPlayers;
    }
    
    sessionStorage.setItem('localPlayerData', JSON.stringify(localPlayerData));
    sessionStorage.setItem('currentGame', JSON.stringify(gameForSession));
    
    setTimeout(() => {
        router.push(`/game/${gameIdToUse}/lobby`);
    }, 1000);
  };

  const title = isJoining ? 'Unirse al Juego' : 'Nuevo Juego';
  const buttonText = isJoining ? 'Unirse a la Sala' : 'Crear Juego';
  const loadingText = isJoining ? 'Uniéndose...' : 'Creando Juego...';

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
          <CardTitle className="text-3xl font-bold font-headline">{title}</CardTitle>
          <CardDescription>Ingresa tu nombre y elige tu ficha para empezar.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="playerName" className="text-lg">Nombre del Jugador</Label>
            <Input
              id="playerName"
              placeholder="Ej: Tío Rico McPato"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="py-6 text-lg"
            />
          </div>

          {!isJoining && (
            <div className="space-y-2">
              <Label htmlFor="gameMode" className="text-lg">Modo de Juego</Label>
              <Select value={gameMode} onValueChange={setGameMode}>
                <SelectTrigger id="gameMode" className="py-6 text-lg">
                  <SelectValue placeholder="Selecciona un modo..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clasico" className="text-lg">Clásico</SelectItem>
                  <SelectItem value="rapido" className="text-lg">Rápido</SelectItem>
                  <SelectItem value="personalizado" disabled className="text-lg">Personalizado (Próximamente)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-lg">Elige tu Ficha</Label>
            <IconPicker 
              value={playerIcon} 
              onValueChange={setPlayerIcon} 
              disabledIcons={usedIcons}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleGameAction} disabled={isLoading} size="lg" className="w-full text-lg py-7 font-bold">
            {isLoading ? loadingText : buttonText}
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
