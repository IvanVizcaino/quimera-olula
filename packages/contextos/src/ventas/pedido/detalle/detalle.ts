import { cambioClienteVentaVacio, clienteVentaVacio, metaCambioClienteVenta, metaLineaVenta, metaNuevaLineaVenta, metaVenta, nuevaLineaVentaVacia, ventaVacia } from "#/ventas/venta/dominio.ts";
import { ProcesarContexto } from "@olula/lib/diseño.js";
import { ejecutarListaProcesos, MetaModelo, modeloEsEditable, modeloEsValido, publicar } from "@olula/lib/dominio.ts";
import {
    CambioClientePedido,
    LineaPedido,
    NuevaLineaPedido,
    Pedido
} from "../diseño.ts";
import {
    getLineas,
    getPedido,
    patchCambiarCliente,
    patchCambiarDescuento,
    patchCantidadLinea,
    patchPedido
} from "../infraestructura.ts";
import { ContextoPedido, EstadoPedido } from "./diseño.ts";


export const pedidoVacio = (): Pedido => ({
    ...ventaVacia,
    cliente: clienteVentaVacio,
    servido: 'No',
    lineas: [],
})



export const cambioClientePedidoVacio: CambioClientePedido = cambioClienteVentaVacio;

export const nuevaLineaPedidoVacia: NuevaLineaPedido = nuevaLineaVentaVacia;



export const metaCambioClientePedido: MetaModelo<CambioClientePedido> = metaCambioClienteVenta;

export const metaPedido: MetaModelo<Pedido> = {
    campos: {
        ...metaVenta.campos,
        fecha: { tipo: "fecha", requerido: false },
    },
    editable: (pedido: Pedido, _?: string) => {
        const servido = pedido.servido?.toUpperCase();
        return servido !== 'TOTAL' && servido !== 'SERVIDO';
    },
};

export const getMetaPedido = <T extends Pedido>() => <MetaModelo<T>>({
    campos: {
        ...metaVenta.campos,
        fecha: { tipo: "fecha", requerido: false },
    },
    editable: (pedido: T, _?: string) => {
        const servido = pedido.servido?.toUpperCase();
        return servido !== 'TOTAL' && servido !== 'SERVIDO';
    },
});

export const editable = modeloEsEditable<Pedido>(metaPedido);
export const pedidoValido = modeloEsValido<Pedido>(metaPedido);

export const metaLineaPedido: MetaModelo<LineaPedido> = metaLineaVenta;

export const metaNuevaLineaPedido: MetaModelo<NuevaLineaPedido> = metaNuevaLineaVenta;

export const pedidoVacioObjeto: Pedido = pedidoVacio();

export const pedidoVacioContexto = (): Pedido => ({ ...pedidoVacioObjeto });


type ProcesarPedido = ProcesarContexto<EstadoPedido, ContextoPedido<Pedido>>;

const pipePedido = ejecutarListaProcesos<EstadoPedido, ContextoPedido<Pedido>>;

const cargarPedido: (_: string) => ProcesarPedido = (idPedido) =>
    async (contexto) => {
        const pedido = await getPedido(idPedido);
        return {
            ...contexto,
            pedido,
        }
    }

export const refrescarPedido: ProcesarPedido = async (contexto) => {
    const pedido = await getPedido(contexto.pedido.id);
    return [
        {
            ...contexto,
            pedido: {
                ...contexto.pedido,
                ...pedido
            },
        },
        [["pedido_cambiado", pedido]]
    ]
}

export const cancelarCambioPedido: ProcesarPedido = async (contexto) => {
    return {
        ...contexto,
        pedido: contexto.pedidoInicial
    }
}

export const abiertoOServido: ProcesarPedido = async (contexto) => {
    const servido = contexto.pedido.servido?.toUpperCase();
    const esServido = servido === 'SI' || servido === 'SERVIDO';
    return {
        ...contexto,
        estado: esServido ? "SERVIDO" : "ABIERTO"
    }
}

export const refrescarLineas: ProcesarPedido = async (contexto) => {
    const lineas = await getLineas(contexto.pedido.id);
    return {
        ...contexto,
        pedido: {
            ...contexto.pedido,
            lineas: lineas as LineaPedido[]
        }
    }
}

export const activarLinea: ProcesarPedido = async (contexto, payload) => {
    const lineaActiva = payload as LineaPedido;
    return {
        ...contexto,
        lineaActiva
    }
}

