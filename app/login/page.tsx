'use client';

import { FormEvent, useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!response.ok) {
        setError('Email o contraseña incorrectos');
        return;
      }

      window.location.href = '/';

    } catch {
      setError('No se pudo iniciar sesión');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">

      <div className="w-full max-w-md">

        <div className="mb-8 text-center">

          <p className="text-blue-400 text-sm font-semibold mb-2">
            LANTIER BUSINESS GROUP
          </p>

          <h1 className="text-3xl font-bold">
            Capital Humano
          </h1>

          <p className="text-slate-400 mt-2">
            Acceso al panel de candidatos
          </p>

        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-7"
        >

          <div className="mb-5">

            <label className="block text-sm text-slate-300 mb-2">
              Email
            </label>

            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="
                w-full
                bg-slate-950
                border
                border-slate-700
                rounded-xl
                px-4
                py-3
                outline-none
                focus:border-blue-500
              "
              placeholder="capitalhumano@lantier.com"
            />

          </div>

          <div className="mb-6">

            <label className="block text-sm text-slate-300 mb-2">
              Contraseña
            </label>

            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="
                w-full
                bg-slate-950
                border
                border-slate-700
                rounded-xl
                px-4
                py-3
                outline-none
                focus:border-blue-500
              "
              placeholder="••••••••"
            />

          </div>

          {error && (
            <div className="mb-5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="
              w-full
              bg-blue-600
              hover:bg-blue-500
              disabled:opacity-50
              disabled:cursor-not-allowed
              rounded-xl
              py-3
              font-semibold
              transition
            "
          >
            {loading
              ? 'Ingresando...'
              : 'Ingresar'}
          </button>

        </form>

      </div>

    </main>
  );
}