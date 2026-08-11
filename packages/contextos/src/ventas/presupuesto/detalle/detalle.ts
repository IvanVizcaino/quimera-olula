import { LineaVenta } from "#/ventas/venta/diseño.ts";
import { clienteVentaVacio, ventaVacia } from "#/ventas/venta/dominio.ts";
import { ProcesarContexto } from "@olula/lib/diseño.js";
import { ejecutarListaProcesos, MetaModelo, modeloEsEditable, publicar } from "@olula/lib/dominio.ts";
import { CambioClientePresupuesto, LineaPresupuesto, Presupuesto } from "../diseño.ts";
import {
    aprobarPresupuesto as aprobarPresupuestoFuncion,
    getLineas,
    getPresupuesto,
    patchCambiarCliente,
    patchCambiarDescuento,
    patchCambiarDivisa,
    patchCantidadLinea,
    patchPresupuesto
} from "../infraestructura.ts";
import { ContextoPresupuesto, EstadoPresupuesto } from "./diseño.ts";

export { metaNuevaVenta, metaVenta } from "#/ventas/venta/dominio.ts";

export const metaLineaVenta: MetaModelo<LineaVenta> = {
    campos: {
        cantidad: { tipo: "decimal", requerido: true, decimales: 2 },
        pvp_unitario: { tipo: "moneda", requerido: true },
        dto_porcentual: { tipo: "decimal", requerido: false, decimales: 2, positivo: true, maximo: 100 },
        referencia: { requerido: true },
    }
};

export const metaPresupuesto: MetaModelo<Presupuesto> = {
    campos: {
        fecha: { tipo: "fecha", requerido: false },
        fecha_salida: { tipo: "fecha", requerido: false },
        tasa_conversion: { tipo: "numero", requerido: true },
        total_divisa_empresa: { tipo: "numero", bloqueado: true },
        codigo: { bloqueado: true },
        divisa_id: { requerido: true },
    },
    editable: (presupuesto: Presupuesto) => !presupuesto.aprobado,
};

export const editable = modeloEsEditable<Presupuesto>(metaPresupuesto);


export const presupuestoVacio = (): Presupuesto => ({
    ...ventaVacia,
    cliente: clienteVentaVacio,
    aprobado: false,
    fecha_salida: new Date(),
    lineas: [],
})

const presupuestoVacioObjeto: Presupuesto = presupuestoVacio();

export const presupuestoVacioContexto = (): Presupuesto => ({ ...presupuestoVacioObjeto });



type ProcesarPresupuesto = ProcesarContexto<EstadoPresupuesto, ContextoPresupuesto>;

const pipePresupuesto = ejecutarListaProcesos<EstadoPresupuesto, ContextoPresupuesto>;

const cargarPresupuesto: (_: string) => ProcesarPresupuesto = (idPresupuesto) =>
    async (contexto) => {
        const presupuesto = await getPresupuesto(idPresupuesto);
        return {
            ...contexto,
            presupuesto,
        }
    }

export const refrescarPresupuesto: ProcesarPresupuesto = async (contexto) => {
    const presupuesto = await getPresupuesto(contexto.presupuesto.id);
    return [
        {
            ...contexto,
            presupuesto: {
                ...contexto.presupuesto,
                ...presupuesto
            },
        },
        [["presupuesto_cambiado", presupuesto]]
    ]
}

export const cancelarCambioPresupuesto: ProcesarPresupuesto = async (contexto) => {
    return {
        ...contexto,
        presupuesto: contexto.presupuestoInicial
    }
}

export const abiertoOAprobadoContexto: ProcesarPresupuesto = async (contexto) => {
    return {
        ...contexto,
        estado: contexto.presupuesto.aprobado ? "APROBADO" : "ABIERTO"
    }
}

export const refrescarLineas: ProcesarPresupuesto = async (contexto) => {
    const lineas = await getLineas(contexto.presupuesto.id);
    return {
        ...contexto,
        presupuesto: {
            ...contexto.presupuesto,
            lineas: lineas as LineaPresupuesto[]
        }
    }
}

export const activarLinea: ProcesarPresupuesto = async (contexto, payload) => {
    const lineaActiva = payload as LineaPresupuesto;
    return {
        ...contexto,
        lineaActiva
    }
}

