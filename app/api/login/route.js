import { NextResponse } from 'next/server';
import crypto from 'crypto';

function createSessionToken() {
  return crypto
    .createHmac(
      'sha256',
      process.env.SESSION_SECRET
    )
    .update('lantier-admin')
    .digest('hex');
}

export async function POST(request) {
  try {
    const { email, password } =
      await request.json();

    if (
      !process.env.ADMIN_EMAIL ||
      !process.env.ADMIN_PASSWORD ||
      !process.env.SESSION_SECRET
    ) {
      console.error(
        'Variables de autenticación no configuradas'
      );

      return NextResponse.json(
        { error: 'Configuración incompleta' },
        { status: 500 }
      );
    }

    if (
      email !== process.env.ADMIN_EMAIL ||
      password !== process.env.ADMIN_PASSWORD
    ) {
      return NextResponse.json(
        { error: 'Credenciales incorrectas' },
        { status: 401 }
      );
    }

    const token = createSessionToken();

    const response = NextResponse.json({
      success: true,
    });

    response.cookies.set(
      'lantier_session',
      token,
      {
        httpOnly: true,
        secure:
          process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 8,
      }
    );

    return response;

  } catch (error) {
    console.error('Error en login:', error);

    return NextResponse.json(
      { error: 'Error iniciando sesión' },
      { status: 500 }
    );
  }
}