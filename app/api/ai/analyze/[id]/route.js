import { NextResponse } from 'next/server';
import { authorized } from '../../../../../lib/session';
import { analyzeCandidate } from '../../../../../lib/ai';
export const runtime = 'nodejs';
export const maxDuration = 60;
export async function POST(_request, { params }) {
  if (!(await authorized())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  try { const { id } = await params; return NextResponse.json(await analyzeCandidate(id)); }
  catch (error) { console.error('Error análisis CV:', error); return NextResponse.json({ error: error.message }, { status: 500 }); }
}
