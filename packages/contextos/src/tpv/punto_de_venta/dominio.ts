import { MetaModelo, stringNoVacio } from "@olula/lib/dominio.ts";
import { NuevoPuntoVentaTpv, PuntoVentaTpv } from "./diseño.ts";

export const metaNuevoPuntoVentaTpv: MetaModelo<NuevoPuntoVentaTpv> = {
    campos: {
        id: { requerido: true, validacion: (m) => stringNoVacio(m.id) },
        nombre: { requerido: true, validacion: (m) => stringNoVacio(m.nombre) },
        serieId: { requerido: true, validacion: (m) => stringNoVacio(m.serieId) },
        tiendaId: { requerido: true, validacion: (m) => stringNoVacio(m.tiendaId) },
        agenteId: { requerido: false },
    },
};

export const metaPuntoVentaTpv: MetaModelo<PuntoVentaTpv> = {
    campos: {
        nombre: { requerido: true, validacion: (m) => stringNoVacio(m.nombre) },
        serieId: { requerido: true, validacion: (m) => stringNoVacio(m.serieId ?? "") },
        tiendaId: { requerido: true, validacion: (m) => stringNoVacio(m.tiendaId ?? "") },
        agenteId: { requerido: false },
    },
};

export const puntoVentaVacio = (): NuevoPuntoVentaTpv => ({
    id: "",
    nombre: "",
    serieId: "",
    tiendaId: "",
    agenteId: null,
});

export const puntoVentaVacioDetalle = (): PuntoVentaTpv => ({
    id: "",
    nombre: "",
    agenteId: null,
    serieId: null,
    tiendaId: null,
});
