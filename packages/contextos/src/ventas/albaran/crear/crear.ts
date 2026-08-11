import { empresaActual } from "#/valores/empresaActual.ts";
import { MetaModelo } from "@olula/lib/dominio.ts";
import { metaNuevaVenta } from "../../venta/dominio.ts";
import { NuevoAlbaran } from "../diseño.ts";

export const metaNuevoAlbaran: MetaModelo<NuevoAlbaran> = metaNuevaVenta;

export const nuevoAlbaranVacio: NuevoAlbaran = {
    cliente_id: "",
    direccion_id: "",
    empresa_id: empresaActual(),
} as NuevoAlbaran;
