import { RestAPI } from "@olula/lib/api/rest_api.ts";
import ApiUrls from "#/contabilidad/comun/urls.ts";
import { idDeclarado347 } from "./dominio.ts";
import {
    CamposInmueble347,
    ClaveListado347,
    Declarado347,
    DeleteInmuebleModelo347,
    DiffTotalModelo347,
    GetDatosModelo347,
    GetExportAeatModelo347,
    GetGeneracionModelo347,
    GetInmueblesModelo347,
    GetListadoModelo347,
    Inmueble347,
    OrdenListado347,
    PatchGenerarModelo347,
    PatchInmuebleModelo347,
    PostInmuebleModelo347,
    ResultadoGeneracionModelo347,
} from "./diseño.ts";

const urls = new ApiUrls();

interface Declarado347Api {
    nifdeclarado: string;
    apellidosnombrers: string;
    clavecodigo: string;
    codclienteprov: string;
    codpostal: string | null;
    importe: number;
    importet1: number;
    importet2: number;
    importet3: number;
    importet4: number;
    importemetalico: number;
}

interface DiffTotalModelo347Api {
    clave: string;
    almacenado: number;
    calculado: number;
    delta: number;
}

interface ResultadoGeneracionModelo347Api {
    modelo_id: number;
    anio: string;
    origen: string;
    totalentidades: number;
    importetotal: number;
    totalinmuebles: number;
    totalarrendamiento: number;
    declarados: Declarado347Api[];
    diffs_totales: DiffTotalModelo347Api[];
    diffs_declarados: Record<string, unknown>[];
    coincide: boolean;
}

export const declarado347DesdeApi = (api: Declarado347Api): Declarado347 => ({
    id: idDeclarado347(api),
    nifdeclarado: api.nifdeclarado,
    apellidosnombrers: api.apellidosnombrers,
    clavecodigo: api.clavecodigo,
    codclienteprov: api.codclienteprov,
    codpostal: api.codpostal,
    importe: api.importe,
    importet1: api.importet1,
    importet2: api.importet2,
    importet3: api.importet3,
    importet4: api.importet4,
    importemetalico: api.importemetalico,
});

export const diffTotalModelo347DesdeApi = (api: DiffTotalModelo347Api): DiffTotalModelo347 => ({
    id: api.clave,
    clave: api.clave,
    almacenado: api.almacenado,
    calculado: api.calculado,
    delta: api.delta,
});

export const resultadoGeneracionModelo347DesdeApi = (
    api: ResultadoGeneracionModelo347Api
): ResultadoGeneracionModelo347 => ({
    modeloId: api.modelo_id,
    anio: api.anio,
    origen: api.origen,
    totalentidades: api.totalentidades,
    importetotal: api.importetotal,
    totalinmuebles: api.totalinmuebles,
    totalarrendamiento: api.totalarrendamiento,
    declarados: api.declarados.map(declarado347DesdeApi),
    diffsTotales: api.diffs_totales.map(diffTotalModelo347DesdeApi),
    diffsDeclarados: api.diffs_declarados,
    coincide: api.coincide,
});

export const getGeneracionModelo347: GetGeneracionModelo347 = async (modeloId) =>
    RestAPI.getItem<ResultadoGeneracionModelo347, ResultadoGeneracionModelo347Api>(
        urls.MODELO_347_GENERAR(modeloId),
        resultadoGeneracionModelo347DesdeApi,
        "Error al calcular el modelo 347"
    );

export const patchGenerarModelo347: PatchGenerarModelo347 = async (modeloId) => {
    await RestAPI.patch(
        urls.MODELO_347_GENERAR(modeloId),
        {},
        "Error al persistir el modelo 347"
    );
};

export const getDatosModelo347: GetDatosModelo347 = async (modeloId) =>
    RestAPI.getLista<Declarado347, Declarado347Api>(
        urls.MODELO_347_DATOS(modeloId),
        declarado347DesdeApi,
        "Error al listar declarados del modelo 347"
    );

export const getExportAeatModelo347: GetExportAeatModelo347 = async (modeloId) =>
    RestAPI.blob(urls.MODELO_347_EXPORT_AEAT(modeloId), "Error al exportar fichero AEAT 347");

