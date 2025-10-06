
export type PlayerIconKey = 'top-hat' | 'car' | 'shoe' | 'vacuum' | 'wheelbarrow' | 'ship';
export type PlayerIconType = PlayerIconKey;

/**
 * Representa una propiedad en el juego.
 */
export interface Property {
  id: string;
  propertyName: string;
  mortgaged: boolean;
  price: number;
  mortgageValue: number;
  color: string;
  type: 'property' | 'railroad' | 'utility';
  houses?: number; // 0-4 para casas, 5 para hotel
  houseCost?: number;
}

/**
 * Representa a un jugador.
 */
export interface Player {
  id: string;
  playerName: string;
  playerIcon: PlayerIconType; // Almacena el ID del ícono, no el componente
  balance: number;
  status: 'active' | 'bankrupt' | 'winner';
  properties: Property[];
  isHost: boolean;
}

/**
 * Representa una oferta de intercambio.
 */
export interface TradeOffer {
  fromPlayerId: string;
  toPlayerId: string;
  propertiesOffered: Property[];
  moneyOffered: number;
  propertiesRequested: Property[];
  moneyRequested: number;
}

/**
 * Entrada en el historial del juego.
 */
export interface HistoryEntry {
  timestamp: number;
  description?: string;
  trade?: {
    fromPlayerId: string;
    toPlayerId: string;
    offer: TradeOffer;
  }
}

/**
 * Representa el estado completo de una partida.
 */
export interface Game {
  gameId: string;
  qrCode: string; // La URL completa para el QR
  status: 'waiting' | 'active' | 'finished';
  players: Player[];
  history: HistoryEntry[];
  gameMode?: 'clasico' | 'rapido';
}
