
import type { Game, Player, Property } from './types';

// Lista completa de todas las propiedades disponibles en esta versión del juego.
export const allProperties: Property[] = [
  // Marrones
  { id: 'mediterranean', propertyName: 'Avenida Mediterráneo', price: 60, mortgageValue: 30, houseCost: 50, mortgaged: false, color: '#955436', type: 'property', houses: 0 },
  { id: 'baltic', propertyName: 'Avenida Báltico', price: 60, mortgageValue: 30, houseCost: 50, mortgaged: false, color: '#955436', type: 'property', houses: 0 },
  // Azules Claro
  { id: 'oriental', propertyName: 'Avenida Oriental', price: 100, mortgageValue: 50, houseCost: 50, mortgaged: false, color: '#aae0fa', type: 'property', houses: 0 },
  { id: 'vermont', propertyName: 'Avenida Vermont', price: 100, mortgageValue: 50, houseCost: 50, mortgaged: false, color: '#aae0fa', type: 'property', houses: 0 },
  { id: 'connecticut', propertyName: 'Avenida Connecticut', price: 120, mortgageValue: 60, houseCost: 50, mortgaged: false, color: '#aae0fa', type: 'property', houses: 0 },
  // Rosados
  { id: 'stcharles', propertyName: 'Plaza San Carlos', price: 140, mortgageValue: 70, houseCost: 100, mortgaged: false, color: '#d93a96', type: 'property', houses: 0 },
  { id: 'states', propertyName: 'Avenida de los Estados', price: 140, mortgageValue: 70, houseCost: 100, mortgaged: false, color: '#d93a96', type: 'property', houses: 0 },
  { id: 'virginia', propertyName: 'Avenida Virginia', price: 160, mortgageValue: 80, houseCost: 100, mortgaged: false, color: '#d93a96', type: 'property', houses: 0 },
  // Naranjas
  { id: 'stjames', propertyName: 'Plaza St. James', price: 180, mortgageValue: 90, houseCost: 100, mortgaged: false, color: '#f7941d', type: 'property', houses: 0 },
  { id: 'tennessee', propertyName: 'Avenida Tennessee', price: 180, mortgageValue: 90, houseCost: 100, mortgaged: false, color: '#f7941d', type: 'property', houses: 0 },
  { id: 'newyork', propertyName: 'Avenida Nueva York', price: 200, mortgageValue: 100, houseCost: 100, mortgaged: false, color: '#f7941d', type: 'property', houses: 0 },
  // Rojos
  { id: 'kentucky', propertyName: 'Avenida Kentucky', price: 220, mortgageValue: 110, houseCost: 150, mortgaged: false, color: '#ed1b24', type: 'property', houses: 0 },
  { id: 'indiana', propertyName: 'Avenida Indiana', price: 220, mortgageValue: 110, houseCost: 150, mortgaged: false, color: '#ed1b24', type: 'property', houses: 0 },
  { id: 'illinois', propertyName: 'Avenida Illinois', price: 240, mortgageValue: 120, houseCost: 150, mortgaged: false, color: '#ed1b24', type: 'property', houses: 0 },
  // Amarillos
  { id: 'atlantic', propertyName: 'Avenida Atlántico', price: 260, mortgageValue: 130, houseCost: 150, mortgaged: false, color: '#fef200', type: 'property', houses: 0 },
  { id: 'ventnor', propertyName: 'Avenida Ventnor', price: 260, mortgageValue: 130, houseCost: 150, mortgaged: false, color: '#fef200', type: 'property', houses: 0 },
  { id: 'marvin', propertyName: 'Jardines Marvin', price: 280, mortgageValue: 140, houseCost: 150, mortgaged: false, color: '#fef200', type: 'property', houses: 0 },
  // Verdes
  { id: 'pacific', propertyName: 'Avenida Pacífico', price: 300, mortgageValue: 150, houseCost: 200, mortgaged: false, color: '#1fb25a', type: 'property', houses: 0 },
  { id: 'northcarolina', propertyName: 'Avenida Carolina del Norte', price: 300, mortgageValue: 150, houseCost: 200, mortgaged: false, color: '#1fb25a', type: 'property', houses: 0 },
  { id: 'pennsylvania-ave', propertyName: 'Avenida Pensilvania', price: 320, mortgageValue: 160, houseCost: 200, mortgaged: false, color: '#1fb25a', type: 'property', houses: 0 },
  // Azules Oscuro
  { id: 'parkplace', propertyName: 'Plaza del Parque', price: 350, mortgageValue: 175, houseCost: 200, mortgaged: false, color: '#0072bb', type: 'property', houses: 0 },
  { id: 'boardwalk', propertyName: 'Paseo Tablado', price: 400, mortgageValue: 200, houseCost: 200, mortgaged: false, color: '#0072bb', type: 'property', houses: 0 },
  // Ferrocarriles
  { id: 'reading-rr', propertyName: 'Ferrocarril Reading', price: 200, mortgageValue: 100, mortgaged: false, color: '#808080', type: 'railroad' },
  { id: 'pennsylvania-rr', propertyName: 'Ferrocarril de Pensilvania', price: 200, mortgageValue: 100, mortgaged: false, color: '#808080', type: 'railroad' },
  { id: 'b-o-rr', propertyName: 'Ferrocarril B. & O.', price: 200, mortgageValue: 100, mortgaged: false, color: '#808080', type: 'railroad' },
  { id: 'shortline-rr', propertyName: 'Ferrocarril Short Line', price: 200, mortgageValue: 100, mortgaged: false, color: '#808080', type: 'railroad' },
  // Servicios
  { id: 'electric', propertyName: 'Compañía de Electricidad', price: 150, mortgageValue: 75, mortgaged: false, color: '#C0C0C0', type: 'utility' },
  { id: 'water', propertyName: 'Compañía de Agua', price: 150, mortgageValue: 75, mortgaged: false, color: '#C0C0C0', type: 'utility' },
];

