import { ejercicioActual } from "#/contabilidad/asiento/dominio.ts";
import { MetaTabla } from "@olula/componentes/index.js";
import { MetaModelo } from "@olula/lib/dominio.ts";
import { ConfigMaestroFiscal } from "../comun/maestro/diseño.ts";
import { camposCambiados, metaFiltroCodigoDescripcion, numero, texto, textoONull } from "../comun/dominio.ts";
import FISCAL_Urls from "../comun/urls.ts";
import { CamposSerie } from "./CamposSerie.tsx";
import { DatosSerie, NuevaSerie, Serie } from "./diseño.ts";

const datosVacios = (): DatosSerie => ({
    descripcion: "",
    irpf: 0,
    sinIva: false,
    codigoCuenta: "",
    codigoSubcuenta: "",
    rectificativa: false,
    simplificada: false,
});

export const serieDesdeApi = (api: Record<string, unknown>): Serie => ({
    id: texto(api.id),
    descripcion: texto(api.descripcion),
    irpf: numero(api.irpf),
    sinIva: Boolean(api.sin_iva),
    codigoCuenta: texto(api.codigo_cuenta),
    descripcionCuenta: texto(api.descripcion_cuenta),
    codigoSubcuenta: texto(api.codigo_subcuenta),
    descripcionSubcuenta: texto(api.descripcion_subcuenta),
    rectificativa: Boolean(api.rectificativa),
    simplificada: Boolean(api.simplificada),
});

const MAPA_API: [keyof DatosSerie, string, ((v: unknown) => unknown)?][] = [
    ["descripcion", "descripcion", textoONull],
    ["irpf", "irpf", numero],
    ["sinIva", "sin_iva"],
    ["codigoCuenta", "codigo_cuenta", textoONull],
    ["codigoSubcuenta", "codigo_subcuenta", textoONull],
    ["rectificativa", "rectificativa"],
    ["simplificada", "simplificada"],
];

/** El ejercicio actual completa la subcuenta con punto y da los ids. */
export const cambiosSerieAApi = (previo: DatosSerie, actual: DatosSerie) => {
    const cambios = camposCambiados(previo, actual, MAPA_API);
    return Object.keys(cambios).length > 0 ? { ...cambios, ejercicio_id: ejercicioActual() } : {};
};

export const nuevaSerieAApi = (nueva: NuevaSerie) => ({
    id: nueva.id.trim().toUpperCase(),
    ...camposCambiados(datosVacios(), nueva, MAPA_API),
    ejercicio_id: ejercicioActual(),
});

/** series.qs::controlCtaSubcta: cuenta de ventas o subcuenta, no las dos.
 * Al vaciar un campo el formulario deja null, de ahí el `texto`. */
const validacion = (m: DatosSerie) =>
    texto(m.codigoCuenta).trim() && texto(m.codigoSubcuenta).trim()
        ? "Indique la cuenta de ventas o la subcuenta de ventas, no las dos"
        : true;

const campos = {
    descripcion: { maximo: 100 },
    irpf: { tipo: "decimal" as const },
    sinIva: { tipo: "checkbox" as const },
    codigoCuenta: { maximo: 6, requerido: false },
    codigoSubcuenta: { maximo: 15, requerido: false },
    rectificativa: { tipo: "checkbox" as const },
    simplificada: { tipo: "checkbox" as const },
};

export const metaSerie: MetaModelo<Serie> = { campos, validacion };
export const metaNuevaSerie: MetaModelo<NuevaSerie> = {
    campos: { id: { requerido: true, maximo: 2 }, ...campos },
    validacion,
};

const metaTabla: MetaTabla<Serie> = [
    { id: "id", cabecera: "Código" },
    { id: "descripcion", cabecera: "Descripción" },
    { id: "irpf", cabecera: "% IRPF" },
    { id: "codigoSubcuenta", cabecera: "Subcuenta de ventas" },
];

export const configSerie: ConfigMaestroFiscal<Serie, NuevaSerie> = {
    titulo: "Series de facturación",
    nombre: "serie",
    url: new FISCAL_Urls().SERIE,
    regla: "comun.serie",
    metaTabla,
    metaFiltro: metaFiltroCodigoDescripcion,
    desdeApi: serieDesdeApi,
    vacio: () => ({ id: "", descripcionCuenta: "", descripcionSubcuenta: "", ...datosVacios() }),
    nuevoVacio: () => ({ id: "", ...datosVacios() }),
    metaEntidad: metaSerie,
    metaNuevo: metaNuevaSerie,
    nuevoAApi: nuevaSerieAApi,
    cambiosAApi: cambiosSerieAApi,
    Campos: CamposSerie,
    CamposNuevo: CamposSerie,
    avisoBorrado: "No se puede borrar si la usan clientes, proveedores, documentos o ejercicios.",
};
