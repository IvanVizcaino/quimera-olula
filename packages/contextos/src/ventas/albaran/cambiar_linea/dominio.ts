import { MetaModelo } from "@olula/lib/dominio.ts";
import { metaLineaVenta } from "../../venta/dominio.ts";
import { LineaAlbaran } from "../diseño.ts";

export const metaLineaAlbaran: MetaModelo<LineaAlbaran> = metaLineaVenta;
