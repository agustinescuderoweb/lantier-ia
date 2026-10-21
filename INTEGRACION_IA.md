# Lantier — integración de análisis de CV

## Qué incluye
- Descarga de PDF privados desde `cvs/{cvStoredName}` en Vercel Blob.
- Extracción de información laboral mediante OpenAI Responses API y esquema JSON.
- Persistencia del análisis en `emailApplications/{id}.aiAnalysis`.
- Botón **Analizar IA** por candidato, **Analizar siguiente CV pendiente** y búsqueda por requisitos.
- Autenticación de sesión para el endpoint de descarga de CV.
- Endpoint opcional para procesamiento automático por cron.

## Configuración
1. Copiar `.env.example` a `.env.local` y completar variables con credenciales **privadas** (no compartir ni subir al repositorio).
2. Configurar `OPENAI_API_KEY` en Vercel > Project > Settings > Environment Variables, junto con las variables existentes.
3. Instalar dependencias con `npm install`, ejecutar `npm run build` y luego `npm run dev`.
4. Iniciar sesión en el dashboard. Probar primero **Analizar IA** con un único candidato.
5. Buscar por experiencia y habilidades en el nuevo buscador.
6. Procesar los anteriores pulsando **Analizar siguiente CV pendiente** varias veces. Los CV ya analizados se omiten mientras no cambie `cvStoredName`.

## Automatización (opcional)
Configurar `CRON_SECRET` en Vercel y añadir en `vercel.json`:

```json
{"crons":[{"path":"/api/ai/process-next","schedule":"0 * * * *"}]}
```

Esto procesa como máximo **un CV por hora**. Para grandes volúmenes, integrar una cola de tareas y un worker (no activar múltiples cron concurrentes sin control de concurrencia). Verificar límites de cron y duración según el plan de Vercel. Los errores quedan con estado `error` y requieren revisión/reintento manual. La versión actual NO modifica el scanner de correos; el cron encuentra nuevos documentos en Firestore.

## Privacidad y límites
- El PDF contiene datos personales: restringir acceso al dashboard, usar credenciales solo en el servidor y revisar las condiciones de tratamiento de datos con el proveedor de IA.
- La búsqueda devuelve evidencia laboral; no realiza selección automática, contratación ni puntuación de personas.
- La búsqueda actual envía resúmenes laborales de todos los CV analizados en una solicitud. Para bases grandes, reemplazar por indexación semántica con recuperación paginada y controles de costo.
- Procesamiento por archivo hasta 8 MB. Se requiere cuenta API de OpenAI con facturación habilitada.
- Verificar en producción las variables, permisos, límites de tiempo y calidad de extracción (especialmente PDFs escaneados).
