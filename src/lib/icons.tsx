
'use client';
import type { PlayerIconKey } from './types';

// Mapeo de claves de íconos a las rutas de imagen en la carpeta `public`
export const PlayerIcons: Record<PlayerIconKey, string> = {
  'top-hat': '/top-hat.png',
  'car': '/car.png',
  'shoe': '/shoe.png',
  'vacuum': '/vacuum.png',
  'wheelbarrow': '/wheelbarrow.png',
  'ship': '/ship.png',
};

// Metadatos para cada ícono, usados para la selección en la UI
export const iconData: { name: PlayerIconKey; label: string }[] = [
    { name: 'top-hat', label: 'Sombrero de Copa' },
    { name: 'car', label: 'Auto' },
    { name: 'shoe', label: 'Zapato' },
    { name: 'vacuum', label: 'Aspiradora' },
    { name: 'wheelbarrow', label: 'Carretilla' },
    { name: 'ship', label: 'Barco' },
];
