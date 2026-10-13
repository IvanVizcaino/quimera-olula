import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { MetaModelo, stringNoVacio } from "@olula/lib/dominio.ts";
import { Subfamilia } from "../diseño.ts";
import { getSubfamilia } from "../infraestructura.ts";
import { ContextoSubfamilia, EstadoSubfamilia } from "./diseño.ts";

type ProcesarSubfamilia = ProcesarContexto<EstadoSubfamilia, ContextoSubfamilia>;

export const subfamiliaVaciaDetalle = (): Subfamilia => ({
    id: "",
    descripcion: "",
    familiaId: "",
    descripcionFamilia: null,
});

export const metaSubfamilia: MetaModelo<Subfamilia> = {
    campos: {
        descripcion: {
            requerido: true,
            validacion: (m: Subfamilia) => stringNoVacio(m.descripcion),
        },
    },
};

export const cargarContexto: ProcesarSubfamilia = async (contexto, payload) => {
    const id = payload as string;
    if (!id) {
        const vacia = subfamiliaVaciaDetalle();
        return { ...contexto, estado: "INICIAL", subfamilia: vacia, subfamiliaInicial: vacia };
    }
    const subfamilia = await getSubfamilia(id);
    return { ...contexto, estado: "Editando", subfamilia, subfamiliaInicial: subfamilia };
};

export const refrescarSubfamilia: ProcesarSubfamilia = async (contexto) => {
    const subfamilia = await getSubfamilia(contexto.subfamilia.id);
    return [
        { ...contexto, subfamilia },
        [["subfamilia_cambiada", subfamilia]],
    ];
};

export const cancelarEdicion: ProcesarSubfamilia = async (ctx) => ({
    ...ctx,
    subfamilia: ctx.subfamiliaInicial,
});
