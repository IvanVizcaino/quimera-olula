import { descargarDocumento } from "@olula/lib/api/documentos.ts";

/** Lo que tarda en liberarse la URL del PDF abierto (la pestaña ya lo ha cargado). */
const VIDA_URL_MS = 60_000;

/**
 * Abre en una pestaña nueva el PDF que devuelve `cargar` (hoja de orden, etiquetas…). La
 * pestaña se abre antes de pedirlo, en el mismo clic, para que el navegador no la bloquee
 * como ventana emergente; si aun así no se puede abrir, se descarga con `nombre`. Con error al
 * pedirlo, la pestaña se cierra y el error sigue su camino (lo enseña `intentar`).
 */
export const abrirPdf = async (cargar: () => Promise<Blob>, nombre: string): Promise<void> => {
    const ventana = window.open("", "_blank");
    let blob: Blob;
    try {
        blob = await cargar();
    } catch (e) {
        ventana?.close();
        throw e;
    }
    if (!ventana) {
        await descargarDocumento(blob, nombre);
        return;
    }
    const url = URL.createObjectURL(blob);
    ventana.location.href = url;
    setTimeout(() => URL.revokeObjectURL(url), VIDA_URL_MS);
};
