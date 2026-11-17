import { MetaTabla } from "@olula/componentes/index.js";
import { MetaModelo } from "@olula/lib/dominio.ts";
import { camposCambiados, metaFiltroCodigoDescripcion, texto, textoONull } from "../comun/dominio.ts";
import { ConfigMaestroFiscal } from "../comun/maestro/diseño.ts";
import FISCAL_Urls from "../comun/urls.ts";
import { CamposGrupoIvaNegocio } from "./CamposGrupoIvaNegocio.tsx";
import { DatosGrupoIvaNegocio, GrupoIvaNegocioFiscal, NuevoGrupoIvaNegocio } from "./diseño.ts";

/** Campo web -> campo de la API (/comun/grupo_iva_negocio). */
const MAPA: [keyof DatosGrupoIvaNegocio, string, ((v: unknown) => unknown)?][] = [
    ["descripcion", "descripcion", textoONull],
    ["modelo349", "modelo349"],
    ["siiClaveOperacionEmitidas", "sii_clave_operacion_emitidas", textoONull],
    ["siiClaveOperacionRecibidas", "sii_clave_operacion_recibidas", textoONull],
    ["siiTipoNoExentaEmitidas", "sii_tipo_no_exenta_emitidas", textoONull],
    ["siiCausaExentaEmitidas", "sii_causa_exenta_emitidas", textoONull],
    ["regimenIva", "regimen_iva"],
    ["regimenIvaVerifactu", "regimen_iva_verifactu", textoONull],
    ["causaExencionIvaVerifactu", "causa_exencion_iva_verifactu", textoONull],
    ["isp", "isp"],
    ["sinIva", "sin_iva"],
    ["aplicarRecargo", "aplicar_recargo"],
    ["siiExentaIva", "sii_exenta_iva"],
    ["siiServicios", "sii_servicios"],
    ["ventasADistancia", "ventas_a_distancia"],
    ["agrario", "agrario"],
    ["criterioCaja", "criterio_caja"],
];

const BOOLEANOS = new Set<keyof DatosGrupoIvaNegocio>([
    "modelo349", "isp", "sinIva", "aplicarRecargo", "siiExentaIva", "siiServicios",
    "ventasADistancia", "agrario", "criterioCaja",
]);

const datosVacios = (): DatosGrupoIvaNegocio =>
    Object.fromEntries(MAPA.map(([campo]) => [campo, BOOLEANOS.has(campo) ? false : ""])) as unknown as DatosGrupoIvaNegocio;

export const grupoDesdeApi = (api: Record<string, unknown>): GrupoIvaNegocioFiscal => ({
    id: texto(api.id),
    ...(Object.fromEntries(MAPA.map(([campo, campoApi]) => [
        campo, BOOLEANOS.has(campo) ? Boolean(api[campoApi]) : texto(api[campoApi]),
    ])) as unknown as DatosGrupoIvaNegocio),
    descripcionRegimenIvaVerifactu: texto(api.descripcion_regimen_iva_verifactu),
    descripcionCausaExencionIvaVerifactu: texto(api.descripcion_causa_exencion_iva_verifactu),
});

export const cambiosGrupoAApi = (previo: DatosGrupoIvaNegocio, actual: DatosGrupoIvaNegocio) =>
    camposCambiados(previo, actual, MAPA);

export const nuevoGrupoAApi = (nuevo: NuevoGrupoIvaNegocio) => ({
    id: nuevo.id.trim(),
    ...camposCambiados(datosVacios(), nuevo, MAPA),
});

const campos = {
    descripcion: { maximo: 100 },
    siiClaveOperacionEmitidas: { maximo: 2 },
    siiClaveOperacionRecibidas: { maximo: 2 },
    siiTipoNoExentaEmitidas: { maximo: 2 },
    siiCausaExentaEmitidas: { maximo: 2 },
    regimenIva: { tipo: "selector" as const },
    regimenIvaVerifactu: { tipo: "selector" as const },
    causaExencionIvaVerifactu: { tipo: "selector" as const },
    ...Object.fromEntries([...BOOLEANOS].map((c) => [c, { tipo: "checkbox" as const }])),
};

export const metaGrupo: MetaModelo<GrupoIvaNegocioFiscal> = { campos };
export const metaNuevoGrupo: MetaModelo<NuevoGrupoIvaNegocio> = {
    campos: { id: { requerido: true, maximo: 10 }, ...campos },
};

const metaTabla: MetaTabla<GrupoIvaNegocioFiscal> = [
    { id: "id", cabecera: "Código" },
    { id: "descripcion", cabecera: "Descripción" },
    { id: "regimenIva", cabecera: "Régimen IVA" },
    { id: "regimenIvaVerifactu", cabecera: "Régimen Veri*Factu" },
    { id: "causaExencionIvaVerifactu", cabecera: "Causa exención" },
];

export const configGrupoIvaNegocio: ConfigMaestroFiscal<GrupoIvaNegocioFiscal, NuevoGrupoIvaNegocio> = {
    titulo: "Grupos contables Veri*Factu",
    nombre: "grupo contable",
    url: new FISCAL_Urls().GRUPO_IVA_NEGOCIO,
    regla: "comun.grupo_iva_negocio",
    metaTabla,
    metaFiltro: metaFiltroCodigoDescripcion,
    desdeApi: grupoDesdeApi,
    vacio: () => ({ id: "", descripcionRegimenIvaVerifactu: "", descripcionCausaExencionIvaVerifactu: "", ...datosVacios() }),
    nuevoVacio: () => ({ id: "", ...datosVacios() }),
    metaEntidad: metaGrupo,
    metaNuevo: metaNuevoGrupo,
    nuevoAApi: nuevoGrupoAApi,
    cambiosAApi: cambiosGrupoAApi,
    Campos: CamposGrupoIvaNegocio,
    CamposNuevo: CamposGrupoIvaNegocio,
    codigoEnCampos: true,
    avisoBorrado: "No se puede borrar si lo usan clientes, proveedores, subcuentas o documentos.",
};
