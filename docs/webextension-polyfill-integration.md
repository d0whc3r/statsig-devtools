# Integración de webextension-polyfill

## Descripción

La extensión Statsig Developer Tools utiliza `webextension-polyfill` para garantizar la compatibilidad entre navegadores (Chrome y Firefox). Esta integración proporciona una API unificada que abstrae las diferencias entre las APIs nativas de los navegadores.

## Configuración

### Dependencias

La extensión incluye `webextension-polyfill` como dependencia:

```json
{
  "dependencies": {
    "webextension-polyfill": "^0.12.0"
  }
}
```

### Configuración de WXT

WXT maneja automáticamente la integración de `webextension-polyfill` a través del módulo `wxt/browser`. El objeto `browser` está disponible globalmente en todos los contextos de la extensión.

## Capa de Abstracción

Se ha implementado una capa de abstracción en `src/utils/browser-api.ts` que proporciona:

### BrowserStorage

Manejo unificado del almacenamiento de la extensión:

```typescript
// Guardar datos
await BrowserStorage.set('key', 'value', 'local')

// Obtener datos
const value = await BrowserStorage.get('key', 'local')

// Eliminar datos
await BrowserStorage.remove('key', 'local')

// Limpiar almacenamiento
await BrowserStorage.clear('local')
```

Soporta las áreas de almacenamiento: `local`, `sync`, `session`

### BrowserTabs

Gestión de pestañas del navegador:

```typescript
// Obtener pestaña activa
const activeTab = await BrowserTabs.getActiveTab()

// Ejecutar script en pestaña
await BrowserTabs.executeScript(tabId, { func: () => console.log('test') })
```

### BrowserCookies

Manipulación de cookies:

```typescript
// Obtener cookies
const cookies = await BrowserCookies.get('https://example.com')

// Establecer cookie
await BrowserCookies.set({
  url: 'https://example.com',
  name: 'test',
  value: 'value',
})

// Eliminar cookie
await BrowserCookies.remove({
  url: 'https://example.com',
  name: 'test',
})
```

### BrowserRuntime

Comunicación y gestión del runtime:

```typescript
// Enviar mensaje
const response = await BrowserRuntime.sendMessage({ type: 'test', data: 'value' })

// Agregar listener de mensajes
BrowserRuntime.addMessageListener((message, sender, sendResponse) => {
  // Manejar mensaje
  return true // Para respuestas asíncronas
})

// Obtener manifest
const manifest = BrowserRuntime.getManifest()

// Obtener URL de la extensión
const url = BrowserRuntime.getURL('popup.html')
```

### BrowserDetection

Detección de navegador y características:

```typescript
// Detectar navegador
console.log(BrowserDetection.isChrome) // true/false
console.log(BrowserDetection.isFirefox) // true/false
console.log(BrowserDetection.browserName) // 'Chrome', 'Firefox', etc.

// Versión del manifest
console.log(BrowserDetection.manifestVersion) // 2 o 3

// Soporte de características
console.log(BrowserDetection.supportsFeature('scripting')) // true/false
```

## Uso en Componentes

### Background Script

```typescript
import { BrowserDetection, BrowserRuntime, BrowserTabs } from '@/src/utils/browser-api'

export default defineBackground(() => {
  console.log(`Running on ${BrowserDetection.browserName}`)

  BrowserRuntime.addMessageListener((message, sender, sendResponse) => {
    // Manejar mensajes
  })
})
```

### Content Script

```typescript
import { BrowserCookies, BrowserDetection, BrowserRuntime, BrowserStorage } from '@/src/utils/browser-api'

export default defineContentScript({
  matches: ['<all_urls>'],
  main() {
    BrowserRuntime.addMessageListener(async (message, sender, sendResponse) => {
      switch (message.type) {
        case 'GET_LOCAL_STORAGE':
          const data = await BrowserStorage.get(message.key, 'local')
          sendResponse({ success: true, data })
          break
        // Otros casos...
      }
    })
  },
})
```

## Manejo de Errores

Todas las funciones de la capa de abstracción incluyen manejo de errores:

```typescript
try {
  await BrowserStorage.set('key', 'value')
} catch (error) {
  console.error('Storage operation failed:', error.message)
}
```

Los errores se envuelven en mensajes descriptivos que indican el tipo de operación que falló.

## Pruebas

Las pruebas se encuentran en `src/test/browser-api.test.ts` y cubren:

- Operaciones de almacenamiento
- Gestión de pestañas
- Manipulación de cookies
- Comunicación de runtime
- Detección de navegador
- Manejo de errores

Para ejecutar las pruebas:

```bash
npm test
```

## Compatibilidad

La integración soporta:

- **Chrome**: Manifest V3 con APIs nativas
- **Firefox**: Manifest V2/V3 con webextension-polyfill
- **Detección automática**: El sistema detecta el navegador y ajusta el comportamiento

## Variables de Entorno

WXT proporciona variables de entorno para detección:

- `import.meta.env.CHROME`: true si es Chrome
- `import.meta.env.FIREFOX`: true si es Firefox
- `import.meta.env.MANIFEST_VERSION`: versión del manifest (2 o 3)

## Consideraciones de Seguridad

- Todas las operaciones de almacenamiento están limitadas al contexto de la extensión
- Las cookies solo se pueden acceder con los permisos apropiados
- Los mensajes entre contextos están validados

## Próximos Pasos

Esta capa de abstracción será utilizada por:

- Sistema de autenticación (Tarea 2.3)
- Interfaz de usuario (Tarea 3.1)
- Integración con Statsig (Tarea 4.1)
- Manipulación de almacenamiento (Tarea 5.1)
