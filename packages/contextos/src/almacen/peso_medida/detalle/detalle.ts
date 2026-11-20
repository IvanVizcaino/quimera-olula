import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { pesoMedidaVacio } from "../dominio.ts";
import { getPesoMedida } from "../infraestructura.ts";
import { ContextoDetallePesoMedida, EstadoDetallePesoMedida } from "./maquina.ts";

type ProcesarDetalle = ProcesarContexto<EstadoDetallePesoMedida, ContextoDetallePesoMedida>;

export const contextoDetallePesoMedidaInicial: ContextoDetallePesoMedida = {
    estado: "INICIAL",
    pesoMedida: pesoMedidaVacio(),
};

export const refrescarPesoMedida: ProcesarDetalle = async (contexto) => {
    const pesoMedida = await getPesoMedida(contexto.pesoMedida.id);
    return [
        { ...contexto, pesoMedida },
        [["peso_medida_cambiada", pesoMedida]],
    ];
};

export const cargarContexto: ProcesarDetalle = async (contexto, payload) => {
    const id = payload as string;
    if (!id) {
        return { ...contexto, estado: "INICIAL", pesoMedida: pesoMedidaVacio() };
    }
    const pesoMedida = await getPesoMedida(id);
    return { ...contexto, estado: "ABIERTO", pesoMedida };
};
