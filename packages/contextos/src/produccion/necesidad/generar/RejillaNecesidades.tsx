import { useEffect, useRef } from "react";
import { fechaDdMmAaaa } from "../../comun/dominio.ts";
import { formatearCantidad } from "../../orden/dominio.ts";
import { FilaPropuesta } from "../diseño.ts";
import { ayudaStock, cambiarFila, estadoSeleccion, motivoAFabricarNoValido, ORIGENES, seleccionarTodas } from "../dominio.ts";

const SeleccionarTodo = ({ filas, cambiar }: { filas: FilaPropuesta[]; cambiar: (filas: FilaPropuesta[]) => void }) => {
    const ref = useRef<HTMLInputElement>(null);
    const estado = estadoSeleccion(filas);
    useEffect(() => {
        if (ref.current) ref.current.indeterminate = estado === "algunas";
    }, [estado]);
    return (
        <input
            ref={ref}
            type="checkbox"
            aria-label="Seleccionar todo"
            checked={estado === "todas" && filas.length > 0}
            disabled={filas.length === 0}
            onChange={(e) => cambiar(seleccionarTodas(filas, e.target.checked))}
        />
    );
};

/**
 * Rejilla de necesidades: selección por fila y «seleccionar todo», «A fabricar» editable (coma
 * decimal, 3 decimales) y las filas que no se pueden lanzar marcadas con sus avisos.
 */
export const RejillaNecesidades = ({
    filas,
    todas,
    conAFaltas,
    cambiar,
}: {
    /** Las filas en el orden elegido. */
    filas: FilaPropuesta[];
    /** Las filas en el orden del estado (las que se cambian). */
    todas: FilaPropuesta[];
    conAFaltas: boolean;
    cambiar: (filas: FilaPropuesta[]) => void;
}) => {
    if (filas.length === 0) {
        return <p className="nota-generar sin-necesidades">No hay necesidades. Elige los filtros y pulsa «Buscar», o crea una línea.</p>;
    }
    const cambio = (id: string, c: Partial<Omit<FilaPropuesta, "necesidad">>) => cambiar(cambiarFila(todas, id, c));

    return (
        <div className="contenedor-rejilla">
            <table className="tabla-generar RejillaNecesidades">
                <thead>
                    <tr>
                        <th><SeleccionarTodo filas={todas} cambiar={cambiar} /></th>
                        <th>Origen</th>
                        <th>Pedido</th>
                        <th>Cliente</th>
                        <th>Referencia</th>
                        <th>Artículo</th>
                        <th className="num">Pendiente</th>
                        <th className="num">Existencias</th>
                        {conAFaltas && <th className="num">A faltas</th>}
                        <th className="num">A fabricar</th>
                        <th>F. pedido</th>
                        <th>F. salida</th>
                        <th>Lotes / órdenes abiertas</th>
                        <th>Avisos</th>
                    </tr>
                </thead>
                <tbody>
                    {filas.map(({ necesidad: n, seleccionada, aFabricar }) => {
                        const motivo = seleccionada ? motivoAFabricarNoValido(aFabricar) : null;
                        return (
                            <tr key={n.id} data-id={n.id}
                                className={[seleccionada ? "seleccionada" : "", n.lanzable ? "" : "no-lanzable"].join(" ").trim()}>
                                <td>
                                    <input type="checkbox" aria-label={`Seleccionar ${n.articuloId} ${n.pedidoId}`.trim()} checked={seleccionada}
                                        onChange={(e) => cambio(n.id, { seleccionada: e.target.checked })} />
                                </td>
                                <td title={n.compuestos.length ? `Para ${n.compuestos.join(", ")}` : undefined}>
                                    {ORIGENES[n.origen]}
                                </td>
                                <td>{n.pedidoId}</td>
                                <td>{n.cliente || n.clienteId}</td>
                                <td className="referencia">{n.articuloId}</td>
                                <td>{n.descripcion}</td>
                                <td className="num">
                                    {n.pendiente !== null
                                        ? formatearCantidad(n.pendiente)
                                        : n.cantidadNecesaria !== null ? <span title="Cantidad necesaria para los compuestos">{formatearCantidad(n.cantidadNecesaria)}</span> : ""}
                                </td>
                                <td className="num" title={n.origen === "manual" ? undefined : ayudaStock(n)}>
                                    {n.origen === "manual" ? "" : formatearCantidad(n.existencias)}
                                </td>
                                {conAFaltas && <td className="num">{n.aFaltas === null ? "" : formatearCantidad(n.aFaltas)}</td>}
                                <td className="num">
                                    <input
                                        className="a-fabricar"
                                        inputMode="decimal"
                                        aria-label={`A fabricar ${n.articuloId}`}
                                        aria-invalid={!!motivo}
                                        title={motivo ?? undefined}
                                        value={aFabricar}
                                        onChange={(e) => cambio(n.id, { aFabricar: e.target.value })}
                                    />
                                </td>
                                <td>{fechaDdMmAaaa(n.fechaPedido)}</td>
                                <td>{fechaDdMmAaaa(n.fechaSalida)}</td>
                                <td className="lotes">
                                    {n.lotes.map((l) => `${l.loteId}${l.ordenId ? ` (${l.ordenId})` : ""}: ${formatearCantidad(l.cantidad)}`).join(", ")}
                                    {n.lotes.length > 0 && n.ordenesAbiertas.length > 0 ? " · " : ""}
                                    {n.ordenesAbiertas.length > 0 ? `Abiertas: ${n.ordenesAbiertas.join(", ")}` : ""}
                                </td>
                                <td className="avisos">
                                    {n.avisos.length > 0 && (
                                        <ul>{n.avisos.map((a) => <li key={a}>{a}</li>)}</ul>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};
