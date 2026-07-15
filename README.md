# Nutrimatic Web — MVP

Calculador de planes nutricionales basado en el Excel **nutrimatic**, con UI inspirada en [Fintrace](https://github.com/) (Next.js 15, Tailwind 4, shadcn-style components).

## Requisitos

- Node.js 20+
- Python 3 (solo para regenerar `foods.json`)

## Inicio rápido

```powershell
cd "C:\Users\User\plan nutri\nutrimatic-web"
npm install
npm run foods:build
npm run dev
```

Abre http://localhost:3010

## Qué incluye el MVP

- 6 bloques de comida (como la hoja `Composic`)
- Buscador de ~1.300 alimentos por nombre o código
- Cálculo en tiempo real de nutrientes y costo
- Requerimientos diarios editables
- Tabla de % de adecuación
- Plan de ejemplo precargado (del Excel)

## Estructura

```
src/
├── app/                 # Next.js App Router
├── components/
│   ├── dashboard/       # PageHeader, KpiCard (de Fintrace)
│   ├── nutrimatic/      # Calculadora
│   └── ui/              # shadcn-style primitives
├── data/foods.json      # Base de alimentos
└── lib/nutrition/       # Motor de cálculo
```

## Regenerar alimentos

Si actualizas `nutrimatic-proyecto/data/csv/Base_Datos.csv`:

```powershell
npm run foods:build
```
