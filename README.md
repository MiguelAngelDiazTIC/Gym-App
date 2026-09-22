# Gym App

Tracker de fitness personal para el móvil: **peso corporal**, **rutinas de entrenamiento** y **nutrición/macros**, con varios perfiles en una misma instalación.

Sin cuentas, sin nube, sin anuncios. Todos los datos se guardan en el propio navegador (`localStorage`).

## Funcionalidades

- **Perfiles** — pantalla de selección al entrar, cada persona con su nombre, foto opcional y su propio historial.
- **Peso** — registro de peso por fecha con gráficas de evolución (línea y barras).
- **Rutinas** — estructura *rutina → semanas → días → ejercicios → series*. Cada entrenamiento guarda repeticiones y kilos por serie, y se puede editar después.
- **Nutrición** — días con comidas (desayuno, comida, merienda, cena, extra); cada alimento lleva kcal, proteína, carbohidratos y grasas, con totales diarios.

Interfaz solo en español, pensada para móvil (modo oscuro, barra de pestañas flotante, soporte de *safe areas* y teclado virtual).

## Tecnologías

- [React 19](https://react.dev) + [TypeScript](https://www.typescriptlang.org) con React Compiler
- [Vite](https://vite.dev)
- [Motion](https://motion.dev) para animaciones
- [Recharts](https://recharts.org) para gráficas
- [Lucide](https://lucide.dev) para iconos

## Puesta en marcha

Requisitos: Node.js 20.19+ o 22.12+ (lo que pide Vite).

```bash
npm install
npm run dev
```

El servidor de desarrollo se expone en la red local (`host: true`), así que puedes abrir la app desde el móvil con la IP del ordenador, por ejemplo `http://192.168.1.50:5173`.

| Script            | Qué hace                                  |
| ----------------- | ----------------------------------------- |
| `npm run dev`     | Servidor de desarrollo con recarga en caliente |
| `npm run build`   | Comprobación de tipos y build de producción en `dist/` |
| `npm run preview` | Sirve el build de producción              |
| `npm run lint`    | Pasa ESLint                               |

## Estructura

```
src/
├── App.tsx              # Selección de perfil, cabecera y barra de pestañas
├── components/
│   ├── ProfileScreen.tsx
│   ├── WeightTab.tsx
│   ├── RoutineTab.tsx
│   ├── NutritionTab.tsx
│   └── ui/              # Botones, tarjetas, modal, FAB, anillo de progreso…
├── hooks/
│   ├── useStorage.ts    # useLocalStorage: estado sincronizado con localStorage
│   └── useKeyboardInset.ts
├── styles/theme.ts      # Tokens de color, espaciado y tipografía
├── types/index.ts       # Modelos de datos
└── utils/id.ts          # generateId()
```

## Datos

Todo vive en `localStorage` del navegador, en estas claves: `profiles`, `weights`, `routines`, `routineWeeks`, `workoutLogs` y `nutritionDays`. Esto implica que:

- Los datos son por navegador y dispositivo; no se sincronizan entre el móvil y el ordenador.
- Borrar los datos del sitio en el navegador elimina todo el historial.

### Nota sobre los IDs

Usa siempre `generateId()` de `src/utils/id.ts` en lugar de `crypto.randomUUID()`. Al abrir la app por HTTP desde una IP de la red local el contexto no es seguro y `crypto.randomUUID` no está disponible; `generateId()` tiene un generador de respaldo.

## Documentación de diseño

- [`PRODUCT.md`](PRODUCT.md) — propósito, usuarios y principios del producto.
- [`DESIGN.md`](DESIGN.md) — sistema visual (puede no reflejar aún el último rediseño).
