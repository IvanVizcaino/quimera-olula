import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { MetaModelo, stringNoVacio } from "@olula/lib/dominio.ts";
import { Familia } from "../../diseño.ts";
import { getFamilia } from "../../infraestructura.ts";
import { ContextoFamilia, EstadoFamilia } from "./diseño.ts";

type ProcesarFamilia = ProcesarContexto<EstadoFamilia, ContextoFamilia>;

export const familiaVacia = (): Familia => ({
    id: "",
    descripcion: "",
    unidadId: "",
});

export const metaFamilia: MetaModelo<Familia> = {
    campos: {
        descripcion: {
            requerido: true,
            validacion: (m: Familia) => stringNoVacio(m.descripcion),
        },
    },
};

export const cargarContexto: ProcesarFamilia = async (contexto, payload) => {
    const id = payload as string;
    if (!id) {
        return {
            ...contexto,
            estado: "INICIAL",
            familia: familiaVacia(),
            familiaInicial: familiaVacia(),
        };
    }

    const familia = await getFamilia(id);
    return {
        ...contexto,
        estado: "Editando",
        familia,
        familiaInicial: familia,
    };
};

export const refrescarFamilia: ProcesarFamilia = async (contexto) => {
    const familia = await getFamilia(contexto.familia.id);
    return [
        {
            ...contexto,
            familia: {
                ...contexto.familia,
                ...familia,
            },
        },
        [["familia_cambiada", familia]],
    ];
};

export const cancelarEdicion: ProcesarFamilia = async (ctx) => ({
    ...ctx,
    familia: ctx.familiaInicial,
});
