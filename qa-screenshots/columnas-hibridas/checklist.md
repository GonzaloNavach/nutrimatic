# QA — columnas híbridas

| # | Check | Resultado |
|---|-------|-----------|
| 1 | Botón "Columnas" ausente del header de página | ✓ (código) |
| 2 | Control "+" visible en header de cada tabla de comida | ✓ (código) |
| 3 | Menú "+" lista columnas ocultas y Restablecer | ✓ (código) |
| 4 | "×" en header oculta columna (no locked) | ✓ (código) |
| 5 | Barra "N ocultas" arriba de las comidas | ✓ (código) |
| 6 | ≤8 ocultas → chips clickeables restauran columna | ✓ (código) |
| 7 | >8 ocultas → hint a "+" sin flood de chips | ✓ (código) |
| 8 | `npm run typecheck` | ✓ |

Nota: sin Playwright en el repo; validación por typecheck + revisión de componentes. Revisar manual en localhost:3010 / Vercel tras deploy.
