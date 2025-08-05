# GitHub Actions CI/CD System

Este directorio contiene un sistema de CI/CD modular y optimizado para la extensión de Chrome/Firefox de Statsig.

## 📁 Estructura

```
.github/
├── workflows/
│   ├── ci-pr.yml      # CI para Pull Requests y branches
│   └── ci-main.yml    # CI para main branch + release artifacts
├── actions/           # Acciones reutilizables (composite actions)
│   ├── setup-node-deps/
│   ├── quality-checks/
│   ├── run-tests/
│   ├── build-extensions/
│   └── create-release-artifacts/
└── README.md          # Este archivo
```

## 🔄 Workflows

### `ci-pr.yml` - Pull Requests y Branches

**Triggers:**

- Pull requests hacia `main` o `develop`
- Push a cualquier branch excepto `main`

**Jobs:**

1. **Setup & Dependencies** - Instalación de Node.js y dependencias
2. **Quality Checks** - ESLint, Prettier, TypeScript
3. **Unit Tests** - Tests unitarios con cobertura
4. **Build Extensions** - Build de Chrome y Firefox
5. **E2E Tests** - Solo si se etiqueta con `e2e-tests` o commit contiene `[e2e]`

**Características:**

- ⏭️ Salta PRs en draft
- 🚫 Cancela runs previos del mismo PR/branch
- 📊 Sube artifacts de cobertura y builds
- ⚡ Paralelización de jobs independientes

### `ci-main.yml` - Main Branch + Release

**Triggers:**

- Push a `main`
- Dispatch manual con opciones

**Jobs:**

1. **Setup & Dependencies**
2. **Quality Checks**
3. **Unit Tests**
4. **Build Extensions**
5. **E2E Tests** - Siempre ejecuta (configurable)
6. **Release Artifacts** - Crea ZIPs para Chrome/Firefox stores
7. **Security Scan** - npm audit (no bloquea)

**Características:**

- 📦 Crea artifacts de release (ZIPs)
- 🔒 Escaneo de seguridad
- 🎯 Configuración manual via workflow_dispatch
- 📈 Retención extendida de artifacts (90 días)

## 🧩 Acciones Reutilizables

### `setup-node-deps`

Configura Node.js e instala dependencias con cache optimizado.

```yaml
- uses: ./.github/actions/setup-node-deps
  with:
    node-version: '22' # opcional, default: '22'
```

### `quality-checks`

Ejecuta linting, format check y type checking.

```yaml
- uses: ./.github/actions/quality-checks
  with:
    skip-lint: 'false' # opcional
    skip-format: 'false' # opcional
    skip-type-check: 'false' # opcional
```

### `run-tests`

Ejecuta tests unitarios y/o E2E con cobertura.

```yaml
- uses: ./.github/actions/run-tests
  with:
    run-unit-tests: 'true' # opcional
    run-e2e-tests: 'false' # opcional
    upload-coverage: 'true' # opcional
```

### `build-extensions`

Construye extensiones para Chrome y Firefox.

```yaml
- uses: ./.github/actions/build-extensions
  with:
    build-chrome: 'true' # opcional
    build-firefox: 'true' # opcional
    upload-artifacts: 'true' # opcional
```

### `create-release-artifacts`

Crea ZIPs para submission a stores.

```yaml
- uses: ./.github/actions/create-release-artifacts
  with:
    create-chrome-zip: 'true' # opcional
    create-firefox-zip: 'true' # opcional
    version: '1.0.0' # opcional, lee de package.json
```

## 🚀 Comandos npm Utilizados

El sistema utiliza los scripts definidos en `package.json`:

```bash
# Quality checks
npm run lint              # ESLint
npm run format:check      # Prettier check
npm run type-check        # TypeScript

# Tests
npm run test              # Unit tests
npm run test:coverage     # Unit tests con cobertura
npm run test:e2e          # E2E tests

# Build
npm run build             # Chrome (MV3)
npm run build:firefox     # Firefox (MV2)

# Release packages
npm run zip               # Chrome ZIP
npm run zip:firefox       # Firefox ZIP
```

## 📊 Artifacts

### Pull Requests

- `coverage-reports-{run_id}` - Reportes de cobertura (30 días)
- `extension-builds-{run_id}` - Builds de desarrollo (30 días)
- `e2e-test-results-{run_id}` - Resultados E2E si aplica (30 días)

### Main Branch

- `release-packages-v{version}` - ZIPs para stores (90 días)
- Todos los artifacts de PR también se generan

## 🔧 Configuración

### Variables de Entorno

- `NODE_VERSION`: Versión de Node.js (default: '22')

### Secrets (si necesarios en el futuro)

- Para signing de extensiones
- Para auto-upload a stores
- Para notificaciones

## 🎯 Optimizaciones Implementadas

1. **Cache Inteligente**
   - Cache de `node_modules` por hash de `package-lock.json`
   - Cache nativo de npm en setup-node

2. **Paralelización**
   - Jobs independientes corren en paralelo
   - Quality checks y tests no se bloquean entre sí

3. **Cancelación Automática**
   - Cancela runs previos del mismo PR/branch
   - Evita waste de recursos

4. **Ejecución Condicional**
   - E2E tests solo cuando es necesario
   - Skip de PRs en draft
   - Release artifacts solo en main

5. **Artifacts Optimizados**
   - Retención diferenciada por tipo
   - Exclusión de source maps en builds
   - Compresión automática

## ✅ Sistema Completamente Migrado

El sistema de CI/CD ha sido completamente migrado a la nueva arquitectura modular:

1. ✅ CI legacy eliminado completamente
2. ✅ Workflows optimizados y funcionando
3. ✅ Acciones reutilizables implementadas
4. ✅ Documentación actualizada

## 🐛 Troubleshooting

### Tests E2E fallan

- Verificar que Playwright browsers están instalados
- Revisar configuración en `playwright.config.ts`
- Comprobar que builds están disponibles antes de E2E

### Artifacts no se suben

- Verificar permisos de GitHub Actions
- Comprobar que los paths existen
- Revisar logs de upload-artifact

### Cache no funciona

- Verificar que `package-lock.json` no ha cambiado
- Comprobar configuración de cache keys
- Revisar logs de setup-node

Para más ayuda, revisar los logs detallados de cada job en GitHub Actions.
