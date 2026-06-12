# UTP Tracker

App web de seguimiento académico para estudiantes de la Universidad Tecnológica del Perú (UTP). Importa tu plan de estudios desde el PDF oficial, registra notas por evaluación y visualiza tu avance, promedio ponderado y cursos en riesgo.

🔗 **Demo:** https://seguimiento-notas.vercel.app/

## Funcionalidades

- **Dashboard** — métricas (avance, créditos, promedio ponderado), gráficos por estado/ciclo, alertas de cursos en riesgo y exportación a PNG.
- **Gestión de cursos** — agrupados por ciclo, búsqueda/filtros, edición de evaluaciones con cálculo de promedio en tiempo real y calculadora "¿cuánto necesito para aprobar?".
- **Historial** — timeline de ciclos y evolución del promedio.
- **Simulador** — prueba notas hipotéticas y aplícalas si convencen.
- **Importación PDF** — parsea el "Plan de Estudios" de UTP para autocompletar cursos.

### Niveles de alerta (cursos en curso)

| Nivel | Condición |
|-------|-----------|
| 🔴 Crítico | promedio < 8 **o** nota mínima necesaria > 18 |
| 🟡 Advertencia | promedio 8–11.4 **o** nota mínima 14–18 |
| 🟢 Bien | promedio ≥ 11.5 |
| ⚪ Sin datos | sin evaluaciones registradas |

Nota mínima aprobatoria: **11.5 / 20**.

## Stack

React 19 · Vite · TypeScript · Tailwind CSS · Zustand (estado) · Recharts (gráficos) · pdfjs-dist (parseo PDF) · html2canvas (export) · **Supabase** (auth Google + Postgres).

## Desarrollo

Requiere un archivo `.env` con las credenciales de Supabase:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

```bash
pnpm install
pnpm dev      # http://localhost:5175
pnpm build    # typecheck + build de producción
pnpm lint
```

## Persistencia

Los datos se almacenan en **Supabase** (Postgres con Row Level Security por usuario). Tablas: `perfiles`, `cursos`, `evaluaciones`. La autenticación es vía Google OAuth.
