"use client";

import type { useUbicacion } from "../hooks/useUbicacion";

type UbicacionHook = ReturnType<typeof useUbicacion>;

interface Props {
  hook: UbicacionHook;
  errors?: { idRegion?: string; idProvincia?: string; idComuna?: string };
  disabled?: boolean;
  required?: boolean;
  dark?: boolean;
}

export function UbicacionSelector({
  hook,
  errors = {},
  disabled,
  required,
  dark = false,
}: Props) {
  const {
    regiones, provincias, comunas, ubicacion,
    setRegion, setProvincia, setComuna,
    loadingRegiones, loadingProvincias, loadingComunas,
  } = hook;

  const req = required
    ? <span className="text-red-400 ml-0.5">*</span>
    : null;

  const cls = (err?: string, dis?: boolean) =>
    [
      "w-full rounded-xl border px-4 py-3 outline-none transition-colors",
      dark
        ? "bg-neutral-900 text-white"
        : "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white",
      err
        ? "border-red-500 focus:border-red-500"
        : dark
        ? "border-white/10 focus:border-white/40"
        : "border-zinc-300 dark:border-zinc-700 focus:border-zinc-600",
      dis ? "opacity-50 cursor-not-allowed" : "",
    ]
      .filter(Boolean)
      .join(" ");

  return (
    <div className="space-y-4">

      {/* Región */}
      <div>
        <label className="mb-2 block text-sm">Región {req}</label>
        <select
          disabled={disabled || loadingRegiones}
          value={ubicacion.idRegion}
          onChange={(e) =>
            setRegion(e.target.value === "" ? "" : Number(e.target.value))
          }
          className={cls(errors.idRegion, disabled || loadingRegiones)}
        >
          <option value="">
            {loadingRegiones ? "Cargando regiones…" : "Selecciona una región"}
          </option>
          {regiones.map((r) => (
            <option key={r.idRegion} value={r.idRegion}>
              {r.nombreRegion}
            </option>
          ))}
        </select>
        {errors.idRegion && (
          <p className="mt-1 text-xs text-red-400">{errors.idRegion}</p>
        )}
      </div>

      {/* Provincia */}
      <div>
        <label className="mb-2 block text-sm">Provincia {req}</label>
        <select
          disabled={disabled || ubicacion.idRegion === "" || loadingProvincias}
          value={ubicacion.idProvincia}
          onChange={(e) =>
            setProvincia(e.target.value === "" ? "" : Number(e.target.value))
          }
          className={cls(errors.idProvincia, disabled || ubicacion.idRegion === "")}
        >
          <option value="">
            {ubicacion.idRegion === ""
              ? "Primero selecciona una región"
              : loadingProvincias
              ? "Cargando provincias…"
              : "Selecciona una provincia"}
          </option>
          {provincias.map((p) => (
            <option key={p.idProvincia} value={p.idProvincia}>
              {p.nombreProvincia}
            </option>
          ))}
        </select>
        {errors.idProvincia && (
          <p className="mt-1 text-xs text-red-400">{errors.idProvincia}</p>
        )}
      </div>

      {/* Comuna */}
      <div>
        <label className="mb-2 block text-sm">Comuna {req}</label>
        <select
          disabled={disabled || ubicacion.idProvincia === "" || loadingComunas}
          value={ubicacion.idComuna}
          onChange={(e) =>
            setComuna(e.target.value === "" ? "" : Number(e.target.value))
          }
          className={cls(errors.idComuna, disabled || ubicacion.idProvincia === "")}
        >
          <option value="">
            {ubicacion.idProvincia === ""
              ? "Primero selecciona una provincia"
              : loadingComunas
              ? "Cargando comunas…"
              : "Selecciona una comuna"}
          </option>
          {comunas.map((c) => (
            <option key={c.idComuna} value={c.idComuna}>
              {c.nombreComuna}
            </option>
          ))}
        </select>
        {errors.idComuna && (
          <p className="mt-1 text-xs text-red-400">{errors.idComuna}</p>
        )}
      </div>

    </div>
  );
}