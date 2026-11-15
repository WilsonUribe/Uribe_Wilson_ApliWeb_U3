// Soporte de acceso HTTP
const BASE = import.meta.env.VITE_API_URL ?? '/api'

export class ApiError extends Error {
  constructor(message, { status = 0, details = null, kind = 'http' } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details // p. ej. { titulo: 'obligatorio' } en errores 422
    this.kind = kind       // 'http' | 'network' | 'timeout'
  }
}

export const isAbort = (e) => e?.name === 'AbortError'

export async function request(path, { method = 'GET', body, signal, timeout = 10000 } = {}) {
  const ctl = new AbortController()
  const timer = setTimeout(() => ctl.abort(new DOMException('timeout', 'TimeoutError')), timeout)
  const forward = () => ctl.abort(signal.reason)
  signal?.addEventListener('abort', forward, { once: true })
  if (signal?.aborted) forward()

  try {
    const res = await fetch(BASE + path, {
      method,
      signal: ctl.signal,
      headers: { Accept: 'application/json', ...(body !== undefined && { 'Content-Type': 'application/json' }) },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
    const data = res.status === 204 ? null : await res.json().catch(() => null)
    if (!res.ok) {
      throw new ApiError(data?.error?.message ?? data?.message ?? `La API respondió con error ${res.status}.`, {
        status: res.status,
        details: data?.error?.details ?? null,
      })
    }
    return data
  } catch (e) {
    if (e instanceof ApiError || signal?.aborted) throw e // cancelación del llamador: se propaga tal cual
    if (e?.name === 'TimeoutError' || e?.name === 'AbortError') {
      throw new ApiError('La API tardó demasiado en responder.', { kind: 'timeout' })
    }
    throw new ApiError('No se pudo conectar con el servidor.', { kind: 'network' })
  } finally {
    clearTimeout(timer)
    signal?.removeEventListener('abort', forward)
  }
}
