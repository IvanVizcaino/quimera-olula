# Análisis de rendimiento: `pnpm run ci`

**Fecha de análisis:** 12 de mayo de 2026  
**Tiempo total de ejecución:** ~120-130 segundos  
**Comando:** `pnpm -r run ci` (lint + type-check + test en todos 78 projects)

---

## 📊 Hallazgos clave

### 1. **Apps más lentas (cuello de botella)**

| App | Tiempo | Característica |
|-----|--------|-----------------|
| `legacy_app` | **~56s** | Incluye `/legacy/apps/base` en tsconfig |
| `cash` | **~54s** | Incluye `/legacy/apps/cash` en tsconfig |
| `monterelax_area_clientes` | **~51s** | Incluye `/legacy/apps/tienda-nativa-mon` en tsconfig |
| `ecofricalia` | **~38s** | Sin legacy, pero otras dependencias |
| `crema_cafe` | **~44s** | Sin legacy aparente |
| `contextos` | 27.1s | Paquete interno grande |

### 2. **Apps más rápidas (sin overhead)**

| App | Tiempo |
|-----|--------|
| `guanabana` | 17.8s |
| `olula` | 25.1s |
| `lib` | 13.2s |
| `componentes` | 18s |

---

## 🔍 Análisis técnico detallado

### **Problema #1: Inclusión de código legacy en tsconfig**

**Causa identificada:**

Las apps lentas incluyen archivos legacy en su `tsconfig.json`:

```json
// apps/legacy_app/tsconfig.json
{
  "include": [
    ".",
    "../../eslint.config.js",
    "../../vite.config.ts",
    "../../legacy/apps/base/src/project.ts"  // <-- AQUI
  ]
}
```

**Mientras que las rápidas NO lo hacen:**

```json
// apps/olula/tsconfig.json
{
  "include": [
    ".",
    "../../eslint.config.js",
    "../../vite.config.ts"
  ]
}
```

**Impacto medido:**

- `legacy/extensions/`: 3,190 líneas de código TypeScript
- `legacy/` total: 5,250 líneas compiladas indirectamente
- Las apps lentas compilan TODOS esos tipos cada vez

**Por qué es lento:**

Aunque cada app solo incluye un archivo (`project.ts`), ese archivo importa `@quimera-extension/*` packages que probablemente generan una cadena de resolución de tipos costosa.

---

### **Problema #2: Sin caché de proyecto compartida**

**Observación:**

- Cada app ejecuta `tsc -p ./tsconfig.json --noEmit` de forma independiente
- TypeScript NO comparte caché entre proyectos dentro del monorepo
- Aunque hay `composite: true` en tsconfig, **cada app hace una compilación completa**
- `tsBuildInfoFile` está configurado en el root, pero no se aprovecha en CI

**Evidencia del log:**

```
packages/lib       -> Done in 13.2s  (setup: 228ms, test: 5ms)
packages/componentes -> Done in 18s   (setup: 218ms, test: 154ms)  
packages/contextos -> Done in 27.1s   (setup: 980ms, test: 489ms)
apps/olula         -> Done in 25.1s   (setup: 221ms, test: 4ms)
apps/legacy_app    -> Done in 56s     (setup overhead + legacy compilation)
```

---

### **Problema #3: Setup de Vitest es costoso**

**Observación:**

Incluso los tests más simples tienen overhead de setup:

```
Duration 2.09s (transform 103ms, setup 228ms, collect 12ms, tests 5ms)
Duration 4.76s (transform 189ms, setup 446ms, collect 19ms, tests 7ms)
```

- Setup: 200-400ms por app
- Los tests reales: 4-10ms
- **Setup es 40-100x más lento que los tests**

**Causa:** jsdom environment + testing-library inicialización

---

### **Problema #4: ESLint re-parsea todo**

**Observación:**

ESLint no tiene configuración de caché en `eslint.config.js`:

```javascript
export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    // No hay parserOptions ni caché configurada
    // ...
  }
);
```

- ESLint ejecuta en cada app independientemente
- Sin caché cross-app
- TypeScript parser tiene que re-compilar cada proyecto

---

## 📈 Desglose de tiempos (análisis)

```
Total: ~120-130 segundos

Distribución aproximada:
- TypeScript (type-check):     ~50-60 segundos (40-50%)
  └─ legacy apps: 30-40 segundos del total
- ESLint (lint):               ~20-30 segundos (20-25%)
- Vitest (test setup overhead): ~30-40 segundos (25-33%)
  └─ Solo setup, tests reales: <5 segundos
- Coordinación pnpm:           ~5-10 segundos (5%)
```

---

## ✅ Recomendaciones realizables (Sin Breaking Changes)

### **BAJA COMPLEJIDAD - Implementar primero**

#### 1. **Excluir legacy/extensions de compilación de apps** ⭐⭐⭐ MÁXIMO IMPACTO
   
**Cambio:** Separar `project.ts` del tsconfig

```json
// apps/legacy_app/tsconfig.json
{
  "compilerOptions": {
    "skipLibCheck": true,  // Ya existe, mantener
    "noEmit": true,        // Optimizar más
  },
  "include": [
    ".",
    "../../eslint.config.js",
    "../../vite.config.ts"
    // ❌ REMOVER: "../../legacy/apps/base/src/project.ts"
  ]
}
```

