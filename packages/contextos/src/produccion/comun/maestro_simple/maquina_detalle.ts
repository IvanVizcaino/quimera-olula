import { Entidad, Maquina, ProcesarContexto } from "@olula/lib/diseño.ts";
import { publicar } from "@olula/lib/dominio.ts";

export type EstadoDetalleSimple = "INICIAL" | "ABIERTO" | "BORRANDO";

export type ContextoDetalleSimple<T extends Entidad> = {
    estado: EstadoDetalleSimple;
    entidad: T;
};

/** Máquina común del detalle de los maestros sencillos de producción. */
export const getMaquinaDetalleSimple = <T extends Entidad>(getUno: (id: string) => Promise<T>, vacia: () => T) => {
    type Ctx = ContextoDetalleSimple<T>;
    type Procesar = ProcesarContexto<EstadoDetalleSimple, Ctx>;

    const cargar: Procesar = async (contexto, payload) => {
        const id = payload as string;
        if (!id) return { ...contexto, estado: "INICIAL", entidad: vacia() };
        return { ...contexto, estado: "ABIERTO", entidad: await getUno(id) };
    };

    const refrescar: Procesar = async (contexto) => {
        const entidad = await getUno(contexto.entidad.id);
        return [{ ...contexto, entidad }, [["entidad_cambiada", entidad]]];
    };

    return (): Maquina<EstadoDetalleSimple, Ctx> => ({
        INICIAL: {
            id_cambiado: [cargar],
            entidad_deseleccionada: [publicar("entidad_deseleccionada", null)],
        },
        ABIERTO: {
            id_cambiado: [cargar],
            entidad_guardada: [refrescar],
            borrado_solicitado: "BORRANDO",
            entidad_deseleccionada: [publicar("entidad_deseleccionada", null)],
        },
        BORRANDO: {
            entidad_borrada: [publicar("entidad_borrada", null), "INICIAL"],
            borrado_cancelado: "ABIERTO",
        },
    });
};
