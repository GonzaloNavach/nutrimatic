# QA — Perfil clínico completo (paciente)

Feature: antropometría extendida, motivo clínico, laboratorio, fórmulas TMB, ajustes de metas.

| # | Punto | Estado |
|---|--------|--------|
| 1 | Formulario: CA, cadera, PA, motivo del plan (≠ solo peso) | ✓ |
| 2 | Banda CA con riesgo INS en vivo | ✓ |
| 3 | Acordeón laboratorio (11 analitos + fecha) | ✓ |
| 4 | Fórmulas: Schofield, Mifflin, Harris, Owen, kcal/kg | ✓ |
| 5 | Motivo clínico sugiere ajuste energético | ✓ |
| 6 | Calcular → metas + panel Contexto clínico | ✓ |
| 7 | Lab glucémico reduce carbos / sube fibra | ✓ (`npm run test:req`) |
| 8 | Lab lipídico ajusta grasa al 25% | ✓ |
| 9 | Creatinina alta limita proteína | ✓ |
| 10 | HTA limita sodio ≤2000 mg | ✓ |
| 11 | Typecheck sin errores | ✓ |

## Probar en UI (30 s)

1. `npm run dev` → http://localhost:3010
2. Tab **Requerimientos** → completar sexo, edad, peso, talla, CA 88 (mujer)
3. Motivo: **Control glucémico** → cargar HbA1c 7,2
4. **Calcular requerimientos** → ver Contexto clínico + metas ajustadas
