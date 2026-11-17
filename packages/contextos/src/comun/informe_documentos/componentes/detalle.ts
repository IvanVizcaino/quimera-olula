import { Maquina, ProcesarContexto } from "@olula/lib/diseño.ts";
import { publicar } from "@olula/lib/dominio.ts";
import { FichaInforme, ModoInforme, PestañaInforme } from "../diseño.ts";
import { cambiosFicha, fichaNueva } from "../dominio.ts";
import {
    getFichaInforme,
    getResultadoInforme,
    patchFichaInforme,
} from "../infraestructura.ts";
import { ContextoDetalleInforme, EstadoDetalleInforme } from "./diseño.ts";

type ProcesarDetalle = ProcesarContexto<
    EstadoDetalleInforme,
    ContextoDetalleInforme
>;

export const contextoDetalleInicial = (
    pestaña: PestañaInforme
): ContextoDetalleInforme => ({
    estado: "INICIAL",
    ficha: fichaNueva(pestaña),
    resultado: null,
    modo: null,
});

export const guardarFicha = async (
    pestaña: PestañaInforme,
    contexto: ContextoDetalleInforme,
    ficha: FichaInforme
): Promise<void> => {
    const cambios = cambiosFicha(pestaña, contexto.ficha, ficha);
    if (Object.keys(cambios).length === 0) return;
    await patchFichaInforme(pestaña, ficha.id, cambios);
};

const refrescar =
    (pestaña: PestañaInforme): ProcesarDetalle =>
    async (contexto) => {
        const ficha = await getFichaInforme(pestaña, contexto.ficha.id);
        return [
            // Los criterios han cambiado: el resultado que había deja de valer.
            { ...contexto, ficha, resultado: null, modo: null },
            [["informe_cambiado", ficha]],
        ];
    };

const calcular =
    (pestaña: PestañaInforme): ProcesarDetalle =>
    async (contexto, payload) => {
        const modo = payload as ModoInforme;
        const resultado = await getResultadoInforme(
            pestaña,
            contexto.ficha.id,
            modo
        );
        return { ...contexto, resultado, modo };
    };

const cargar =
    (pestaña: PestañaInforme): ProcesarDetalle =>
    async (contexto, payload) => {
        const id = payload as string;
        if (!id) return contextoDetalleInicial(pestaña);
        const ficha = await getFichaInforme(pestaña, id);
        return {
            ...contexto,
            estado: "ABIERTO",
            ficha,
            resultado: null,
            modo: null,
        };
    };

export const getMaquinaDetalle =
    (
        pestaña: PestañaInforme
    ): (() => Maquina<EstadoDetalleInforme, ContextoDetalleInforme>) =>
    () => ({
        INICIAL: {
            informe_id_cambiado: [cargar(pestaña)],
            informe_deseleccionado: [publicar("informe_deseleccionado", null)],
        },
        ABIERTO: {
            informe_guardado: [refrescar(pestaña)],
            calculo_solicitado: [calcular(pestaña)],
            borrado_solicitado: "BORRANDO",
            informe_id_cambiado: [cargar(pestaña)],
        },
        BORRANDO: {
            informe_borrado: [publicar("informe_borrado", null), "INICIAL"],
            borrado_cancelado: "ABIERTO",
        },
    });
