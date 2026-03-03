const HANDLE_RE = /^[a-zA-Z0-9_-]{3,24}$/

export function isValidHandle(handle: unknown): handle is string {
  return typeof handle === "string" && HANDLE_RE.test(handle)
}