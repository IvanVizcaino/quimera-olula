import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { MetaModelo } from "@olula/lib/dominio.ts";
import { TarjetaPuntos } from "../diseño.ts";
import { getTarjetaPuntos } from "../infraestructura.ts";
import { tarjetaPuntosVacia } from "../dominio.ts";
import { ContextoTarjetaPuntos, EstadoTarjetaPuntos } from "./diseño.ts";

type ProcesarTarjeta = ProcesarContexto<EstadoTarjetaPuntos, ContextoTarjetaPuntos>;

export const metaTarjetaPuntos: MetaModelo<TarjetaPuntos> = {
    campos: {
        nombre: { requerido: true },
        idFiscal: { requerido: true },
        direccion: { requerido: true },
    },
};

export const cargarContexto: ProcesarTarjeta = async (contexto, payload) => {
    const id = payload as string;
    if (!id) {
        const vacia = tarjetaPuntosVacia();
        return { ...contexto, estado: "INICIAL", tarjeta: vacia, tarjetaInicial: vacia };
    }
    const tarjeta = await getTarjetaPuntos(id);
    return { ...contexto, estado: "Editando", tarjeta, tarjetaInicial: tarjeta };
};

export const refrescarTarjeta: ProcesarTarjeta = async (contexto) => {
    const tarjeta = await getTarjetaPuntos(contexto.tarjeta.id);
    return [
        { ...contexto, tarjeta },
        [["tarjeta_cambiada", tarjeta]],
    ];
};

export const cancelarEdicion: ProcesarTarjeta = async (ctx) => ({
    ...ctx,
    tarjeta: ctx.tarjetaInicial,
});
