import { MetaModelo } from "@olula/lib/dominio.js";

export type NuevaAltaRapida = {
  cantidad: number;
  barcode: string;
};

export const nuevaAltaRapidaVacia: NuevaAltaRapida = {
  cantidad: 1,
  barcode: "",
};

export const metaAltaRapida: MetaModelo<NuevaAltaRapida> = {
  campos: {
    cantidad: { requerido: true, tipo: "entero" },
    barcode: { requerido: true },
  },
};
