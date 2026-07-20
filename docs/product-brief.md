# Nutrimatic — product brief

Última actualización: 2026-07-15 (respuestas de entrevista UI/UX).

## Producto
Calculadora / planificador de comidas de **un día** para nutricionistas. Stack actual: Next.js + Tailwind 4 + Radix/shadcn. Dev: `http://localhost:3010/`.

## Usuarios y negocio
| | |
|--|--|
| Usuario principal | Nutricionista |
| Estado | Beta |
| Monetización prevista | Suscripción |

## Job to be done
Entrar → (limpiar) → cargar requerimientos del paciente → armar el plan del día **cubriendo metas nutricionales con agilidad**, sin depender de memoria ni consultas constantes.

## Criterio de éxito en UI
Que sea fácil **ver y cerrar gaps** vs requerimientos mientras se construye el plan.

## Restricciones / libertad (UI)
- UI en **español**.
- **Sin branding fijo** (colores, tipografía, logo, nombre comercial pueden variar en propuestas).
- **Desktop + mobile**.
- Permitido rediseño de **flujo y estructura**, no solo look & feel.
- Opción “desde concepto”: puede ser **totalmente distinta** a la UI actual (cero herencia visual/UX).
- Librerías: libres si aportan; no agregar por moda.
- Densidad / estética: criterio del agente salvo indicación.

## Cómo mostrar opciones de UI
- Espectro tipico: casi-actual → evolutiva → rediseño fuerte → solo-concepto.
- Cada opción en URL propia (`/preview/a`, `/preview/b`, …).
- **No modificar la ruta original `/`** hasta que el usuario elija migrar.
- Mock interactivo **completo y con sentido** es suficiente.

## Relacionado
Prompt reutilizable (cualquier proyecto): **UI-opciones** en `master-project/prompts/prompts-catalog.md`.
