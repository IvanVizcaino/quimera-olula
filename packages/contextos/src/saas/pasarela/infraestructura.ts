import { RestAPI } from "@olula/lib/api/rest_api.ts";
import ApiUrls from "../comun/urls.js";
import { CambiosPasarela, CampoPasarela, ModoPasarela, Pasarela, PruebaPasarela, ResumenCiclo } from "./diseño.js";

interface PasarelaApi {
    id: string;
    nombre: string;
    activa: boolean;
    por_defecto: boolean;
    modo: ModoPasarela;
    publica?: Record<string, string>;
    ultima_prueba?: PruebaPasarela | null;
    credencial_id?: string | null;
    tipo_credencial?: string | null;
    modo_desde_credencial?: boolean;
    campos?: CampoPasarela[];
    cobra_solo?: boolean;
}

const urls = new ApiUrls();

export const pasarelaDesdeApi = (p: PasarelaApi): Pasarela => ({
    id: p.id,
    nombre: p.nombre,
    activa: !!p.activa,
    porDefecto: !!p.por_defecto,
    modo: p.modo ?? "test",
    publica: p.publica ?? {},
    ultimaPrueba: p.ultima_prueba ?? null,
    tipoCredencial: p.tipo_credencial ?? null,
    credencialId: p.credencial_id ?? null,
    modoDesdeCredencial: !!p.modo_desde_credencial,
    campos: p.campos ?? [],
    cobraSolo: !!p.cobra_solo,
});

/** La API devuelve la lista directamente (no envuelta en `datos`). */
export const getPasarelas = async (): Promise<Pasarela[]> => {
    const r = await RestAPI.get<PasarelaApi[] | { datos: PasarelaApi[] }>(urls.PASARELA);
    return (Array.isArray(r) ? r : r.datos).map(pasarelaDesdeApi);
};

export const patchPasarela = async (id: string, cambios: CambiosPasarela): Promise<Pasarela> => {
    // RestAPI.patch se tipa como void, pero la API responde con la pasarela en JSON.
    const respuesta = await RestAPI.patch(
        `${urls.PASARELA}/${id}`,
        {
            activa: cambios.activa,
            por_defecto: cambios.porDefecto,
            modo: cambios.modo,
            publica: cambios.publica,
            credencial_id: cambios.credencialId,
        },
        "Error al guardar la pasarela"
    ) as unknown as PasarelaApi;
    return pasarelaDesdeApi(respuesta);
};

export const probarPasarela = async (id: string): Promise<{ ok: boolean; mensaje: string }> =>
    RestAPI.query<Record<string, never>, { ok: boolean; mensaje: string }>(
        `${urls.PASARELA}/${id}/probar`, {}, "Error al probar la conexión"
    );

/** Devuelve cuántos precios se han creado en la pasarela. */
export const sincronizarPasarela = async (id: string): Promise<number> => {
    const r = await RestAPI.query<Record<string, never>, { precios_creados: number }>(
        `${urls.PASARELA}/${id}/sincronizar`, {}, "Error al sincronizar el catálogo"
    );
    return r.precios_creados ?? 0;
};

/** Lo mismo que hace el cron diario de cobros. */
export const avanzarCiclo = async (): Promise<ResumenCiclo> =>
    RestAPI.query<Record<string, never>, ResumenCiclo>(
        `${urls.SUSCRIPCION}/avanzar`, {}, "Error al pasar el ciclo de cobro"
    );
