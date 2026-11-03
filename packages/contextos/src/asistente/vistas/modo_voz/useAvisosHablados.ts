import { useEffect, useRef } from "react";
import { getTotalComunicacionesNoLeidas } from "@olula/lib/api/notificaciones.ts";
import { onGlobalServerSentEvent } from "@olula/lib/api/server_sent_events_session.ts";
import { plugin, puede } from "@olula/lib/dominio.ts";
import { ESTADOS_COMUNICACION } from "#/comun/comunicacion/diseño.ts";
import { getComunicaciones } from "#/comun/comunicacion/infraestructura.ts";
import { textoAvisoComunicacion } from "#/asistente/dominio.ts";

/** Como mucho un aviso hablado por minuto: si llegan varios, se dice el último. */
const SEPARACION_MINIMA_AVISOS_MS = 60_000;

/**
 * Avisos hablados: mientras el modo voz está activo, cuando llega una comunicación
 * nueva (el mismo evento en tiempo real que actualiza la campana de la cabecera) se
 * lee su asunto — o "ya tengo la respuesta" si es el fin de un turno largo del
 * asistente. `avisar` decide cuándo decirlo (si está ocupado, lo guarda para luego).
 */
export function useAvisosHablados(activo: boolean, avisar: (texto: string) => void): void {
    const avisarRef = useRef(avisar);
    useEffect(() => {
        avisarRef.current = avisar;
    });

    useEffect(() => {
        if (!activo || !puede("comun.comunicacion") || plugin("eventos_sse") !== "activo") return;

        let cancelado = false;
        let ultimoTotal: number | null = null;
        let ultimoAviso = 0;
        let pendiente: ReturnType<typeof setTimeout> | undefined;

        getTotalComunicacionesNoLeidas()
            .then(total => {
                if (!cancelado && ultimoTotal === null) ultimoTotal = total;
            })
            .catch(() => undefined);

        const decirUltima = async () => {
            try {
                const { datos } = await getComunicaciones(
                    [["estado", "=", ESTADOS_COMUNICACION.NO_LEIDA]], ["fecha_envio", "DESC"], { pagina: 1, limite: 1 });
                if (cancelado || !datos.length) return;
                ultimoAviso = Date.now();
                avisarRef.current(textoAvisoComunicacion(datos[0].asunto));
            } catch {
                // Sin poder leerla no se dice nada: la campana sigue avisando.
            }
        };

        const desuscribir = onGlobalServerSentEvent("comun.comunicacion.resumen", evento => {
            let total: number;
            try {
                total = Number((JSON.parse(String(evento.data ?? "{}")) as { total_no_leidas?: unknown }).total_no_leidas);
            } catch {
                return;
            }
            if (!Number.isFinite(total)) return;
            const anterior = ultimoTotal;
            ultimoTotal = total;
            if (anterior === null || total <= anterior) return;

            clearTimeout(pendiente);
            const espera = Math.max(0, ultimoAviso + SEPARACION_MINIMA_AVISOS_MS - Date.now());
            pendiente = setTimeout(() => void decirUltima(), espera);
        });

        return () => {
            cancelado = true;
            clearTimeout(pendiente);
            desuscribir();
        };
    }, [activo]);
}
