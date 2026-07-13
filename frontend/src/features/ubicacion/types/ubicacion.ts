export interface Region {
  idRegion: number;
  codigoRegion: string;
  nombreRegion: string;
}

export interface Provincia {
  idProvincia: number;
  nombreProvincia: string;
  region: { idRegion: number; nombreRegion: string };
}

export interface ComunaBackend {
  idComuna: number;
  nombreComuna: string;
  provincia: { idProvincia: number; nombreProvincia: string };
}

export interface UbicacionState {
  idRegion: number | "";
  idProvincia: number | "";
  idComuna: number | "";
}