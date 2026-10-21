import crypto from 'crypto';

export function getExpectedSessionToken() {
  if (!process.env.SESSION_SECRET) {
    throw new Error(
      'SESSION_SECRET no está configurado'
    );
  }

  return crypto
    .createHmac(
      'sha256',
      process.env.SESSION_SECRET
    )
    .update('lantier-admin')
    .digest('hex');
}

export function isValidSession(token) {
  if (!token) {
    return false;
  }

  const expectedToken =
    getExpectedSessionToken();

  const tokenBuffer =
    Buffer.from(token);

  const expectedBuffer =
    Buffer.from(expectedToken);

  if (
    tokenBuffer.length !==
    expectedBuffer.length
  ) {
    return false;
  }

  return crypto.timingSafeEqual(
    tokenBuffer,
    expectedBuffer
  );
}