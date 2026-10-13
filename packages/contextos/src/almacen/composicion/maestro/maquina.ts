import { Maquina } from "@olula/lib/diseño.ts";
import { ContextoMaestroComposicion, EstadoMaestroComposicion } from "./diseño.ts";
import { Composiciones, recargarComposiciones } from "./dominio.ts";

export const getMaquina: () => Maquina<EstadoMaestroComposicion, ContextoMaestroComposicion> = () => ({
    INICIAL: {
        composicion_cambiada: Composiciones.cambiar,
        composicion_seleccionada: [Composiciones.activar],
        seleccion_cancelada: Composiciones.desactivar,
        composicion_borrada: async (contexto) => {
            if (!contexto.composiciones.activo) return contexto;
            return Composiciones.quitar(contexto, contexto.composiciones.activo);
        },
        recarga_solicitada: recargarComposiciones,
        criteria_cambiado: [Composiciones.filtrar, recargarComposiciones],
        crear: "CREANDO",
    },
    CREANDO: {
        composicion_creada: [Composiciones.incluir, "INICIAL"],
        creacion_cancelada: "INICIAL",
    },
});
