import { Maquina } from "@olula/lib/diseño.ts";
import { ContextoMaestroTarjetaPuntos, EstadoMaestroTarjetaPuntos } from "./diseño.ts";
import { Tarjetas, recargarTarjetas } from "./dominio.ts";

export const getMaquina: () => Maquina<EstadoMaestroTarjetaPuntos, ContextoMaestroTarjetaPuntos> = () => ({
    INICIAL: {
        tarjeta_cambiada: Tarjetas.cambiar,
        tarjeta_seleccionada: [Tarjetas.activar],
        seleccion_cancelada: Tarjetas.desactivar,
        tarjeta_creada: Tarjetas.incluir,
        recarga_solicitada: recargarTarjetas,
        criteria_cambiado: [Tarjetas.filtrar, recargarTarjetas],
        crear: "CREANDO",
    },
    CREANDO: {
        tarjeta_creada: [Tarjetas.incluir, "INICIAL"],
        creacion_cancelada: "INICIAL",
    },
});
