import { QTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { MetaTabla } from "@olula/componentes/index.js";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { fechaDdMmAaaa } from "../../comun/dominio.ts";
import { formatearCantidad } from "../../orden/dominio.ts";
import { EntradasSalidasLote, MovimientoLote } from "../diseño.ts";
import { cantidadConSigno, textoDocumentoMovimiento, textoErrorLectura, textoTercero, textoTipoMovimientoLote } from "../dominio.ts";
import { getEntradasSalidasLote } from "../infraestructura.ts";
import { urlOrdenProduccion } from "./urls.ts";
import "./Trazabilidad.css";

const metaTabla: MetaTabla<MovimientoLote> = [
    { id: "fecha", cabecera: "Fecha", ancho: "11%", render: (m) => fechaDdMmAaaa(m.fecha) },
    { id: "tipo", cabecera: "Tipo", ancho: "16%", render: (m) => textoTipoMovimientoLote(m.tipo) },
    { id: "documento", cabecera: "Documento", estilo: "destacado", render: (m) => textoDocumentoMovimiento(m) },
    { id: "tercero", cabecera: "Proveedor / cliente", render: (m) => textoTercero(m) },
    { id: "almacenId", cabecera: "Almacén", ancho: "8%" },
    {
        id: "cantidad",
        cabecera: "Cantidad",
        ancho: "11%",
        render: (m) => <span className={m.cantidad < 0 ? "cantidad-salida" : "cantidad-entrada"}>{cantidadConSigno(m.cantidad)}</span>,
    },
];

/** Resumen del lote (los datos que devuelve la trazabilidad) para la pantalla de trazabilidad. */
export const ResumenLoteTrazado = ({ datos }: { datos: EntradasSalidasLote }) => (
    <dl className="resumen-lote-trazado">
        <div><dt>Artículo</dt><dd>{datos.articulo ? `${datos.articuloId} - ${datos.articulo}` : datos.articuloId || "—"}</dd></div>
        <div><dt>Caducidad</dt><dd>{fechaDdMmAaaa(datos.caducidad) || "—"}</dd></div>
        <div>
            <dt>Orden de producción</dt>
            <dd>{datos.ordenId ? <Link to={urlOrdenProduccion(datos.ordenId)}>{datos.ordenId}</Link> : "—"}</dd>
        </div>
        <div><dt>Fecha de fabricación</dt><dd>{fechaDdMmAaaa(datos.fechaFabricacion) || "—"}</dd></div>
        <div><dt>Cliente</dt><dd>{datos.clienteId || "—"}</dd></div>
    </dl>
);

/**
 * Entradas y salidas del lote (movimientos hechos): compras, ventas, producción, transferencias y
 * otros, con su documento y su tercero, y los totales. `alCargar` recibe los datos (la pantalla
 * de trazabilidad los usa para el resumen del lote).
 */
export const MovimientosLote = ({
    loteId,
    alCargar,
}: {
    loteId: string;
    alCargar?: (datos: EntradasSalidasLote | null) => void;
}) => {
    const [datos, setDatos] = useState<EntradasSalidasLote | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let vigente = true;
        setDatos(null);
        setError(null);
        getEntradasSalidasLote(loteId)
            .then((d) => {
                if (!vigente) return;
                setDatos(d);
                alCargar?.(d);
            })
            .catch((e) => {
                if (!vigente) return;
                setError(textoErrorLectura(e, "No se han podido leer las entradas y salidas del lote."));
                alCargar?.(null);
            });
        return () => {
            vigente = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loteId]);

    if (error) return <p className="nota-trazabilidad">{error}</p>;
    if (datos === null) return <p className="nota-trazabilidad">Cargando movimientos…</p>;

    return (
        <div className="MovimientosLote">
            <dl className="totales-lote">
                <div><dt>Entradas</dt><dd>{formatearCantidad(datos.entradas)}</dd></div>
                <div><dt>Salidas</dt><dd>{formatearCantidad(datos.salidas)}</dd></div>
                <div><dt>Saldo</dt><dd>{formatearCantidad(datos.saldo)}</dd></div>
            </dl>
            {datos.movimientos.length === 0
                ? <p className="nota-trazabilidad">El lote no tiene movimientos hechos.</p>
                : <QTabla<MovimientoLote> metaTabla={metaTabla} datos={datos.movimientos} cargando={false} orden={[]} />}
        </div>
    );
};
