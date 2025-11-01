import crypto from 'crypto';

function getKey() {
  const b64 = process.env.SECRET_KEY;
  if (!b64) throw new Error('SECRET_KEY is not set');
  const key = Buffer.from(b64, 'base64');
  if (key.length !== 32)
    throw new Error('Key must be 32 bytes for AES-256-GCM');
  return key;
}

export function encryptGCM(plain: string) {
  const key = getKey();
  const iv = crypto.randomBytes(12); // GCM 권장 12바이트
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  // 저장/전송 편의를 위해 base64로 합쳐 보관 (iv.tag.ciphertext)
  return `${iv.toString('base64')}.${tag.toString('base64')}.${enc.toString('base64')}`;
}

export function decryptGCM(token: string) {
  const [ivB64, tagB64, ctB64] = token.split('.');
  if (!ivB64 || !tagB64 || !ctB64) throw new Error('Invalid token format');
  const key = getKey();
  const iv = Buffer.from(ivB64, 'base64');
  const tag = Buffer.from(tagB64, 'base64');
  const ct = Buffer.from(ctB64, 'base64');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([decipher.update(ct), decipher.final()]);
  return dec.toString('utf8');
}
