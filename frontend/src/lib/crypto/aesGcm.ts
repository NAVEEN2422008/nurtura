import crypto from 'crypto'

export type EncryptedPayload = {
  iv: string
  tag: string
  ciphertext: string
  alg: 'aes-256-gcm'
  v: 1
}

function getKey(): Buffer {
  const keyB64 = process.env.NURTURA_ENCRYPTION_KEY_B64
  if (!keyB64) throw new Error('Missing NURTURA_ENCRYPTION_KEY_B64')
  const key = Buffer.from(keyB64, 'base64')
  if (key.length !== 32) throw new Error('NURTURA_ENCRYPTION_KEY_B64 must decode to 32 bytes')
  return key
}

export function encryptString(plaintext: string): EncryptedPayload {
  const key = getKey()
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return {
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
    ciphertext: ciphertext.toString('base64'),
    alg: 'aes-256-gcm',
    v: 1,
  }
}

export function decryptString(payload: EncryptedPayload): string {
  const key = getKey()
  const iv = Buffer.from(payload.iv, 'base64')
  const tag = Buffer.from(payload.tag, 'base64')
  const ciphertext = Buffer.from(payload.ciphertext, 'base64')
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
  decipher.setAuthTag(tag)
  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()])
  return plaintext.toString('utf8')
}

