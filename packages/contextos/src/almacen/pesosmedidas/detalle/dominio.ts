import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { MetaModelo, stringNoVacio } from "@olula/lib/dominio.ts";
import { UnidadMedida } from "../diseño.ts";
import { getUnidadMedida } from "../infraestructura.ts";
import { ContextoUnidadMedida, EstadoUnidadMedida } from "./diseño.ts";

type ProcesarUnidadMedida = ProcesarContexto<EstadoUnidadMedida, ContextoUnidadMedida>;

export const unidadMedidaVaciaDetalle = (): UnidadMedida => ({
    id: "",
    descripcion: "",
    magnitud: "",
    factorConv: 1,
});

export const metaUnidadMedida: MetaModelo<UnidadMedida> = {
    campos: {
        descripcion: {
            requerido: true,
            validacion: (m: UnidadMedida) => stringNoVacio(m.descripcion),
        },
        magnitud: {
            requerido: true,
            validacion: (m: UnidadMedida) => stringNoVacio(m.magnitud),
        },
        factorConv: { requerido: true },
    },
};

export const cargarContexto: ProcesarUnidadMedida = async (contexto, payload) => {
    const id = payload as string;
    if (!id) {
        const vacia = unidadMedidaVaciaDetalle();
        return { ...contexto, estado: "INICIAL", unidad: vacia, unidadInicial: vacia };
    }
    const unidad = await getUnidadMedida(id);
    return { ...contexto, estado: "Editando", unidad, unidadInicial: unidad };
};

export const refrescarUnidadMedida: ProcesarUnidadMedida = async (contexto) => {
    const unidad = await getUnidadMedida(contexto.unidad.id);
    return [
        { ...contexto, unidad },
        [["unidad_cambiada", unidad]],
    ];
};

export const cancelarEdicion: ProcesarUnidadMedida = async (ctx) => ({
    ...ctx,
    unidad: ctx.unidadInicial,
});