const actualizarLineaActiva: ProcesarPedido = async (contexto) => {
    if (!contexto.lineaActiva) return contexto;
    const lineaActiva = (contexto.pedido.lineas as LineaPedido[]).find(
        l => l.id === contexto.lineaActiva?.id
    ) ?? contexto.lineaActiva;
    return { ...contexto, lineaActiva };
}

const activarLineaPorIndice = (indice: number) => async (contexto: ContextoPedido<Pedido>) => {
    const lineas = contexto.pedido.lineas as LineaPedido[];
    const lineaActiva = lineas.length > 0
        ? indice >= 0 && indice < lineas.length
            ? lineas[indice]
            : lineas[lineas.length - 1]
        : null

    return {
        ...contexto,
        lineaActiva
    }
}

export const getContextoVacio: ProcesarPedido = async (contexto) => {
    return {
        ...contexto,
        estado: 'INICIAL',
        pedido: pedidoVacioContexto(),
        lineaActiva: null
    }
}

export const cargarContexto: ProcesarPedido = async (contexto, payload) => {
    const idPedido = payload as string;
    if (idPedido) {
        return pipePedido(
            contexto,
            [
                cargarPedido(idPedido),
                refrescarLineas,
                abiertoOServido,
                activarLineaPorIndice(0),
            ],
            payload
        );
    } else {
        return getContextoVacio(contexto);
    }
}

export const cambiarPedido: ProcesarPedido = async (contexto, payload) => {
    const pedido = payload as Pedido;
    await patchPedido(contexto.pedido.id, pedido);

    return pipePedido(contexto, [
        refrescarPedido,
        refrescarLineas,
        'ABIERTO',
    ]);
}

export const borrarPedido: ProcesarPedido = async (contexto) => {
    return pipePedido(contexto, [
        publicar('pedido_borrado', (ctx) => ctx.pedido),
        getContextoVacio
    ]);
}

export const cambiarCliente: ProcesarPedido = async (contexto, payload) => {
    const cambio = payload as CambioClientePedido;
    await patchCambiarCliente(contexto.pedido.id, cambio);

    return pipePedido(contexto, [
        refrescarPedido,
        refrescarLineas,
        'ABIERTO',
    ]);
}

export const cambiarDescuento: ProcesarPedido = async (contexto, payload) => {
    const { dto_porcentual } = payload as { dto_porcentual: number };
    await patchCambiarDescuento(contexto.pedido.id, dto_porcentual);

    return pipePedido(contexto, [
        refrescarPedido,
        refrescarLineas,
        'ABIERTO',
    ]);
}

export const crearLinea: ProcesarPedido = async (contexto) => {
    return pipePedido(contexto, [
        refrescarPedido,
        refrescarLineas,
        'ABIERTO',
    ]);
}

export const cambiarLinea: ProcesarPedido = async (contexto) => {
    return pipePedido(contexto, [
        refrescarPedido,
        refrescarLineas,
        actualizarLineaActiva,
        'ABIERTO',
    ]);
}

export const cambiarCantidadLinea: ProcesarPedido = async (contexto, payload) => {
    const { lineaId, cantidad } = payload as { lineaId: string, cantidad: number };

    const linea = (contexto.pedido.lineas as LineaPedido[]).find((l: LineaPedido) => l.id === lineaId);
    if (!linea) return contexto;

    await patchCantidadLinea(contexto.pedido.id, linea, cantidad);

    const lineasActualizadas = await getLineas(contexto.pedido.id);
    const pedidoActualizado = await getPedido(contexto.pedido.id);

    return {
        estado: "ABIERTO" as EstadoPedido,
        pedido: {
            ...pedidoActualizado,
            lineas: lineasActualizadas
        },
        pedidoInicial: contexto.pedidoInicial,
        lineaActiva: lineasActualizadas.find(l => l.id === lineaId) || null,
    };
}

export const borrarLinea: ProcesarPedido = async (contexto, payload) => {
    const idLinea = payload as string;
    const indiceLineaActiva = (contexto.pedido.lineas as LineaPedido[]).findIndex((l: LineaPedido) => l.id === idLinea);

    return pipePedido(contexto, [
        refrescarPedido,
        refrescarLineas,
        activarLineaPorIndice(indiceLineaActiva),
        'ABIERTO',
    ]);
}
