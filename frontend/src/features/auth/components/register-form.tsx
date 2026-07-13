"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerClient } from "../use-cases/registerClient";
import type { RegisterRequest } from "../types/auth";

// ── Tipos geográficos ─────────────────────────────────────────────────────
interface Region    { idRegion: number;    nombreRegion: string }
interface Provincia { idProvincia: number; nombreProvincia: string }
interface Comuna    { idComuna: number;    nombreComuna: string }

// ── Estado del formulario ─────────────────────────────────────────────────
type RegisterFormState = Omit<RegisterRequest, "direccionPrincipal"> & {
  direccionPrincipal: {
    idComuna: number | "";
    calle: string;
    numero: string;
    detalle: string;
  };
};

const initialForm: RegisterFormState = {
  nombre: "",
  correo: "",
  password: "",
  rol: "CLIENTE",
  rut: "",
  apellidoPaterno: "",
  apellidoMaterno: "",
  telefono: "",
  direccionPrincipal: { idComuna: "", calle: "", numero: "", detalle: "" },
};

const CLIENTES_URL = process.env.NEXT_PUBLIC_CLIENTES_URL ?? "http://localhost:8080";

export function RegisterForm() {
  const router = useRouter();

  const [form, setForm]               = useState<RegisterFormState>(initialForm);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError]             = useState("");
  const [loading, setLoading]         = useState(false);

  // Geografía
  const [regiones,   setRegiones]   = useState<Region[]>([]);
  const [provincias, setProvincias] = useState<Provincia[]>([]);
  const [comunas,    setComunas]    = useState<Comuna[]>([]);
  const [idRegion,   setIdRegion]   = useState<number | "">("");
  const [idProvincia, setIdProvincia] = useState<number | "">("");
  const [loadingGeo, setLoadingGeo] = useState(false);

  // Carga regiones al montar
  useEffect(() => {
    fetch(`${CLIENTES_URL}/api/regiones`)
      .then((r) => r.json())
      .then((data: Region[]) =>
        setRegiones(data.sort((a, b) => a.nombreRegion.localeCompare(b.nombreRegion)))
      )
      .catch(() => setError("No se pudieron cargar las regiones."));
  }, []);

  // Carga provincias al cambiar región
  useEffect(() => {
    if (idRegion === "") { setProvincias([]); setIdProvincia(""); setComunas([]); return; }
    setLoadingGeo(true);
    fetch(`${CLIENTES_URL}/api/provincias/region/${idRegion}`)
      .then((r) => r.json())
      .then((data: Provincia[]) => {
        setProvincias(data.sort((a, b) => a.nombreProvincia.localeCompare(b.nombreProvincia)));
        setIdProvincia("");
        setComunas([]);
        updateDireccionField("idComuna", "");
      })
      .catch(() => setError("No se pudieron cargar las provincias."))
      .finally(() => setLoadingGeo(false));
  }, [idRegion]);

  // Carga comunas al cambiar provincia
  useEffect(() => {
    if (idProvincia === "") { setComunas([]); updateDireccionField("idComuna", ""); return; }
    setLoadingGeo(true);
    fetch(`${CLIENTES_URL}/api/comunas/provincia/${idProvincia}`)
      .then((r) => r.json())
      .then((data: Comuna[]) => {
        setComunas(data.sort((a, b) => a.nombreComuna.localeCompare(b.nombreComuna)));
        updateDireccionField("idComuna", "");
      })
      .catch(() => setError("No se pudieron cargar las comunas."))
      .finally(() => setLoadingGeo(false));
  }, [idProvincia]);

  function updateField<K extends keyof Omit<RegisterFormState, "direccionPrincipal">>(
    key: K, value: RegisterFormState[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateDireccionField<K extends keyof RegisterFormState["direccionPrincipal"]>(
    key: K, value: RegisterFormState["direccionPrincipal"][K]
  ) {
    setForm((prev) => ({
      ...prev,
      direccionPrincipal: { ...prev.direccionPrincipal, [key]: value },
    }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (
      !form.nombre.trim() || !form.correo.trim() || !form.password.trim() ||
      !form.rut.trim() || !form.apellidoPaterno.trim() || !form.apellidoMaterno.trim() ||
      !form.telefono.trim() || form.direccionPrincipal.idComuna === "" ||
      !form.direccionPrincipal.calle.trim() || !form.direccionPrincipal.numero.trim()
    ) {
      setError("Todos los campos obligatorios deben estar completos.");
      return;
    }

    if (form.password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    const payload: RegisterRequest = {
      nombre:          form.nombre.trim(),
      correo:          form.correo.trim().toLowerCase(),
      password:        form.password,
      rol:             "CLIENTE",   // ← AGREGAR esta línea
      rut:             form.rut.trim(),
      apellidoPaterno: form.apellidoPaterno.trim(),
      apellidoMaterno: form.apellidoMaterno.trim(),
      telefono:        form.telefono.trim(),
      direccionPrincipal: {
        idComuna: Number(form.direccionPrincipal.idComuna),
        calle:    form.direccionPrincipal.calle.trim(),
        numero:   form.direccionPrincipal.numero.trim(),
        detalle:  form.direccionPrincipal.detalle.trim() || undefined,
      },
    };

    try {
      setLoading(true);
      await registerClient(payload);
      router.push("/login?registered=1");
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo crear la cuenta";
      if (message.includes("409")) setError("Ya existe una cuenta con esos datos.");
      else if (message.includes("400")) setError("Datos inválidos. Revisa el formulario.");
      else setError("No se pudo crear la cuenta. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  // ── Clases reutilizables ─────────────────────────────────────────────────
  const inputClass = "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none";
  const selectClass = "w-full rounded-xl border border-white/10 bg-neutral-900 px-4 py-3 outline-none disabled:opacity-40";

  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-950 text-white px-4 py-10">
      <section className="w-full max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
        <h1 className="text-3xl font-semibold">Crear cuenta</h1>
        <p className="mt-2 text-sm text-white/60">
          Regístrate como cliente para comprar en Smartlogix.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-4 md:grid-cols-2">
          {/* Nombre */}
          <div className="md:col-span-2">
            <label htmlFor="nombre" className="mb-2 block text-sm">Nombre</label>
            <input id="nombre" value={form.nombre}
              onChange={(e) => updateField("nombre", e.target.value)}
              className={inputClass} placeholder="Juan" />
          </div>

          {/* Apellidos */}
          <div>
            <label htmlFor="apellidoPaterno" className="mb-2 block text-sm">Apellido paterno</label>
            <input id="apellidoPaterno" value={form.apellidoPaterno}
              onChange={(e) => updateField("apellidoPaterno", e.target.value)}
              className={inputClass} placeholder="Pérez" />
          </div>
          <div>
            <label htmlFor="apellidoMaterno" className="mb-2 block text-sm">Apellido materno</label>
            <input id="apellidoMaterno" value={form.apellidoMaterno}
              onChange={(e) => updateField("apellidoMaterno", e.target.value)}
              className={inputClass} placeholder="González" />
          </div>

          {/* RUT y Teléfono */}
          <div>
            <label htmlFor="rut" className="mb-2 block text-sm">RUT</label>
            <input id="rut" value={form.rut}
              onChange={(e) => updateField("rut", e.target.value)}
              className={inputClass} placeholder="12.345.678-9" />
          </div>
          <div>
            <label htmlFor="telefono" className="mb-2 block text-sm">Teléfono</label>
            <input id="telefono" value={form.telefono}
              onChange={(e) => updateField("telefono", e.target.value)}
              className={inputClass} placeholder="+56912345678" />
          </div>

          {/* Correo */}
          <div className="md:col-span-2">
            <label htmlFor="correo" className="mb-2 block text-sm">Correo</label>
            <input id="correo" type="email" value={form.correo}
              onChange={(e) => updateField("correo", e.target.value)}
              className={inputClass} placeholder="correo@ejemplo.cl" autoComplete="email" />
          </div>

          {/* Contraseñas */}
          <div>
            <label htmlFor="password" className="mb-2 block text-sm">Contraseña</label>
            <input id="password" type="password" value={form.password}
              onChange={(e) => updateField("password", e.target.value)}
              className={inputClass} placeholder="Crea una contraseña" autoComplete="new-password" />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="mb-2 block text-sm">Confirmar contraseña</label>
            <input id="confirmPassword" type="password" value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClass} placeholder="Repite la contraseña" autoComplete="new-password" />
          </div>

          {/* Dirección */}
          <div className="md:col-span-2 mt-2">
            <h2 className="text-lg font-semibold">Dirección principal</h2>
          </div>

          {/* Región */}
          <div>
            <label htmlFor="region" className="mb-2 block text-sm">Región</label>
            <select id="region" value={idRegion}
              onChange={(e) => setIdRegion(e.target.value === "" ? "" : Number(e.target.value))}
              className={selectClass}>
              <option value="">Selecciona una región</option>
              {regiones.map((r) => (
                <option key={r.idRegion} value={r.idRegion}>{r.nombreRegion}</option>
              ))}
            </select>
          </div>

          {/* Provincia */}
          <div>
            <label htmlFor="provincia" className="mb-2 block text-sm">Provincia</label>
            <select id="provincia" value={idProvincia}
              disabled={idRegion === "" || loadingGeo}
              onChange={(e) => setIdProvincia(e.target.value === "" ? "" : Number(e.target.value))}
              className={selectClass}>
              <option value="">Selecciona una provincia</option>
              {provincias.map((p) => (
                <option key={p.idProvincia} value={p.idProvincia}>{p.nombreProvincia}</option>
              ))}
            </select>
          </div>

          {/* Comuna */}
          <div>
            <label htmlFor="idComuna" className="mb-2 block text-sm">Comuna</label>
            <select id="idComuna" value={form.direccionPrincipal.idComuna}
              disabled={idProvincia === "" || loadingGeo}
              onChange={(e) =>
                updateDireccionField("idComuna", e.target.value === "" ? "" : Number(e.target.value))
              }
              className={selectClass}>
              <option value="">Selecciona una comuna</option>
              {comunas.map((c) => (
                <option key={c.idComuna} value={c.idComuna}>{c.nombreComuna}</option>
              ))}
            </select>
          </div>

          {/* Calle */}
          <div>
            <label htmlFor="calle" className="mb-2 block text-sm">Calle</label>
            <input id="calle" value={form.direccionPrincipal.calle}
              onChange={(e) => updateDireccionField("calle", e.target.value)}
              className={inputClass} placeholder="Av. Providencia" />
          </div>

          {/* Número */}
          <div>
            <label htmlFor="numero" className="mb-2 block text-sm">Número</label>
            <input id="numero" value={form.direccionPrincipal.numero}
              onChange={(e) => updateDireccionField("numero", e.target.value)}
              className={inputClass} placeholder="1234" />
          </div>

          {/* Detalle */}
          <div>
            <label htmlFor="detalle" className="mb-2 block text-sm">Detalle <span className="text-white/40">(opcional)</span></label>
            <input id="detalle" value={form.direccionPrincipal.detalle}
              onChange={(e) => updateDireccionField("detalle", e.target.value)}
              className={inputClass} placeholder="Depto 401" />
          </div>

          {error && <p className="md:col-span-2 text-sm text-red-400">{error}</p>}

          <button type="submit" disabled={loading}
            className="md:col-span-2 w-full rounded-xl bg-white px-4 py-3 font-medium text-neutral-950 disabled:opacity-60">
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>

        <p className="mt-6 text-sm text-white/60">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-white underline">Inicia sesión</Link>
        </p>
      </section>
    </main>
  );
}