import { NextResponse } from 'next/server';
import { authorized } from '../../../../lib/session';
import { db } from '../../../../lib/firebase';
import { analyzeCandidate } from '../../../../lib/ai';
export const runtime = 'nodejs';
export const maxDuration = 60;
export async function POST() {
  if (!(await authorized())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  try {
    const snapshot = await db.collection('emailApplications').where('cvStored', '==', true).get();
    const next = snapshot.docs.find(doc => {
      const d = doc.data();
      return d.cvStoredName && (d.aiAnalysis?.status !== 'completed' || d.aiAnalysis?.sourceFile !== d.cvStoredName) && d.aiAnalysis?.status !== 'processing' && d.aiAnalysis?.status !== 'error';
    });
    if (!next) return NextResponse.json({ done: true });
    const result = await analyzeCandidate(next.id);
    return NextResponse.json({ id: next.id, ...result, done: false });
  } catch (error) { console.error('Error lote:', error); return NextResponse.json({ error: error.message }, { status: 500 }); }
}

// Cron opcional: configura CRON_SECRET en Vercel y habilita el cron en vercel.json.
export async function GET(request) {
  if (!process.env.CRON_SECRET || request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  try {
    const snapshot = await db.collection('emailApplications').where('cvStored', '==', true).get();
    const next = snapshot.docs.find(doc => {
      const d = doc.data();
      return d.cvStoredName && (d.aiAnalysis?.status !== 'completed' || d.aiAnalysis?.sourceFile !== d.cvStoredName) && d.aiAnalysis?.status !== 'processing' && d.aiAnalysis?.status !== 'error';
    });
    if (!next) return NextResponse.json({ done: true });
    return NextResponse.json({ id: next.id, ...(await analyzeCandidate(next.id)) });
  } catch (error) { console.error('Cron AI:', error); return NextResponse.json({ error: 'Fallo procesamiento' }, { status: 500 }); }
}