const findProp = (id: string) => allProperties.find(p => p.id === id)!;

// Reserva de jugadores potenciales para generar partidas aleatorias.
export const potentialPlayers: Omit<Player, 'id' | 'isHost'>[] = [
  {
    playerName: 'Manuel',
    playerIcon: 'car',
    balance: 50,
    status: 'active',
    properties: [
      { ...findProp('stcharles'), mortgaged: true },
      { ...findProp('states'), mortgaged: true },
    ],
  },
  {
    playerName: 'Joselin',
    playerIcon: 'shoe',
    balance: 50,
    status: 'active',
    properties: [
        { ...findProp('reading-rr'), mortgaged: true },
        { ...findProp('pennsylvania-rr'), mortgaged: true },
    ],
  },
  {
    playerName: 'Bryan',
    playerIcon: 'ship',
    balance: 50,
    status: 'active',
    properties: [
        { ...findProp('kentucky'), mortgaged: true },
        { ...findProp('indiana'), mortgaged: true },
    ],
  },
  {
    playerName: 'Carlos',
    playerIcon: 'vacuum',
    balance: 50,
    status: 'active',
    properties: [
        { ...findProp('atlantic'), mortgaged: true },
    ],
  },
   {
    playerName: 'Ana',
    playerIcon: 'wheelbarrow',
    balance: 50,
    status: 'active',
    properties: [
        { ...findProp('water'), mortgaged: true },
    ],
  },
   {
    playerName: 'David',
    playerIcon: 'top-hat',
    balance: 50,
    status: 'active',
    properties: [
        { ...findProp('baltic'), mortgaged: true },
    ],
  },
];


// Plantilla base para un juego nuevo. Los jugadores se añadirán dinámicamente.
export const mockGame: Game = {
  gameId: 'MOCK123',
  qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=http://localhost:3000/join?gameId=MOCK123',
  status: 'active',
  players: [], // Se llena al crear el juego
  history: [
    { timestamp: Date.now(), description: 'Comenzó el juego.' },
  ],
  gameMode: 'clasico',
};
