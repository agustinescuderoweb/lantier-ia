import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '../../../lib/firebase';
import { isValidSession } from '../../../lib/auth';

export async function GET() {
  try {
    // 1. Verificar sesión
    const cookieStore = await cookies();

    const session =
      cookieStore.get('lantier_session')?.value;

    if (!isValidSession(session)) {
      return NextResponse.json(
        {
          error: 'No autorizado',
        },
        {
          status: 401,
        }
      );
    }

    // 2. Obtener candidatos desde Firestore
    const snapshot = await db
      .collection('emailApplications')
      .get();

    const candidates = snapshot.docs.map((doc) => {
      const data = doc.data();

      const receivedAt =
        data.receivedAt?.toDate?.()?.toISOString() || null;

      const importedAt =
        data.importedAt?.toDate?.()?.toISOString() || null;

      const respondedAt =
        data.respondedAt?.toDate?.()?.toISOString() || null;

      return {
        id: doc.id,
        aiAnalysis: data.aiAnalysis ? { status: data.aiAnalysis.status, summary: data.aiAnalysis.summary || "" } : null,

        name: data.name || 'Sin nombre',
        email: data.email || '',
        category: data.category || 'Otro',
        subject: data.subject || '',

        attachmentName:
          data.attachmentName || '',

        cvStored:
          data.cvStored || false,

        cvStoredName:
          data.cvStoredName || '',

        status:
          data.status || '',

        responseSent:
          data.responseSent || false,

        receivedAt,
        importedAt,
        respondedAt,

        date:
          respondedAt ||
          receivedAt ||
          importedAt ||
          null,
      };
    });

    // 3. Más recientes primero
    candidates.sort((a, b) => {
      if (!a.date) return 1;
      if (!b.date) return -1;

      return (
        new Date(b.date).getTime() -
        new Date(a.date).getTime()
      );
    });

    return NextResponse.json(candidates);

  } catch (error) {
    console.error(
      'Error obteniendo candidatos:',
      error
    );

    return NextResponse.json(
      {
        error: 'Error obteniendo candidatos',
      },
      {
        status: 500,
      }
    );
  }
}