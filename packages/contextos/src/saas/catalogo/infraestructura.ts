import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { sinCuerpo } from "../comun/infraestructura.js";
import ApiUrls from "../comun/urls.js";
import { PlanApi, planDesdeApi, PrecioApi, precioDesdeApi } from "../plan/infraestructura.js";
import { AjustesSaas, AlSuperar, Catalogo, CategoriaModulo, ExtraCatalogo, LimiteCatalogo, ModuloCatalogo, TipoLimite } from "./diseño.js";

interface LimiteCatalogoApi {
    id: string;
    nombre: string;
    unidad: string;
    tipo: TipoLimite;
    al_superar: AlSuperar;
    umbral_aviso: number;
    orden: number;
}

interface ModuloCatalogoApi {
    id: string;
    nombre: string;
    descripcion: string;
    depende_de: string[];
    precio: PrecioApi;
    contratable_suelto: boolean;
    publico: boolean;
    aporta: Record<string, number>;
    orden: number;
    categoria?: CategoriaModulo;
    plugin?: string | null;
    variante?: string | null;
    variantes?: string[];
}

interface ExtraCatalogoApi {
    id: string;
    nombre: string;
    descripcion: string;
    limite_id: string | null;
    cantidad: number;
    requiere_modulo: string | null;
    precio: PrecioApi;
    recurrente: boolean;
    publico: boolean;
    activo: boolean;
    orden: number;
}

interface CatalogoApi {
    limites: LimiteCatalogoApi[];
    modulos: ModuloCatalogoApi[];
    planes: PlanApi[];
    extras: ExtraCatalogoApi[];
}

const urls = new ApiUrls();

export const limiteDesdeApi = (l: LimiteCatalogoApi): LimiteCatalogo => ({
    id: l.id,
    nombre: l.nombre,
    unidad: l.unidad ?? "",
    tipo: l.tipo,
    alSuperar: l.al_superar,
    umbralAviso: l.umbral_aviso,
    orden: l.orden ?? 0,
});

export const moduloCatalogoDesdeApi = (m: ModuloCatalogoApi): ModuloCatalogo => ({
    id: m.id,
    nombre: m.nombre,
    descripcion: m.descripcion ?? "",
    dependeDe: m.depende_de ?? [],
    precio: precioDesdeApi(m.precio),
    contratableSuelto: !!m.contratable_suelto,
    publico: !!m.publico,
    aporta: m.aporta ?? {},
    orden: m.orden ?? 0,
    categoria: m.categoria ?? "contexto",
    plugin: m.plugin ?? null,
    variante: m.variante ?? null,
    variantes: m.variantes ?? [],
});

export const extraDesdeApi = (e: ExtraCatalogoApi): ExtraCatalogo => ({
    id: e.id,
    nombre: e.nombre,
    descripcion: e.descripcion ?? "",
    limiteId: e.limite_id ?? null,
    cantidad: e.cantidad ?? 0,
    requiereModulo: e.requiere_modulo ?? null,
    precio: precioDesdeApi(e.precio),
    recurrente: !!e.recurrente,
    publico: !!e.publico,
    activo: !!e.activo,
    orden: e.orden ?? 0,
});

export const getCatalogo = async (): Promise<Catalogo> => {
    const c = await RestAPI.get<CatalogoApi>(urls.CATALOGO);
    return {
        limites: (c.limites ?? []).map(limiteDesdeApi),
        modulos: (c.modulos ?? []).map(moduloCatalogoDesdeApi),
        planes: (c.planes ?? []).map(planDesdeApi),
        extras: (c.extras ?? []).map(extraDesdeApi),
    };
};

// Módulos

export const putModulo = async (m: ModuloCatalogo): Promise<ModuloCatalogo> => {
    const respuesta = await RestAPI.put(
        `${urls.MODULO}/${m.id}`,
        {
            nombre: m.nombre,
            descripcion: m.descripcion,
            precio: m.precio,
            contratable_suelto: m.contratableSuelto,
            publico: m.publico,
            aporta: m.aporta,
            ...(m.plugin ? { variante: m.variante } : {}),
        },
        "Error al guardar el módulo"
    ) as unknown as ModuloCatalogoApi;
    return moduloCatalogoDesdeApi(respuesta);
};

// Límites

export const putLimite = async (l: LimiteCatalogo): Promise<LimiteCatalogo> => {
    const respuesta = await RestAPI.put(
        `${urls.LIMITE}/${l.id}`,
        {
            nombre: l.nombre,
            unidad: l.unidad,
            tipo: l.tipo,
            al_superar: l.alSuperar,
            umbral_aviso: l.umbralAviso,
            orden: l.orden,
        },
        "Error al guardar el límite"
    ) as unknown as LimiteCatalogoApi;
    return limiteDesdeApi(respuesta);
};

export const deleteLimite = async (id: string): Promise<void> => {
    await sinCuerpo(() => RestAPI.delete(`${urls.LIMITE}/${id}`, "Error al borrar el límite"));
};

// Extras

export const putExtra = async (e: ExtraCatalogo): Promise<ExtraCatalogo> => {
    const respuesta = await RestAPI.put(
        `${urls.EXTRA}/${e.id}`,
        {
            nombre: e.nombre,
            descripcion: e.descripcion,
            limite_id: e.limiteId,
            cantidad: e.cantidad,
            requiere_modulo: e.requiereModulo,
            precio: e.precio,
            recurrente: e.recurrente,
            publico: e.publico,
            activo: e.activo,
            orden: e.orden,
        },
        "Error al guardar el extra"
    ) as unknown as ExtraCatalogoApi;
    return extraDesdeApi(respuesta);
};

export const deleteExtra = async (id: string): Promise<void> => {
    await sinCuerpo(() => RestAPI.delete(`${urls.EXTRA}/${id}`, "Error al borrar el extra"));
};

// Ajustes

interface AjustesSaasApi {
    iva_cuotas: string;
    grupos_iva_producto?: { id: string; descripcion: string; iva: string }[];
}

export const ajustesDesdeApi = (a: AjustesSaasApi): AjustesSaas => ({
    ivaCuotas: a.iva_cuotas ?? "",
    gruposIvaProducto: (a.grupos_iva_producto ?? []).map((g) => ({ id: g.id, descripcion: g.descripcion, iva: g.iva })),
});

export const getAjustes = async (): Promise<AjustesSaas> =>
    ajustesDesdeApi(await RestAPI.get<AjustesSaasApi>(urls.AJUSTES));

export const putAjustes = async (ivaCuotas: string): Promise<AjustesSaas> =>
    ajustesDesdeApi(await RestAPI.put(urls.AJUSTES, { iva_cuotas: ivaCuotas }, "Error al guardar los ajustes") as unknown as AjustesSaasApi);
