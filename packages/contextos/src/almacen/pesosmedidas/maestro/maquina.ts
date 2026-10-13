import { Maquina } from "@olula/lib/diseño.ts";
import { ContextoMaestroUnidadMedida, EstadoMaestroUnidadMedida } from "./diseño.ts";
import { UnidadesMedida, recargarUnidadesMedida } from "./dominio.ts";

export const getMaquina: () => Maquina<EstadoMaestroUnidadMedida, ContextoMaestroUnidadMedida> = () => ({
    INICIAL: {
        unidad_cambiada: UnidadesMedida.cambiar,
        unidad_seleccionada: [UnidadesMedida.activar],
        seleccion_cancelada: UnidadesMedida.desactivar,
        unidad_borrada: async (contexto) => {
            if (!contexto.unidades.activo) return contexto;
            return UnidadesMedida.quitar(contexto, contexto.unidades.activo);
        },
        unidad_creada: UnidadesMedida.incluir,
        recarga_solicitada: recargarUnidadesMedida,
        criteria_cambiado: [UnidadesMedida.filtrar, recargarUnidadesMedida],
        crear: "CREANDO",
    },
    CREANDO: {
        unidad_creada: [UnidadesMedida.incluir, "INICIAL"],
        creacion_cancelada: "INICIAL",
    },
});
