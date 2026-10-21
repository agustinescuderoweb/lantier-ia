import { NextResponse } from 'next/server';
import { authorized } from '../../../../lib/session';
import { searchAnalyzedCandidates } from '../../../../lib/ai';
export const runtime = 'nodejs';
export const maxDuration = 60;
export async function POST(request) {
  if (!(await authorized())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  try {
    const { query } = await request.json();
    if (typeof query !== 'string' || query.trim().length < 3 || query.length > 500) return NextResponse.json({ error: 'Consulta inválida (3 a 500 caracteres)' }, { status: 400 });
    return NextResponse.json(await searchAnalyzedCandidates(query.trim()));
  } catch (error) { console.error('Error búsqueda IA:', error); return NextResponse.json({ error: 'No se pudo realizar la búsqueda' }, { status: 500 }); }
}
