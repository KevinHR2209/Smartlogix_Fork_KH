"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api/client";
import { saveSession, type AuthSession } from "@/lib/auth";

type LoginResponse = AuthSession;

export function LoginForm() {
  const router = useRouter();

  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!correo.trim() || !password.trim()) {
      setError("Debes ingresar correo y contraseña.");
      return;
    }

    try {
      setLoading(true);

      const response = await apiPost<LoginResponse>("/api/auth/login", {
        correo,
        password,
      });

      saveSession(response);

      if (response.rol === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo iniciar sesión";

      if (message.includes("401")) {
        setError("Correo o contraseña incorrectos.");
      } else {
        setError("No se pudo iniciar sesión. Intenta nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-950 text-white px-4">
      <section className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
        <h1 className="text-3xl font-semibold">Iniciar sesión</h1>
        <p className="mt-2 text-sm text-white/60">
          Accede para comprar o administrar productos.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="correo" className="mb-2 block text-sm">
              Correo
            </label>
            <input
              id="correo"
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
              placeholder="admin@smartlogix.cl"
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
              placeholder="Ingresa tu contraseña"
              autoComplete="current-password"
            />
          </div>

          {error ? <p className="text-sm text-red-400">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-white px-4 py-3 font-medium text-neutral-950 disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </section>
    </main>
  );
}