**Por qué funciona:**
- El archivo `project.ts` se usa en runtime (Vite), no en type-check
- TypeScript NO necesita validar tipos de eso en CI
- Aplicar a: `legacy_app`, `cash`, `monterelax_area_clientes`

**Tiempo ahorrado estimado:** 15-25 segundos (13-21% del total)

---

#### 2. **Agregar caché de ESLint en GitHub Actions** ⭐⭐
   
**Cambio en CI:** (En `.github/workflows/ci.yml` si existe)

```yaml
- name: ESLint cache
  uses: actions/cache@v3
  with:
    path: .eslintcache
    key: eslint-${{ hashFiles('eslint.config.js', 'package.json') }}
```

**Por qué funciona:**
- ESLint ya soporta caché con flag `--cache`
- Reutiliza análisis de ejecuciones anteriores

**Cambio en package.json:**

```json
{
  "scripts": {
    "lint": "eslint --cache ."
  }
}
```

**Tiempo ahorrado estimado:** 5-10 segundos en reruns (primera ejecución igual)

---

#### 3. **Paralelizar tests por app** ⭐⭐
   
**Cambio:** En los scripts de test de apps pequeñas

```json
// apps/*/package.json
{
  "scripts": {
    "test": "vitest --run --threads"  // Ya lo hace Vitest por defecto
  }
}
```

**Verificar que no está deshabilitado:**

```bash
# En apps/*/vite.config.ts o vite.config.ts root
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    // NO agregar: threads: false
  }
});
```

**Tiempo ahorrado estimado:** Mínimo (ya usa threads, pero verificar apps pequeñas)

---

### **MEDIA COMPLEJIDAD - Planificar para Q2**

#### 4. **Usar TypeScript project references correctamente** ⭐⭐⭐

**Cambio:** Aprovechar `composite: true` existente

En lugar de:
```bash
pnpm -r run type-check  # Cada app compila TODO
```

Hacer:
```bash
tsc -b  # TypeScript build mode con caché
```

**Configuración requerida:**
- Crear `tsconfig.json` references en raíz (ya existe parcialmente)
- Cada package debe tener `composite: true` (verificar)
- CI ejecuta `tsc -b` UNA VEZ

**Tiempo ahorrado estimado:** 20-30 segundos (TypeScript usa caché between-project)

---

#### 5. **Separar CI en pipelines paralelos** ⭐⭐

**Cambio:** Estructura de CI

Actual (secuencial):
```
[Lint todo] → [Type-check todo] → [Test todo] ≈ 120s
```

Propuesto (paralelo):
```
[Lint todo] (30s)    ─┐
[Type-check todo] (40s) ├─ Paralelo ≈ 60-70s total
[Test todo] (50s)    ─┘
```

**Requiere:** GitHub Actions/GitLab CI con jobs paralelos

---

### **ALTA COMPLEJIDAD - Futuro**

#### 6. **Refactorizar legacy apps a monorepo nuevo**
   - Migrar `legacy/apps/*` fuera del tree principal
   - Compilar como paquete independiente
   - **Impacto:** 30-40 segundos de ahorro, pero requiere refactor

#### 7. **Usar Turbo o nx para caché distribuida**
   - Caché global entre ejecuciones de CI
   - Detecta qué cambió automáticamente
   - **Impacto:** Significativo en reruns, pero requiere nueva herramienta

---

## 🎯 Plan de acción recomendado

### **Fase 1 (Esta semana):**
1. ✅ Remover `legacy/apps/*/` de tsconfigs de apps lentas
2. ✅ Agregar `--cache` a ESLint en package.json root
3. ✅ Verificar que Vitest usa threads

**Impacto esperado:** -20-30 segundos (17-25% mejora)

---

### **Fase 2 (Próximas 2 semanas):**
4. ⏳ Implementar TypeScript project references (`tsc -b`)
5. ⏳ Crear CI paralelo para lint/type-check/test

**Impacto esperado:** -30-50 segundos más (total ~50-70s)

---

### **Fase 3 (Futuro):**
6. 📋 Evaluar Turbo/nx si el problema persiste
7. 📋 Refactorizar legacy si es necesario

---

## 📝 Notas técnicas

### Estado actual de optimizaciones:
- ✅ `skipLibCheck: true` - Ya configurado
- ✅ `composite: true` - Existe pero no usado en CI
- ✅ `isolatedModules: true` - Bien
- ⚠️ ESLint sin caché - Fácil agregar
- ⚠️ Legacy incluido innecesariamente - Fácil remover
- ⚠️ Tests sin paralelización global - Ya local, verificar

### Archivos a revisar antes de aplicar cambios:
1. `tsconfig.json` - referencias
2. `tsconfig.app.json` - base
3. `apps/*/tsconfig.json` - specific
4. `eslint.config.js` - caché
5. `.github/workflows/*.yml` - CI setup

---

## 🧮 Cálculo de impacto

**Sin cambios:** ~120s
**Fase 1:** ~90-100s (17-25% mejora)
**Fase 1+2:** ~50-70s (42-58% mejora)
**Fase 1+2+3:** ~30-40s (67-75% mejora potencial)

