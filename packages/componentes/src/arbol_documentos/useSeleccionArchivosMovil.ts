import { useEsMovil } from "@olula/componentes/maestro/useEsMovil.ts";
import { useCallback, useRef } from "react";

/**
 * En móvil no hay arrastrar y soltar: al pulsar "Añadir" hay que abrir directamente
 * el selector de archivos del sistema. El .click() debe lanzarse de forma síncrona
 * dentro del propio gesto de pulsación (no en un efecto tras el remontado del modal),
 * o algunos navegadores móviles (notablemente iOS Safari) lo ignoran por haber
 * perdido la activación de usuario.
 *
 * En escritorio se mantiene el flujo actual: se abre el modal con QGestorDocumentos
 * (arrastrar y soltar / seleccionar archivos) sin archivos preseleccionados.
 */
export function useSeleccionArchivosMovil(
    carpetaPadreId: string | null,
    onAnadirDocumento: (carpetaPadreId: string | null, archivosIniciales?: File[]) => void
) {
    const esMovil = useEsMovil();
    const inputRef = useRef<HTMLInputElement>(null);

    const handleClick = useCallback(() => {
        if (esMovil) {
            inputRef.current?.click();
        } else {
            onAnadirDocumento(carpetaPadreId);
        }
    }, [esMovil, carpetaPadreId, onAnadirDocumento]);

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const archivos = e.target.files ? Array.from(e.target.files) : [];
            if (archivos.length > 0) {
                onAnadirDocumento(carpetaPadreId, archivos);
            }
            if (inputRef.current) {
                inputRef.current.value = "";
            }
        },
        [carpetaPadreId, onAnadirDocumento]
    );

    return { esMovil, inputRef, handleClick, handleChange };
}
