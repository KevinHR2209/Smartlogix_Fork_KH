"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get("registered") === "1") {
      setSuccess("Cuenta creada correctamente. Ahora puedes iniciar sesión.");
    }
  }, [searchParams]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!correo.trim() || !password.trim()) {
      setError("Debes ingresar correo y contraseña.");
      return;
    }

    try {
      setLoading(true);
      const response = await login({
        correo: correo.trim().toLowerCase(),
        password,
      });

      if (response.rol === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/productos");
      }
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      if (message.includes("401") || message.toLowerCase().includes("credenciales")) {
        setError("Correo o contraseña incorrectos.");
      } else if (message.toLowerCase().includes("network") || message.toLowerCase().includes("fetch")) {
        setError("No se pudo conectar al servidor. Intenta nuevamente.");
      } else {
        setError("No se pudo iniciar sesión. Intenta nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  }

  const inp =
    "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-white/40 transition-colors disabled:opacity-50";

  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-950 text-white px-4">
      <section className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
        <h1 className="text-3xl font-semibold">Iniciar sesión</h1>
        <p className="mt-2 text-sm text-white/60">
          Accede para comprar o administrar productos.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="correo" className="mb-2 block text-sm">Correo</label>
            <input
              id="correo" type="email" value={correo} disabled={loading}
              onChange={(e) => setCorreo(e.target.value)}
              className={inp} placeholder="admin@smartlogix.cl"
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm">Contraseña</label>
            <input
              id="password" type="password" value={password} disabled={loading}
              onChange={(e) => setPassword(e.target.value)}
              className={inp} placeholder="Ingresa tu contraseña"
              autoComplete="current-password"
            />
          </div>

          {success && <p className="text-sm text-emerald-400">{success}</p>}
          {error && <p className="text-sm text-red-400">{error}</p>}

          <button type="submit" disabled={loading} className="w-full rounded-xl bg-white px-4 py-3 font-medium text-neutral-950 disabled:opacity-60 hover:bg-white/90 transition-colors">
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="mt-6 text-sm text-white/60">
          ¿No tienes cuenta?{" "}
          <Link href="/register" className="text-white underline">Crear cuenta</Link>
        </p>
      </section>
    </main>
  );
}