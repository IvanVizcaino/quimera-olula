import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { getPuntoVentaTpv } from "../infraestructura.ts";
import { puntoVentaVacioDetalle } from "../dominio.ts";
import { ContextoPuntoVentaTpv, EstadoPuntoVentaTpv } from "./diseño.ts";

type ProcesarPunto = ProcesarContexto<EstadoPuntoVentaTpv, ContextoPuntoVentaTpv>;

export const cargarContexto: ProcesarPunto = async (contexto, payload) => {
    const id = payload as string;
    if (!id) {
        const vacia = puntoVentaVacioDetalle();
        return { ...contexto, estado: "INICIAL", punto: vacia, puntoInicial: vacia };
    }
    const punto = await getPuntoVentaTpv(id);
    return { ...contexto, estado: "Editando", punto, puntoInicial: punto };
};

export const refrescarPunto: ProcesarPunto = async (contexto) => {
    const punto = await getPuntoVentaTpv(contexto.punto.id);
    return [
        { ...contexto, punto },
        [["punto_cambiado", punto]],
    ];
};

export const cancelarEdicion: ProcesarPunto = async (ctx) => ({
    ...ctx,
    punto: ctx.puntoInicial,
});
