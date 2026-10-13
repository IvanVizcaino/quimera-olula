import { Maquina } from "@olula/lib/diseño.ts";
import { ContextoMaestroSubfamilia, EstadoMaestroSubfamilia } from "./diseño.ts";
import { Subfamilias, recargarSubfamilias } from "./dominio.ts";

export const getMaquina: () => Maquina<EstadoMaestroSubfamilia, ContextoMaestroSubfamilia> = () => ({
    INICIAL: {
        subfamilia_cambiada: Subfamilias.cambiar,
        subfamilia_seleccionada: [Subfamilias.activar],
        seleccion_cancelada: Subfamilias.desactivar,
        subfamilia_borrada: async (contexto) => {
            if (!contexto.subfamilias.activo) return contexto;
            return Subfamilias.quitar(contexto, contexto.subfamilias.activo);
        },
        subfamilia_creada: Subfamilias.incluir,
        recarga_solicitada: recargarSubfamilias,
        criteria_cambiado: [Subfamilias.filtrar, recargarSubfamilias],
        crear: "CREANDO",
    },
    CREANDO: {
        subfamilia_creada: [Subfamilias.incluir, "INICIAL"],
        creacion_cancelada: "INICIAL",
    },
});
