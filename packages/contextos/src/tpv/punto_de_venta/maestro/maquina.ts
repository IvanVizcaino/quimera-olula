import { Maquina } from "@olula/lib/diseño.ts";
import { ContextoMaestroPuntoVentaTpv, EstadoMaestroPuntoVentaTpv } from "./diseño.ts";
import { Puntos, recargarPuntos } from "./dominio.ts";

export const getMaquina: () => Maquina<EstadoMaestroPuntoVentaTpv, ContextoMaestroPuntoVentaTpv> = () => ({
    INICIAL: {
        punto_cambiado: Puntos.cambiar,
        punto_seleccionado: [Puntos.activar],
        seleccion_cancelada: Puntos.desactivar,
        punto_borrado: async (contexto) => {
            if (!contexto.puntos.activo) return contexto;
            return Puntos.quitar(contexto, contexto.puntos.activo);
        },
        punto_creado: Puntos.incluir,
        recarga_solicitada: recargarPuntos,
        criteria_cambiado: [Puntos.filtrar, recargarPuntos],
        crear: "CREANDO",
    },
    CREANDO: {
        punto_creado: [Puntos.incluir, "INICIAL"],
        creacion_cancelada: "INICIAL",
    },
});
