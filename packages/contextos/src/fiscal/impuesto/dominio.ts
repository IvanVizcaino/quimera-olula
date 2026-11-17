import { ejercicioActual } from "#/contabilidad/asiento/dominio.ts";
import { MetaTabla } from "@olula/componentes/index.js";
import { MetaModelo } from "@olula/lib/dominio.ts";
import { camposCambiados, metaFiltroCodigoDescripcion, numero, texto, textoONull } from "../comun/dominio.ts";
import { ConfigMaestroFiscal } from "../comun/maestro/diseño.ts";
import FISCAL_Urls from "../comun/urls.ts";
import { CamposImpuesto } from "./CamposImpuesto.tsx";
import { CampoSubcuenta, DatosImpuesto, Impuesto, NuevoImpuesto, SufijoSubcuenta, TipoBienes } from "./diseño.ts";
import { SUBCUENTAS } from "./subcuentas.ts";

export { SUBCUENTAS, TIPOS_BIENES } from "./subcuentas.ts";

const campo = (sufijo: SufijoSubcuenta): CampoSubcuenta => `sc_${sufijo}`;

const subcuentasVacias = () =>
    Object.fromEntries(SUBCUENTAS.map(({ sufijo }) => [campo(sufijo), ""])) as Record<CampoSubcuenta, string>;

const datosVacios = (): DatosImpuesto => ({
    descripcion: "", iva: 0, recargo: 0, tipoBienes: "Corrientes", ...subcuentasVacias(),
});

export const impuestoDesdeApi = (api: Record<string, unknown>): Impuesto => {
    const subcuentas = (api.subcuentas ?? {}) as Record<string, { codigo?: string }>;
    return {
        id: texto(api.id),
        descripcion: texto(api.descripcion),
        iva: numero(api.iva),
        recargo: numero(api.recargo),
        tipoBienes: (texto(api.tipo_bienes) || "Corrientes") as TipoBienes,
        ...subcuentasVacias(),
        ...Object.fromEntries(Object.entries(subcuentas).map(
            ([sufijo, s]) => [`sc_${sufijo}`, texto(s?.codigo)])),
    };
};

const MAPA_API: [keyof DatosImpuesto, string, ((v: unknown) => unknown)?][] = [
    ["descripcion", "descripcion", textoONull],
    ["iva", "iva", numero],
    ["recargo", "recargo", numero],
    ["tipoBienes", "tipo_bienes"],
];

const subcuentasCambiadas = (previo: DatosImpuesto, actual: DatosImpuesto) =>
    Object.fromEntries(SUBCUENTAS
        .filter(({ sufijo }) => texto(actual[campo(sufijo)]).trim() !== texto(previo[campo(sufijo)]).trim())
        .map(({ sufijo }) => [sufijo, texto(actual[campo(sufijo)]).trim()]));

/** Lo cambiado; las subcuentas van en `subcuentas` (vacía = quitarla) con el
 * ejercicio actual, que completa el punto y da los ids. */
export const cambiosImpuestoAApi = (previo: DatosImpuesto, actual: DatosImpuesto) => {
    const cambios = camposCambiados(previo, actual, MAPA_API);
    const subcuentas = subcuentasCambiadas(previo, actual);
    return {
        ...cambios,
        ...(Object.keys(subcuentas).length > 0 ? { subcuentas, ejercicio_id: ejercicioActual() } : {}),
    };
};

export const nuevoImpuestoAApi = (nuevo: NuevoImpuesto) => ({
    id: nuevo.id.trim(),
    descripcion: textoONull(nuevo.descripcion),
    iva: numero(nuevo.iva),
    recargo: numero(nuevo.recargo),
    tipo_bienes: nuevo.tipoBienes,
    subcuentas: subcuentasCambiadas(datosVacios(), nuevo),
    ejercicio_id: ejercicioActual(),
});

const campos = {
    descripcion: { maximo: 50 },
    iva: { requerido: true, tipo: "decimal" as const },
    recargo: { requerido: true, tipo: "decimal" as const },
    tipoBienes: { tipo: "selector" as const },
    ...Object.fromEntries(SUBCUENTAS.map(({ sufijo }) => [campo(sufijo), { maximo: 15, requerido: false }])),
};

export const metaImpuesto: MetaModelo<Impuesto> = { campos };
export const metaNuevoImpuesto: MetaModelo<NuevoImpuesto> = {
    campos: { id: { requerido: true, maximo: 10 }, ...campos },
};

const metaTabla: MetaTabla<Impuesto> = [
    { id: "id", cabecera: "Código" },
    { id: "descripcion", cabecera: "Descripción" },
    { id: "iva", cabecera: "% IVA" },
    { id: "recargo", cabecera: "% Recargo" },
    { id: "tipoBienes", cabecera: "Tipo de bienes" },
];

export const configImpuesto: ConfigMaestroFiscal<Impuesto, NuevoImpuesto> = {
    titulo: "Impuestos",
    nombre: "impuesto",
    url: new FISCAL_Urls().IMPUESTO,
    regla: "comun.impuesto",
    metaTabla,
    metaFiltro: metaFiltroCodigoDescripcion,
    desdeApi: impuestoDesdeApi,
    vacio: () => ({ id: "", ...datosVacios() }),
    nuevoVacio: () => ({ id: "", ...datosVacios() }),
    metaEntidad: metaImpuesto,
    metaNuevo: metaNuevoImpuesto,
    nuevoAApi: nuevoImpuestoAApi,
    cambiosAApi: cambiosImpuestoAApi,
    Campos: CamposImpuesto,
    CamposNuevo: CamposImpuesto,
    avisoBorrado: "No se puede borrar si lo usan artículos, líneas de documentos o subcuentas.",
    confirmacion: {
        campo: "asociar_cuentas_especiales",
        pregunta: "¿Desea establecer la asociación ahora de forma automática?",
    },
};
