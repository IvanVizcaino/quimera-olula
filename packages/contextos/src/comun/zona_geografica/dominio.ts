import { MetaModelo } from "@olula/lib/dominio.ts";
import { CambiosZonaGeografica, NuevaZonaGeografica, ZonaGeografica } from "./diseño.ts";

export const REGLA_ZONA_GEOGRAFICA = "comun.zona_geografica";

export const nuevoZonaGeograficaVacio = (): NuevaZonaGeografica => ({ id: "", descripcion: "" });

export const zonaGeograficaVacio = (): ZonaGeografica => ({ id: "", descripcion: "" });

export const etiquetaZonaGeografica = (z: ZonaGeografica): string =>
    z.descripcion ? `${z.id} — ${z.descripcion}` : z.id;

export const metaZonaGeografica: MetaModelo<ZonaGeografica> = {
    campos: { descripcion: { requerido: false, maximo: 100 } },
};

export const metaNuevoZonaGeografica: MetaModelo<NuevaZonaGeografica> = {
    campos: {
        id: { requerido: true, maximo: 20 },
        descripcion: { requerido: false, maximo: 100 },
    },
};

export const cambiosZonaGeografica = (
    previa: ZonaGeografica,
    actual: ZonaGeografica
): CambiosZonaGeografica =>
    actual.descripcion !== previa.descripcion ? { descripcion: actual.descripcion } : {};
