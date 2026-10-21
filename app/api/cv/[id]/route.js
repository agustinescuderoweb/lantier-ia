import { NextResponse } from 'next/server';
import { get } from '@vercel/blob';
import { db } from '../../../../lib/firebase';
import { authorized } from '../../../../lib/session';

export async function GET(request, { params }) {
  if (!(await authorized())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  try {
    const { id } = await params;

    // 1. Buscar candidato en Firestore
    const candidateRef = db
      .collection('emailApplications')
      .doc(id);

    const candidateDoc = await candidateRef.get();

    if (!candidateDoc.exists) {
      return NextResponse.json(
        { error: 'Candidato no encontrado' },
        { status: 404 }
      );
    }

    const candidate = candidateDoc.data();

    // 2. Verificar que tenga CV almacenado
    if (!candidate.cvStored || !candidate.cvStoredName) {
      return NextResponse.json(
        { error: 'Este candidato no tiene CV almacenado' },
        { status: 404 }
      );
    }

    // 3. El scanner guarda los CVs dentro de /cvs
    const pathname = `cvs/${candidate.cvStoredName}`;

    // 4. Obtener archivo desde Vercel Private Blob
    const result = await get(pathname, {
      access: 'private',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    if (!result) {
      return NextResponse.json(
        { error: 'CV no encontrado en Blob' },
        { status: 404 }
      );
    }

    const { stream, blob } = result;

    // 5. Entregar archivo
    return new Response(stream, {
      status: 200,
      headers: {
        'Content-Type':
          blob.contentType || 'application/octet-stream',

        'Content-Disposition':
          blob.contentType === 'application/pdf'
            ? 'inline'
            : `attachment; filename="${candidate.cvStoredName}"`,

        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'private, no-store',
      },
    });

  } catch (error) {
    console.error(
      'Error obteniendo CV desde Blob:',
      error
    );

    return NextResponse.json(
      { error: 'Error obteniendo CV' },
      { status: 500 }
    );
  }
}