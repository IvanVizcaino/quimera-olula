import { Entidad, Modelo } from "@olula/lib/diseño.ts";
import { MetaModelo } from "@olula/lib/dominio.ts";
import { metaFiltroCodigoDescripcion, texto } from "./dominio.ts";
import { CamposCodigoDescripcion } from "./CamposCodigoDescripcion.tsx";
import { ConfigMaestroFiscal } from "./maestro/diseño.ts";

/** Maestros Veri*Factu de código (50) y descripción obligatoria (250):
 * veri_regimenesiva y veri_causasexencioniva. */
export interface CodigoDescripcion extends Entidad, Modelo {
    id: string;
    descripcion: string;
}

const metaEntidad: MetaModelo<CodigoDescripcion> = {
    campos: { descripcion: { requerido: true, maximo: 250 } },
};
const metaNuevo: MetaModelo<CodigoDescripcion> = {
    campos: { id: { requerido: true, maximo: 50 }, descripcion: { requerido: true, maximo: 250 } },
};

export const desdeApiCodigoDescripcion = (api: Record<string, unknown>): CodigoDescripcion => ({
    id: texto(api.id),
    descripcion: texto(api.descripcion),
});

export const cambiosCodigoDescripcion = (previo: CodigoDescripcion, actual: CodigoDescripcion) =>
    actual.descripcion !== previo.descripcion ? { descripcion: actual.descripcion.trim() } : {};

export const configCodigoDescripcion = (
    datos: { titulo: string; nombre: string; url: string; regla: string },
): ConfigMaestroFiscal<CodigoDescripcion, CodigoDescripcion> => ({
    ...datos,
    metaTabla: [
        { id: "id", cabecera: "Código" },
        { id: "descripcion", cabecera: "Descripción" },
    ],
    metaFiltro: metaFiltroCodigoDescripcion,
    desdeApi: desdeApiCodigoDescripcion,
    vacio: () => ({ id: "", descripcion: "" }),
    nuevoVacio: () => ({ id: "", descripcion: "" }),
    metaEntidad,
    metaNuevo,
    nuevoAApi: (nuevo) => ({ id: nuevo.id.trim(), descripcion: nuevo.descripcion.trim() }),
    cambiosAApi: cambiosCodigoDescripcion,
    Campos: CamposCodigoDescripcion,
    CamposNuevo: CamposCodigoDescripcion,
    avisoBorrado: "No se puede borrar si lo usa algún grupo contable de IVA de negocio.",
});