const activarLineaPorIndice = (indice: number) => async (contexto: ContextoPresupuesto) => {
    const lineas = contexto.presupuesto.lineas as LineaPresupuesto[];
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

const activarLineaPorId = (id: string) => async (contexto: ContextoPresupuesto) => {
    const lineas = contexto.presupuesto.lineas as LineaPresupuesto[];
    const lineaActiva = lineas.find((l: LineaPresupuesto) => l.id === id) ?? null;

    return {
        ...contexto,
        lineaActiva
    }
}

export const getContextoVacio: ProcesarPresupuesto = async (contexto) => {
    return {
        ...contexto,
        estado: 'INICIAL',
        presupuesto: presupuestoVacioContexto(),
        lineaActiva: null
    }
}

export const cargarContexto: ProcesarPresupuesto = async (contexto, payload) => {
    const idPresupuesto = payload as string;
    if (idPresupuesto) {
        return pipePresupuesto(
            contexto,
            [
                cargarPresupuesto(idPresupuesto),
                refrescarLineas,
                abiertoOAprobadoContexto,
                activarLineaPorIndice(0),
            ],
            payload
        );
    } else {
        return getContextoVacio(contexto);
    }
}

export const cambiarPresupuesto: ProcesarPresupuesto = async (contexto, payload) => {
    const presupuesto = payload as Presupuesto;
    await patchPresupuesto(contexto.presupuesto.id, presupuesto);

    return pipePresupuesto(contexto, [
        refrescarPresupuesto,
        refrescarLineas,
        'ABIERTO',
    ]);
}

export const borrarPresupuesto: ProcesarPresupuesto = async (contexto) => {
    return pipePresupuesto(contexto, [
        publicar('presupuesto_borrado', (ctx) => ctx.presupuesto.id),
        getContextoVacio
    ]);
}

export const aprobarPresupuesto: ProcesarPresupuesto = async (contexto) => {
    await aprobarPresupuestoFuncion(contexto.presupuesto.id);

    return pipePresupuesto(contexto, [
        refrescarPresupuesto,
        refrescarLineas,
        'APROBADO',
    ]);
}

export const cambiarDivisa: ProcesarPresupuesto = async (contexto, payload) => {
    const divisaId = payload as string;
    await patchCambiarDivisa(contexto.presupuesto.id, divisaId);

    return pipePresupuesto(contexto, [
        refrescarPresupuesto,
        refrescarLineas,
        'ABIERTO',
    ]);
}

export const cambiarCliente: ProcesarPresupuesto = async (contexto, payload) => {
    const cambio = payload as CambioClientePresupuesto;
    await patchCambiarCliente(contexto.presupuesto.id, cambio);

    return pipePresupuesto(contexto, [
        refrescarPresupuesto,
        refrescarLineas,
        'ABIERTO',
    ]);
}

export const cambiarDescuento: ProcesarPresupuesto = async (contexto, payload) => {
    const { dto_porcentual } = payload as { dto_porcentual: number };
    await patchCambiarDescuento(contexto.presupuesto.id, dto_porcentual);

    return pipePresupuesto(contexto, [
        refrescarPresupuesto,
        refrescarLineas,
        'ABIERTO',
    ]);
}

export const crearLinea: ProcesarPresupuesto = async (contexto, payload) => {
    const idLinea = payload as string;

    return pipePresupuesto(contexto, [
        refrescarPresupuesto,
        refrescarLineas,
        activarLineaPorId(idLinea),
        'ABIERTO',
    ]);
}

export const cambiarLinea: ProcesarPresupuesto = async (contexto) => {

    return pipePresupuesto(contexto, [
        refrescarPresupuesto,
        refrescarLineas,
        'ABIERTO',
    ]);
}

export const cambiarCantidadLinea: ProcesarPresupuesto = async (contexto, payload) => {
    const { lineaId, cantidad } = payload as { lineaId: string, cantidad: number };

    const linea = contexto.presupuesto.lineas.find(l => l.id === lineaId);
    if (!linea) return contexto;

    await patchCantidadLinea(contexto.presupuesto.id, linea, cantidad);

    return pipePresupuesto(contexto, [
        refrescarPresupuesto,
        refrescarLineas,
        activarLineaPorId(lineaId),
        'ABIERTO',
    ]);
}

export const borrarLinea: ProcesarPresupuesto = async (contexto, payload) => {
    const idLinea = payload as string;

    const indiceLineaActiva = (contexto.presupuesto.lineas as LineaPresupuesto[]).findIndex((l: LineaPresupuesto) => l.id === idLinea);

    return pipePresupuesto(contexto, [
        refrescarPresupuesto,
        refrescarLineas,
        activarLineaPorIndice(indiceLineaActiva),
        'ABIERTO',
    ]);
}