interface Inmueble347Api {
    idregistro: number;
    nifarrendatario: string;
    apellidosnombrers: string;
    importe: number;
    situacion: string;
    refcatastral: string;
    nombrevia: string;
    localidad: string;
    municipio: string;
    codprovincia: string;
    codtipovia?: string | null;
    tiponumeracion?: string | null;
    numero?: string | null;
    califnumero?: string | null;
    bloque?: string | null;
    portal?: string | null;
    escalera?: string | null;
    piso?: string | null;
    puerta?: string | null;
    complemento?: string | null;
    codmunicipio?: string | null;
    codpostal?: string | null;
    nifreplegal?: string | null;
    codinmueble?: string | null;
}

const txtOpcional = (v: string | null | undefined): string | undefined => {
    const s = (v ?? "").trim();
    return s || undefined;
};

export const inmueble347DesdeApi = (api: Inmueble347Api): Inmueble347 => ({
    id: String(api.idregistro),
    idregistro: api.idregistro,
    nifarrendatario: api.nifarrendatario,
    apellidosnombrers: api.apellidosnombrers,
    importe: api.importe,
    situacion: api.situacion,
    refcatastral: api.refcatastral,
    nombrevia: api.nombrevia,
    localidad: api.localidad,
    municipio: api.municipio,
    codprovincia: api.codprovincia,
    codtipovia: txtOpcional(api.codtipovia),
    tiponumeracion: txtOpcional(api.tiponumeracion),
    numero: txtOpcional(api.numero),
    califnumero: txtOpcional(api.califnumero),
    bloque: txtOpcional(api.bloque),
    portal: txtOpcional(api.portal),
    escalera: txtOpcional(api.escalera),
    piso: txtOpcional(api.piso),
    puerta: txtOpcional(api.puerta),
    complemento: txtOpcional(api.complemento),
    codmunicipio: txtOpcional(api.codmunicipio),
    codpostal: txtOpcional(api.codpostal),
    nifreplegal: txtOpcional(api.nifreplegal),
    codinmueble: txtOpcional(api.codinmueble),
});

const cuerpoInmueble = (campos: CamposInmueble347 | Partial<CamposInmueble347>) => {
    const body: Record<string, string | number> = {};
    for (const [k, v] of Object.entries(campos)) {
        if (v === undefined || v === null) continue;
        if (k === "importe") {
            body.importe = typeof v === "number" ? v : Number(String(v).replace(",", "."));
            continue;
        }
        const s = String(v).trim();
        if (s) body[k] = s;
    }
    return body;
};

export const getInmueblesModelo347: GetInmueblesModelo347 = async (modeloId) =>
    RestAPI.getLista<Inmueble347, Inmueble347Api>(
        urls.MODELO_347_INMUEBLES(modeloId),
        inmueble347DesdeApi,
        "Error al listar inmuebles del modelo 347"
    );

export const postInmuebleModelo347: PostInmuebleModelo347 = async (modeloId, campos) => {
    const res = (await RestAPI.post(
        urls.MODELO_347_INMUEBLE(modeloId),
        cuerpoInmueble(campos),
        "Error al crear inmueble 347"
    )) as { registro_id?: number; id?: string };
    const id = res.registro_id ?? (res.id != null ? Number(res.id) : NaN);
    if (!Number.isFinite(id)) throw new Error("Respuesta de alta de inmueble sin registro_id");
    return id;
};

export const patchInmuebleModelo347: PatchInmuebleModelo347 = async (
    modeloId,
    registroId,
    campos
) => {
    await RestAPI.patch(
        urls.MODELO_347_INMUEBLE_ID(modeloId, registroId),
        cuerpoInmueble(campos),
        "Error al modificar inmueble 347"
    );
};

export const deleteInmuebleModelo347: DeleteInmuebleModelo347 = async (modeloId, registroId) => {
    await RestAPI.delete(
        urls.MODELO_347_INMUEBLE_ID(modeloId, registroId),
        "Error al borrar inmueble 347"
    );
};

export const getListadoModelo347: GetListadoModelo347 = async (
    modeloId,
    clave: ClaveListado347 = "clientes",
    orden: OrdenListado347 = "nombre",
    nif?: string
) => RestAPI.blob(urls.MODELO_347_LISTADO(modeloId, clave, orden, nif), "Error al descargar listado 347");
