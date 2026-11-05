import { QEtiqueta } from "@olula/componentes/atomos/qetiqueta.tsx";
import { QIcono } from "@olula/componentes/atomos/qicono.tsx";
import { MetaTabla } from "@olula/componentes/index.js";
import { formatearMoneda } from "@olula/lib/dominio.js";
import { MovimientoBancario } from "../diseño.js";
import {
    cuentaMovimientoBancario,
    esIngresoMovimientoBancario,
    etiquetaEstadoConConciliaciones,
    reciboAsociadoMovimientoBancario,
    varianteEstadoMovimientoBancario,
} from "../dominio.js";

/**
 * Los `id` son nombres de campo del API: al pulsar una cabecera se ordena por
 * ese campo, y el backend solo acepta los de MovimientoBancarioApi.
 *
 * Los renders van como funciones anónimas dentro del array (en vez de
 * componentes con nombre propio) para no disparar el aviso de
 * react-refresh/only-export-components en este fichero.
 */
export const metaTablaMovimientoBancario: MetaTabla<MovimientoBancario> = [
    { id: "fecha", cabecera: "Fecha", tipo: "fecha" },
    { id: "concepto", cabecera: "Concepto" },
    {
        id: "importe",
        cabecera: "Importe",
        tipo: "moneda",
        render: (movimiento) => (
            <span className={esIngresoMovimientoBancario(movimiento) ? "importe-ingreso" : "importe-cargo"}>
                {formatearMoneda(movimiento.importe, movimiento.divisa ?? "EUR")}
            </span>
        ),
    },
    {
        id: "saldo_tras",
        cabecera: "Saldo",
        tipo: "moneda",
        render: (movimiento) =>
            movimiento.saldo !== null ? (
                <span className={movimiento.saldo < 0 ? "importe-cargo" : undefined}>
                    {formatearMoneda(movimiento.saldo, movimiento.divisa ?? "EUR")}
                </span>
            ) : (
                "—"
            ),
    },
    {
        id: "estado",
        cabecera: "Estado",
        render: (movimiento) => (
            <div className="celda-estado-movimiento-bancario">
                <QEtiqueta variante={varianteEstadoMovimientoBancario(movimiento.estado)}>
                    {etiquetaEstadoConConciliaciones(movimiento)}
                </QEtiqueta>
                {movimiento.requiereRevision && (
                    <QEtiqueta variante="advertencia">Revisar</QEtiqueta>
                )}
                {movimiento.pendiente && (
                    <QIcono
                        nombre="relojarena"
                        tamaño="xs"
                        color="var(--color-advertencia-oscuro)"
                    />
                )}
            </div>
        ),
    },
    {
        id: "num_items_conciliacion",
        cabecera: "Conciliación",
        render: reciboAsociadoMovimientoBancario,
    },
    { id: "contraparte", cabecera: "Contraparte", render: (m) => m.contraparte ?? "—" },
    { id: "nombre_cuenta", cabecera: "Cuenta", render: cuentaMovimientoBancario },
];
