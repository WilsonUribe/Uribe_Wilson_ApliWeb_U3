# Gestor de tareas (Vue 3 + PWA)

```bash
npm install
API_TARGET=http://localhost:3000 npm run dev                         # desarrollo (proxy /api -> tu API)
npm run build && API_TARGET=http://localhost:3000 npm run preview    # probar la PWA (el SW solo se registra en build)
```
Contrato de la API y nombres de campos: `src/services/tasksApi.js` (único archivo a adaptar).

## Arquitectura
- `services/http.js`: único `fetch`; valida `response.ok`, `ApiError` (http | network | timeout), AbortSignal + timeout.
- `stores/tasksStore.js`: estado compartido de la lista (carga cancelable + "la última petición gana", mutaciones por id, optimista con reversión). `stores/toast.js`: avisos.
- `views/`: páginas (lista, formulario crear/editar, 404). `components/`: presentación con props y eventos (`TaskList`, `TaskItem`, `TaskForm`, `TaskFilters`, `StatusPanel`, `ToastRegion`, `PwaBanner`).
- El formulario no usa el store: carga su tarea con su propio AbortController.

## Estrategia de caché (public/sw.js)
| Recurso | Estrategia | Por qué |
|---|---|---|
| Shell (`/`, offline.html, manifest, iconos) | precache | arranca sin red |
| Navegaciones | red primero, luego shell, luego offline.html | última versión si hay red |
| `/assets/*` | caché primero | nombres con hash = inmutables |
| `/api/*` y POST/PATCH/DELETE | no se intercepta | sin datos obsoletos/privados ni escrituras fantasma |

Offline: la app abre y avisa; la lista muestra el error con "Reintentar".
