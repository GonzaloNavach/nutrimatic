# QA — Requerimientos desde perfil paciente

## Checklist

| # | Criterio | Resultado |
|---|----------|-----------|
| 1 | Formulario Paciente en tab Requerimientos (sexo, edad, peso, talla, actividad, objetivo) | ✓ |
| 2 | Opciones avanzadas plegadas: gestación/lactancia, biodisp. Fe/Zn, área CENAN | ✓ |
| 3 | Botón Calcular deshabilitado si faltan sexo/edad (o peso si &lt;12) | ✓ |
| 4 | Con peso: energía = Schofield × PAL × objetivo (+ addons gest/lact) | ✓ (`npm run test:req`) |
| 5 | Sin peso (edad ≥12): fallback tabla CENAN | ✓ |
| 6 | Micros CENAN por edad/sexo; gestante fólico 600, Fe 27 | ✓ |
| 7 | Resultado rellena inputs editables; KPIs usan energía/prot/carbos calculados | ✓ |
| 8 | Defaults iniciales en 0 (sin seed 1400) | ✓ |
| 9 | `npm run typecheck` limpio | ✓ |
| 10 | Playwright E2E | ✗ N/A (sin Playwright en repo; validación typecheck + selftest) |

## Notas revisión manual

- Probar mujer 28a / 58 kg / moderada → energía ~1800–2200, Vit A 700, Fe ~29.4.
- Activar gestación T2 → +285 kcal y fólico 600.
- Editar a mano una meta y recalcular → sobrescribe (comportamiento botón Calcular).

## Comandos

```
npm run typecheck
npm run test:req
```
