export type DireccionBodega = {
  idDireccionBodega?: number;
  idComuna?: number;
  nombreComuna?: string;
  nombreProvincia?: string;
  nombreRegion?: string;
  calle?: string;
  numero?: string;
  detalle?: string;
};

export type Bodega = {
  idBodega?: number;
  nombre: string;
  activa?: boolean;
  direccionFisica: string;
  direccion?: DireccionBodega;
};

export type Region    = { idRegion: number; codigoRegion: string; nombreRegion: string };
export type Provincia = { idProvincia: number; nombreProvincia: string };
export type Comuna    = { idComuna: number; nombreComuna: string };