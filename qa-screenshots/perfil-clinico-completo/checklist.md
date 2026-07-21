# QA — Perfil clínico completo (paciente)

## Checklist

| # | Criterio | Resultado |
|---|----------|-----------|
| 1 | Formulario: sexo, edad, peso, talla, CA, cadera, IMC, riesgo CA INS | ✓ |
| 2 | Motivo clínico (9 opciones) separado de ajuste energético | ✓ |
| 3 | PA sistólica/diastólica opcional | ✓ |
| 4 | Pruebas químicas (11 analitos + fecha) plegables | ✓ |
| 5 | Opciones avanzadas: fórmula TMB (5), gestación, CENAN | ✓ |
| 6 | Contexto clínico en vivo (flags, guía) antes de calcular | ✓ |
| 7 | Calcular → metas + panel clínico + notas de ajuste | ✓ |
| 8 | Ajustes numéricos: glucémico (−carbos, +fibra), lipídico (−grasa), renal (prot), HTA (sodio) | ✓ (`npm run test:req`) |
| 9 | Multi-fórmula: Schofield, Mifflin, Harris, Owen, kcal/kg | ✓ |
| 10 | `npm run typecheck` limpio | ✓ |

## Comandos

```
npm run typecheck
npm run test:req
```

## Evidencia

- `metas-calculadas.png` — mujer 28a, CA 82, motivo glucémico, metas + contexto clínico.

## Revisión manual sugerida

- Abrir «Pruebas químicas», cargar HbA1c 6.8 y recalcular → ver fibra ≥28 g y guía glucémica.
- Cambiar fórmula a Mifflin en avanzadas → comparar TMB en detalle del cálculo.
