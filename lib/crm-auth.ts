const encoder = new TextEncoder()

export const CRM_SESSION_COOKIE_NAME = "crm_session"
export const CRM_SESSION_MAX_AGE = 60 * 60 * 24

type CrmSessionPayload = {
  email: string
  exp: number
}

function getRequiredEnv(name: "CRM_EMAIL" | "CRM_PASSWORD" | "CRM_SESSION_SECRET") {
  const value = process.env[name]

  if (!value) {
    throw new Error(`${name} is not configured`)
  }

  return value
}

function toBase64(bytes: Uint8Array) {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes).toString("base64")
  }

  let binary = ""
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }
  return btoa(binary)
}

function fromBase64(base64: string) {
  if (typeof Buffer !== "undefined") {
    return new Uint8Array(Buffer.from(base64, "base64"))
  }

  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }

  return bytes
}

function base64UrlEncode(value: string | Uint8Array) {
  const bytes = typeof value === "string" ? encoder.encode(value) : value
  return toBase64(bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "")
}

function base64UrlDecodeToString(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/")
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4)
  return new TextDecoder().decode(fromBase64(padded))
}

function base64UrlDecodeToBytes(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/")
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4)
  return fromBase64(padded)
}

async function getSigningKey() {
  const secret = getRequiredEnv("CRM_SESSION_SECRET")

  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  )
}

export function getCrmCredentials() {
  return {
    email: getRequiredEnv("CRM_EMAIL"),
    password: getRequiredEnv("CRM_PASSWORD"),
  }
}

export async function createCrmSessionToken(email: string) {
  const payload: CrmSessionPayload = {
    email,
    exp: Math.floor(Date.now() / 1000) + CRM_SESSION_MAX_AGE,
  }

  const payloadEncoded = base64UrlEncode(JSON.stringify(payload))
  const key = await getSigningKey()
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payloadEncoded))

  return `${payloadEncoded}.${base64UrlEncode(new Uint8Array(signature))}`
}

export async function verifyCrmSessionToken(token?: string | null) {
  if (!token) {
    return null
  }

  const [payloadEncoded, signatureEncoded] = token.split(".")

  if (!payloadEncoded || !signatureEncoded) {
    return null
  }

  try {
    const key = await getSigningKey()
    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      base64UrlDecodeToBytes(signatureEncoded),
      encoder.encode(payloadEncoded)
    )

    if (!isValid) {
      return null
    }

    const payload = JSON.parse(base64UrlDecodeToString(payloadEncoded)) as CrmSessionPayload

    if (!payload.email || !payload.exp || payload.exp <= Math.floor(Date.now() / 1000)) {
      return null
    }

    return payload
  } catch {
    return null
  }
}
