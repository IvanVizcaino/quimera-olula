import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { Criteria, Entidad, Modelo } from "@olula/lib/diseño.ts";
import { ConfigMaestroFiscal } from "./diseño.ts";

type Config<T extends Entidad & Modelo> = Pick<ConfigMaestroFiscal<T, Modelo>, "url" | "desdeApi" | "nombre">;

const urlId = (url: string, id: string) => `${url}/${encodeURIComponent(id)}`;

export const getLista = <T extends Entidad & Modelo>(config: Config<T>, criteria: Criteria) =>
    RestAPI.getQuery<T, Record<string, unknown>>(config.url, criteria, config.desdeApi);

export const getUno = <T extends Entidad & Modelo>(config: Config<T>, id: string) =>
    RestAPI.getItem<T, Record<string, unknown>>(urlId(config.url, id), config.desdeApi);

export const postUno = async <T extends Entidad & Modelo>(
    config: Config<T>, datos: Record<string, unknown>,
): Promise<string> => {
    const respuesta = await RestAPI.post(config.url, datos, `Error al crear ${config.nombre}`);
    return String(respuesta.id);
};

export const patchUno = async <T extends Entidad & Modelo>(
    config: Config<T>, id: string, datos: Record<string, unknown>,
): Promise<void> => {
    await RestAPI.patch(urlId(config.url, id), datos, `Error al guardar ${config.nombre}`);
};

export const deleteUno = async <T extends Entidad & Modelo>(config: Config<T>, id: string): Promise<void> => {
    await RestAPI.delete(urlId(config.url, id), `Error al borrar ${config.nombre}`);
};

/** Error de RestAPI con el estado HTTP (llamada() rechaza con él). */
export const esConflicto = (error: unknown): boolean =>
    typeof error === "object" && error !== null && (error as { estado?: number }).estado === 409;

export const textoError = (error: unknown): string =>
    typeof error === "object" && error !== null
        ? String((error as { descripcion?: string }).descripcion ?? "")
        : String(error);

/** Guarda y, si el servidor pide confirmación (409), pregunta y repite con el
 * campo de confirmación a true. */
export const conConfirmacion = async <R>(
    guardar: (extra: Record<string, unknown>) => Promise<R>,
    confirmacion: { campo: string; pregunta: string } | undefined,
    confirmar: (mensaje: string) => boolean = (m) => window.confirm(m),
): Promise<R | undefined> => {
    try {
        return await guardar({});
    } catch (error) {
        if (!confirmacion || !esConflicto(error)) throw error;
        const detalle = textoError(error);
        if (!confirmar(`${detalle}\n\n${confirmacion.pregunta}`)) return undefined;
        return await guardar({ [confirmacion.campo]: true });
    }
};
