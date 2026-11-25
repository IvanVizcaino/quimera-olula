import { EtiquetaEstado } from "#/comun/componentes/etiqueta_estado/EtiquetaEstado.tsx";
import { QTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { MetaTabla } from "@olula/componentes/index.js";
import { useEffect, useState } from "react";
import { fechaDdMmAaaa } from "../../comun/dominio.ts";
import { MovimientoProduccion } from "../../movimiento/diseño.ts";
import { etiquetaEstadoMovimiento, ordenarMovimientos, textoTareaMovimiento, textoTipoMovimiento } from "../../movimiento/dominio.ts";
import { getMovimientosOrden } from "../../movimiento/infraestructura.ts";
import { OrdenProduccion } from "../diseño.ts";
import { formatearCantidad } from "../dominio.ts";

const columnas = (orden: OrdenProduccion): MetaTabla<MovimientoProduccion> => [
    { id: "tipo", cabecera: "Tipo", render: (m) => textoTipoMovimiento(m.tipo) },
    { id: "articulo", cabecera: "Artículo", estilo: "destacado", render: (m) => m.articulo ? `${m.articuloId} - ${m.articulo}` : m.articuloId },
    { id: "cantidad", cabecera: "Cantidad", render: (m) => formatearCantidad(m.cantidad) },
    { id: "estado", cabecera: "Estado", render: (m) => <EtiquetaEstado {...etiquetaEstadoMovimiento(m.estado)} /> },
    { id: "lote", cabecera: "Lote", render: (m) => m.loteId },
    { id: "loteProducido", cabecera: "Lote producido", render: (m) => m.loteProducidoId },
    { id: "tarea", cabecera: "Tarea", render: (m) => textoTareaMovimiento(m, orden.tareas) },
    { id: "fechaPrevista", cabecera: "Prevista", render: (m) => fechaDdMmAaaa(m.fechaPrevista) },
    { id: "fechaReal", cabecera: "Real", render: (m) => fechaDdMmAaaa(m.fechaReal) },
];

/**
 * Entradas y consumos de stock de los procesos de la orden. Se leen de nuevo cada vez que se
 * recarga la orden (tras lanzar, operar una tarea, terminar o sacar el proceso).
 */
export const MovimientosOrden = ({ orden }: { orden: OrdenProduccion }) => {
    const [movimientos, setMovimientos] = useState<MovimientoProduccion[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let vigente = true;
        setError(null);
        getMovimientosOrden(orden.id)
            .then((m) => vigente && setMovimientos(ordenarMovimientos(m)))
            .catch(() => vigente && setError("No se han podido leer los movimientos de la orden."));
        return () => {
            vigente = false;
        };
    }, [orden]);

    if (error) return <p className="nota-orden">{error}</p>;
    if (movimientos === null) return <p className="nota-orden">Cargando movimientos…</p>;
    if (movimientos.length === 0)
        return <p className="nota-orden">La orden no tiene movimientos de stock: se crean al lanzarla.</p>;
    return (
        <>
            <p className="nota-orden">
                Los consumos pasan a Hecho al terminar su tarea y la entrada del producto, al terminar el proceso.
            </p>
            <QTabla<MovimientoProduccion> metaTabla={columnas(orden)} datos={movimientos} cargando={false} orden={[]} />
        </>
    );
};
