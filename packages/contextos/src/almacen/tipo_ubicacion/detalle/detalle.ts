import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { tipoUbicacionVacio } from "../dominio.ts";
import { getTipoUbicacion } from "../infraestructura.ts";
import { ContextoDetalleTipoUbicacion, EstadoDetalleTipoUbicacion } from "./maquina.ts";

type ProcesarDetalle = ProcesarContexto<EstadoDetalleTipoUbicacion, ContextoDetalleTipoUbicacion>;

export const contextoDetalleTipoUbicacionInicial: ContextoDetalleTipoUbicacion = {
    estado: "INICIAL",
    tipoUbicacion: tipoUbicacionVacio(),
};

export const refrescarTipoUbicacion: ProcesarDetalle = async (contexto) => {
    const tipoUbicacion = await getTipoUbicacion(contexto.tipoUbicacion.id);
    return [
        { ...contexto, tipoUbicacion },
        [["tipo_ubicacion_cambiado", tipoUbicacion]],
    ];
};

export const cargarContexto: ProcesarDetalle = async (contexto, payload) => {
    const id = payload as string;
    if (!id) {
        return { ...contexto, estado: "INICIAL", tipoUbicacion: tipoUbicacionVacio() };
    }
    const tipoUbicacion = await getTipoUbicacion(id);
    return { ...contexto, estado: "ABIERTO", tipoUbicacion };
};
