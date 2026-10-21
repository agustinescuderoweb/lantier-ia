'use client';

import { useEffect, useMemo, useState } from 'react';

type Candidate = {
  id: string;
  name: string;
  email: string;
  category: string;
  subject: string;
  attachmentName: string;
  cvStored: boolean;
  cvStoredName?: string;
  status: string;
  responseSent: boolean;
  aiAnalysis?: {status: string; summary?: string} | null;
};

type StatCardProps = {
  title: string;
  value: number;
};

export default function Home() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todos');
  const [loading, setLoading] = useState(true);
  const [aiQuery, setAiQuery] = useState('');
  const [aiResults, setAiResults] = useState<{name:string;id:string;evidence:string[];missing:string[]}[]>([]);
  const [aiMessage, setAiMessage] = useState('');
  const [aiBusy, setAiBusy] = useState(false);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  async function analyze(id: string) {
    setAnalyzingId(id);
    try {
      const r = await fetch(`/api/ai/analyze/${encodeURIComponent(id)}`, {method:'POST'});
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Error');
      setCandidates(prev => prev.map(c => c.id === id ? {...c, aiAnalysis: {status:'completed', summary:data.analysis?.summary || c.aiAnalysis?.summary}} : c));
    } catch(e) { alert(e instanceof Error ? e.message : 'Error de análisis'); }
    finally { setAnalyzingId(null); }
  }
  async function searchAI() {
    setAiBusy(true); setAiMessage(''); setAiResults([]);
    try {
      const r = await fetch('/api/ai/search', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({query:aiQuery})});
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Error');
      setAiResults(data.matches || []);
      setAiMessage(data.message || `${(data.matches || []).length} perfiles con evidencia relevante entre ${data.totalAnalyzed} CV analizados.`);
    } catch(e) {setAiMessage(e instanceof Error ? e.message : 'Error de búsqueda');}
    finally {setAiBusy(false);}
  }
  async function processNext() {
    setAiBusy(true);
    try {
      const r = await fetch('/api/ai/process-next', {method:'POST'});
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Error');
      setAiMessage(data.done ? 'No quedan CV pendientes sin errores.' : `CV procesado: ${data.id}. Actualizá la página para ver su estado.`);
    } catch(e) {setAiMessage(e instanceof Error ? e.message : 'Error');}
    finally {setAiBusy(false);}
  }

  useEffect(() => {
    async function loadCandidates() {
      try {
        const response = await fetch('/api/candidates');

        const data: unknown = await response.json();

        setCandidates(
          Array.isArray(data)
            ? (data as Candidate[])
            : []
        );
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadCandidates();
  }, []);

  const categories = useMemo(() => {
    return [
      'Todos',
      ...new Set(
        candidates
          .map((candidate) => candidate.category)
          .filter(Boolean)
      ),
    ];
  }, [candidates]);

  const filteredCandidates = useMemo(() => {
    const query = search.toLowerCase().trim();

    return candidates.filter((candidate) => {
      const matchesCategory =
        category === 'Todos' ||
        candidate.category === category;

      const searchableText = `
        ${candidate.name}
        ${candidate.email}
        ${candidate.category}
        ${candidate.subject}
        ${candidate.attachmentName}
      `.toLowerCase();

      const matchesSearch =
        searchableText.includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [candidates, search, category]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Cargando candidatos...
      </main>
    );
  }

  async function handleLogout() {
  await fetch('/api/logout', {
    method: 'POST',
  });

  window.location.href = '/login';
}

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      <div className="max-w-7xl mx-auto px-6 py-10">
         
         <header className="mb-10 flex items-start justify-between gap-4">

        <div>
    <p className="text-blue-400 text-sm font-semibold mb-2">
      LANTIER BUSINESS GROUP
    </p>

    <h1 className="text-4xl font-bold">
      Capital Humano
    </h1>

    <p className="text-slate-400 mt-2">
      Gestión y búsqueda de postulantes
    </p>
  </div>

  <button
    onClick={handleLogout}
    className="
      bg-slate-900
      hover:bg-red-500/10
      border
      border-slate-700
      hover:border-red-500/30
      text-slate-300
      hover:text-red-400
      px-4
      py-2
      rounded-lg
      text-sm
      transition
    "
  >
    Cerrar sesión
  </button>

       </header>

        <section className="grid md:grid-cols-3 gap-4 mb-8">

          <StatCard
            title="Candidatos"
            value={candidates.length}
          />

          <StatCard
            title="Categorías"
            value={
              new Set(
                candidates.map((c) => c.category)
              ).size
            }
          />

          <StatCard
            title="Respondidos"
            value={
              candidates.filter(
                (c) => c.responseSent
              ).length
            }
          />

        </section>

        <section className="bg-slate-900 border border-blue-900 rounded-2xl p-5 mb-8">
          <h2 className="text-xl font-semibold mb-2">Búsqueda inteligente de CV</h2>
          <p className="text-sm text-slate-400 mb-4">Buscá habilidades y experiencia laboral acreditadas. La evaluación final corresponde a Recursos Humanos.</p>
          <form onSubmit={(e) => {e.preventDefault(); void searchAI();}} className="flex flex-col sm:flex-row gap-3">
            <input aria-label="Requisitos laborales" value={aiQuery} onChange={e=>setAiQuery(e.target.value)} minLength={3} maxLength={500} placeholder="Ej.: experiencia en turismo y Excel" className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3" />
            <button disabled={aiBusy || aiQuery.trim().length < 3} className="bg-blue-600 disabled:opacity-50 rounded-xl px-5 py-3">{aiBusy ? 'Procesando...' : 'Buscar con IA'}</button>
          </form>
          <button onClick={()=>void processNext()} disabled={aiBusy} className="mt-3 text-sm text-blue-300 hover:underline disabled:opacity-50">Analizar siguiente CV pendiente</button>
          {aiMessage && <p role="status" className="text-sm text-slate-300 mt-4">{aiMessage}</p>}
          {aiResults.length > 0 && <div className="mt-4 space-y-3">{aiResults.map(item=><article key={item.id} className="border border-slate-700 rounded-xl p-4">
            <div className="flex justify-between gap-3"><strong>{item.name}</strong><a className="text-blue-400" href={`/api/cv/${encodeURIComponent(item.id)}`} target="_blank" rel="noopener noreferrer">Ver CV</a></div>
            <p className="text-sm text-slate-400 mt-2">Evidencia: {item.evidence.join(' · ') || 'Sin evidencia'}</p>
            {item.missing.length > 0 && <p className="text-sm text-amber-300 mt-1">No acreditado: {item.missing.join(' · ')}</p>}
          </article>)}</div>}
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-8">

          <input
            type="text"
            placeholder="Buscar por nombre, email, puesto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="
              w-full
              bg-slate-950
              border
              border-slate-700
              rounded-xl
              px-5
              py-4
              outline-none
              focus:border-blue-500
              mb-5
            "
          />

          <div className="flex flex-wrap gap-2">

            {categories.map((item) => (

              <button
                key={item}
                onClick={() => setCategory(item)}
                className={`
                  px-4
                  py-2
                  rounded-lg
                  text-sm
                  transition

                  ${
                    category === item
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }
                `}
              >
                {item}
              </button>

            ))}

          </div>

        </section>

        <div className="mb-5 text-slate-400">
          {filteredCandidates.length} candidatos encontrados
        </div>

        <section className="space-y-3">

          {filteredCandidates.map((candidate) => (

            <article
              key={candidate.id}
              className="
                bg-slate-900
                border
                border-slate-800
                hover:border-slate-700
                rounded-2xl
                p-5
                transition
              "
            >

              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

                <div>

                  <div className="flex items-center gap-3 mb-2">

                    <h2 className="font-semibold text-lg">
                      {candidate.name}
                    </h2>

                    <span className="bg-blue-500/10 text-blue-400 text-xs px-3 py-1 rounded-full">
                      {candidate.category}
                    </span>

                  </div>

                  <p className="text-slate-400 text-sm">
                    {candidate.email}
                  </p>

                  {candidate.attachmentName && (
                    <p className="text-slate-500 text-sm mt-2">
                      📎 {candidate.attachmentName}
                    </p>
                  )}

                </div>

                <div className="flex items-center gap-3">

                  {candidate.cvStored && <button disabled={analyzingId !== null || candidate.aiAnalysis?.status === 'completed'} onClick={()=>void analyze(candidate.id)} className="text-xs border border-blue-700 rounded-lg px-3 py-2 disabled:opacity-50">
                    {analyzingId === candidate.id ? 'Analizando...' : candidate.aiAnalysis?.status === 'completed' ? 'IA ✓' : 'Analizar IA'}
                  </button>}
                  {candidate.cvStored ? (
                    <a
                      href={`/api/cv/${candidate.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="
                        bg-blue-600
                        hover:bg-blue-500
                        text-white
                        px-4
                        py-2
                        rounded-lg
                        text-sm
                        font-medium
                        transition
                      "
                    >
                      📄 Ver CV
                    </a>
                  ) : (
                    <span className="text-slate-500 text-xs">
                      CV no almacenado
                    </span>
                  )}

                  <span
                    className="
                      bg-slate-800
                      px-3
                      py-2
                      rounded-lg
                      text-xs
                      text-slate-300
                    "
                  >
                    {candidate.status === 'historical'
                      ? 'Histórico'
                      : candidate.status}
                  </span>

                  {candidate.responseSent ? (

                    <span className="text-green-400 text-sm">
                      ✓ Respondido
                    </span>

                  ) : (

                    <span className="text-slate-500 text-sm">
                      Sin respuesta automática
                    </span>

                  )}

                </div>

              </div>

            </article>

          ))}

        </section>

      </div>

    </main>
  );
}

function StatCard({
  title,
  value,
}: StatCardProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">

      <p className="text-slate-400 text-sm">
        {title}
      </p>

      <p className="text-3xl font-bold mt-2">
        {value}
      </p>

    </div>
  );
}

