import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { Region, Provincia, ComunaBackend, UbicacionState } from "../types/ubicacion";

export type { UbicacionState };

export function useUbicacion(inicial?: Partial<UbicacionState>) {
  const [regiones, setRegiones] = useState<Region[]>([]);
  const [provincias, setProvincias] = useState<Provincia[]>([]);
  const [comunas, setComunas] = useState<ComunaBackend[]>([]);
  const [ubicacion, setUbicacion] = useState<UbicacionState>({
    idRegion: inicial?.idRegion ?? "",
    idProvincia: inicial?.idProvincia ?? "",
    idComuna: inicial?.idComuna ?? "",
  });
  const [loadingRegiones, setLoadingRegiones] = useState(true);
  const [loadingProvincias, setLoadingProvincias] = useState(false);
  const [loadingComunas, setLoadingComunas] = useState(false);

  useEffect(() => {
    apiGet<Region[]>(endpoints.regiones)
      .then(setRegiones)
      .catch(console.error)
      .finally(() => setLoadingRegiones(false));
  }, []);

  useEffect(() => {
    if (ubicacion.idRegion === "") {
      setProvincias([]);
      setComunas([]);
      return;
    }
    setLoadingProvincias(true);
    setProvincias([]);
    setComunas([]);
    apiGet<Provincia[]>(endpoints.provincias.porRegion(Number(ubicacion.idRegion)))
      .then(setProvincias)
      .catch(console.error)
      .finally(() => setLoadingProvincias(false));
  }, [ubicacion.idRegion]);

  useEffect(() => {
    if (ubicacion.idProvincia === "") {
      setComunas([]);
      return;
    }
    setLoadingComunas(true);
    setComunas([]);
    apiGet<ComunaBackend[]>(endpoints.comunas.porProvincia(Number(ubicacion.idProvincia)))
      .then(setComunas)
      .catch(console.error)
      .finally(() => setLoadingComunas(false));
  }, [ubicacion.idProvincia]);

  const setRegion = (v: number | "") =>
    setUbicacion({ idRegion: v, idProvincia: "", idComuna: "" });

  const setProvincia = (v: number | "") =>
    setUbicacion((p: UbicacionState) => ({ ...p, idProvincia: v, idComuna: "" }));

  const setComuna = (v: number | "") =>
    setUbicacion((p: UbicacionState) => ({ ...p, idComuna: v }));

  const reset = (n?: Partial<UbicacionState>) =>
    setUbicacion({
      idRegion: n?.idRegion ?? "",
      idProvincia: n?.idProvincia ?? "",
      idComuna: n?.idComuna ?? "",
    });

  return {
    regiones, provincias, comunas, ubicacion,
    setRegion, setProvincia, setComuna, reset,
    loadingRegiones, loadingProvincias, loadingComunas,
  };
}