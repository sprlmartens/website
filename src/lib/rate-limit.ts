const attempts = new Map<string, number[]>()

type RateLimitOptions = {
  max: number
  windowMs: number
}

export function checkRateLimit(
  key: string,
  { max, windowMs }: RateLimitOptions
): boolean {
  const now = Date.now()
  const windowStart = now - windowMs
  const recent = (attempts.get(key) ?? []).filter(
    (timestamp) => timestamp > windowStart
  )

  if (recent.length >= max) {
    attempts.set(key, recent)
    return false
  }

  recent.push(now)
  attempts.set(key, recent)
  return true
}
