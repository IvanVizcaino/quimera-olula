import { EtiquetaEstado } from "#/comun/componentes/etiqueta_estado/EtiquetaEstado.tsx";
import { filtroCliente, filtroFechaDocumento } from "#/ventas/comun/filtros.tsx";
import { MetaTabla } from "@olula/componentes/index.js";
import { filtroFechas, MetaFiltro } from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.js";
import { Criteria } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.ts";
import { fechaDdMmAaaa } from "../../comun/dominio.ts";
import { MaestroSimple } from "../../comun/maestro_simple/MaestroSimple.tsx";
import { CrearOrden } from "../crear/CrearOrden.tsx";
import { DetalleOrden } from "../detalle/DetalleOrden.tsx";
import { OrdenProduccion } from "../diseño.ts";
import { ESTADOS_ORDEN, etiquetaEstadoOrden, formatearCantidad } from "../dominio.ts";
import { getOrden, getOrdenes } from "../infraestructura.ts";
import "./MaestroOrdenProduccion.css";

// Los id de columna son los campos de la API: con ellos se ordena.
const metaTabla: MetaTabla<OrdenProduccion> = [
    { id: "id", cabecera: "Código", estilo: "secundario", prioridad: "alta" },
    { id: "fecha", cabecera: "Fecha", render: (o) => fechaDdMmAaaa(o.fecha), prioridad: "alta" },
    { id: "fecha_entrega", cabecera: "Entrega", render: (o) => fechaDdMmAaaa(o.fechaEntrega) },
    { id: "estado", cabecera: "Estado", render: (o) => <EtiquetaEstado {...etiquetaEstadoOrden(o.estado)} />, prioridad: "alta" },
    { id: "descripcion", cabecera: "Descripción", estilo: "destacado" },
    { id: "cliente", cabecera: "Cliente", render: (o) => o.cliente || o.clienteId },
    { id: "total_lotes", cabecera: "Lotes", render: (o) => formatearCantidad(o.totalLotes), prioridad: "baja" },
    { id: "total_uds", cabecera: "Unidades", render: (o) => formatearCantidad(o.totalUds) },
];

const metaFiltro: MetaFiltro = {
    id: {
        id: "id",
        label: "Código",
        tipo: "texto",
        filtro: (v) => (v ? ["id", "~", v as string] : null),
    },
    descripcion: {
        id: "descripcion",
        label: "Descripción",
        tipo: "texto",
        filtro: (v) => (v ? ["descripcion", "~", v as string] : null),
    },
    estado: {
        id: "estado",
        label: "Estado",
        tipo: "multiseleccion",
        opciones: ESTADOS_ORDEN,
        filtro: (valor) => {
            const elegidos = (valor as string[]) ?? [];
            if (elegidos.length === 0 || elegidos.length === ESTADOS_ORDEN.length) return null;
            return ["estado", "in", elegidos as unknown as string];
        },
    },
    fecha: filtroFechaDocumento,
    fecha_entrega: {
        id: "fecha_entrega",
        label: "Fecha de entrega",
        tipo: "intervalo_fechas",
        filtro: (v) => filtroFechas("fecha_entrega", v),
    },
    cliente_id: filtroCliente,
};

/** Las más recientes primero (el código crece con el contador). */
const criteriaBase: Criteria = { ...criteriaDefecto, orden: ["id", "DESC"] };

const consultas = { getUno: getOrden, getLista: getOrdenes };

/** Producción > Órdenes de producción (`pr_ordenesproduccion` con su lote). */
export const MaestroOrdenProduccion = () => (
    <MaestroSimple<OrdenProduccion>
        clase="MaestroOrdenProduccion"
        titulo="Órdenes de producción"
        textoNuevo="Nueva orden"
        metaTabla={metaTabla}
        metaFiltro={metaFiltro}
        consultas={consultas}
        criteriaBase={criteriaBase}
        tarjeta={(o) => (
            <div key={o.id}>
                <div>{o.id} · {o.descripcion} <EtiquetaEstado {...etiquetaEstadoOrden(o.estado)} /></div>
                <div>{fechaDdMmAaaa(o.fecha)}{o.cliente ? ` · ${o.cliente}` : ""} · {formatearCantidad(o.totalUds)} uds</div>
            </div>
        )}
        crear={(publicar) => <CrearOrden publicar={publicar} />}
        detalle={(id, publicar) => <DetalleOrden id={id} publicar={publicar} />}
    />
);
