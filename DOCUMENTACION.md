# Documentación del Proyecto: Monopoly ¡BancaGo!

## Descripción General

**Monopoly ¡BancaGo!** es una aplicación web diseñada para actuar como un asistente de banca digital durante una partida del juego de mesa Monopoly. Permite a los jugadores gestionar su dinero, propiedades y transacciones de una manera sencilla y centralizada, eliminando la necesidad de manejar efectivo de papel y llevando un registro automático de todas las acciones.

La aplicación está construida con **Next.js** y **React**, utilizando **TypeScript** para la seguridad de tipos y **TailwindCSS** con componentes de **ShadCN/UI** para una interfaz de usuario moderna y responsiva.

---

## Estructura del Proyecto y Archivos Clave

A continuación se detalla la función de los archivos y carpetas más importantes del proyecto.

### `src/app/` - Enrutamiento y Páginas

Esta carpeta utiliza el App Router de Next.js. Cada subcarpeta representa una ruta en la aplicación.

-   **`page.tsx`**: Es la página de inicio (landing page). Da la bienvenida al usuario y presenta las opciones para crear o unirse a un juego.
-   **`layout.tsx`**: Es el layout raíz. Define la estructura HTML base, importa las fuentes globales y la hoja de estilos `globals.css`, y renderiza el `Toaster` para las notificaciones.
-   **`create/page.tsx`**: Página donde un jugador puede crear una nueva partida o unirse a una existente si llega con un `gameId`. Aquí el usuario introduce su nombre, elige una ficha y selecciona el modo de juego.
-   **`join/page.tsx`**: Permite a un jugador unirse a una partida existente introduciendo manualmente el ID del juego. También ofrece la opción de escanear un código QR.
-   **`join/scan/page.tsx`**: Página dedicada a escanear el código QR del juego usando la cámara del dispositivo. Utiliza la librería `qr-scanner`.
-   **`game/[gameId]/lobby/page.tsx`**: La sala de espera del juego. Muestra el ID del juego y un código QR para que otros se unan. Lista a los jugadores que han entrado y permite al anfitrión comenzar la partida.
-   **`game/[gameId]/page.tsx`**: ¡El corazón de la aplicación! Es la pantalla principal del juego donde el jugador actual puede ver su saldo, realizar transacciones (pagar/cobrar al banco o a otros jugadores), administrar sus propiedades, proponer intercambios y ver el estado de los demás jugadores.
-   **`game/[gameId]/bankruptcy/page.tsx`**: Página que se muestra cuando un jugador cae en bancarrota.
-   **`game/[gameId]/winner/page.tsx`**: Página que se muestra cuando se determina un ganador en la partida.

### `src/components/` - Componentes Reutilizables

Aquí se encuentran los componentes de React utilizados en toda la aplicación.

-   **`ui/`**: Componentes base de la librería **ShadCN/UI** (botones, tarjetas, diálogos, etc.). Son bloques de construcción de la interfaz.
-   **`game/`**: Componentes específicos para la lógica del juego.
    -   `TransactionDialog.tsx`: Gestiona los pagos y cobros.
    -   `PropertyDialog.tsx`: Permite al jugador administrar sus propiedades (hipotecar, pagar hipotecas, comprar nuevas).
    -   `TradeDialog.tsx`: Orquesta el intercambio de propiedades y dinero entre jugadores.
    -   `HistorySheet.tsx`: Muestra el historial de todas las transacciones del juego.
    -   `OtherPlayersDialog.tsx`: Muestra una lista de los demás jugadores, su saldo y sus propiedades.
-   **`IconPicker.tsx`**: Componente que permite al usuario seleccionar su ficha (icono de jugador).
-   **`MonopolyManLogo.tsx`**: Componente simple que renderiza la imagen del logo.

### `src/lib/` - Lógica, Tipos y Datos

Contiene la lógica de negocio, definiciones de tipos y datos de la aplicación.

-   **`types.ts`**: Define las interfaces de TypeScript para las estructuras de datos principales como `Game`, `Player`, `Property`, `HistoryEntry`, etc. Es crucial para la integridad de los datos en toda la app.
-   **`icons.tsx`**: Define y exporta los componentes de los iconos (fichas) de los jugadores, junto con sus metadatos (nombre, etiqueta).
-   **`mock-data.ts`**: Contiene datos de prueba (un juego simulado con varios jugadores y propiedades) que se utilizan para el desarrollo y para simular el estado del juego, ya que no hay una base de datos real conectada.
-   **`utils.ts`**: Funciones de utilidad, como la función `cn` para combinar clases de TailwindCSS de forma segura.

### `src/hooks/` - Hooks Personalizados

-   **`use-toast.ts`**: Hook personalizado para manejar y mostrar notificaciones (toasts) en la interfaz.
-   **`use-mobile.ts`**: Hook que detecta si el usuario está en un dispositivo móvil basándose en el ancho de la pantalla.

---

## Flujo de la Aplicación

1.  **Inicio**: El usuario llega a la página principal y elige "Crear Juego" o "Unirse al Juego".
2.  **Crear/Unirse**:
    -   Si **crea**, va a `/create`, elige su nombre/ficha y modo de juego.
    -   Si **se une**, va a `/join`, introduce un ID y es redirigido a `/create` con ese `gameId` para crear su perfil de jugador.
3.  **Sala de Espera (Lobby)**: Tras crear su perfil, el jugador entra en el `/lobby`. El anfitrión ve a los jugadores unirse en tiempo real (simulado). Puede compartir el ID o QR para invitar a más gente.
4.  **Comienzo del Juego**: El anfitrión inicia la partida, lo que redirige a todos los jugadores a la página principal del juego (`/game/[gameId]`).
5.  **Juego Principal**: Cada jugador interactúa con su propia interfaz para:
    -   Realizar pagos y cobros.
    -   Comprar, hipotecar y pagar hipotecas de propiedades.
    -   Iniciar intercambios con otros jugadores.
    -   Declararse en bancarrota.
6.  **Fin del Juego**:
    -   Si un jugador se queda sin dinero y sin propiedades hipotecables, cae en **bancarrota** y es redirigido a la página correspondiente.
    -   Cuando solo queda un jugador activo, es declarado **ganador** y se le muestra la pantalla de victoria.
7.  **Reiniciar**: Desde las pantallas de fin de juego (bancarrota o ganador), el usuario puede volver a la página de inicio.
