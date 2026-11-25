import { Cliente } from "#/ventas/comun/componentes/cliente.tsx";
import { Familia } from "#/almacen/comun/componentes/Familia.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { OpcionArticuloFabricado, SelectorArticuloFabricado } from "../../articulo/SelectorArticuloFabricado.tsx";
import { CampoFecha } from "../../comun/componentes/CampoFecha.tsx";
import { comoBooleano, fechaDdMmAaaa } from "../../comun/dominio.ts";
import { getConfigProduccion } from "../../config/infraestructura.ts";
import { SelectorPedidoCliente } from "../../orden/detalle/SelectorPedidoCliente.tsx";
import { cantidadDesdeTexto, formatearCantidad } from "../../orden/dominio.ts";
import { FilaPropuesta, FiltrosNecesidades, OrdenesGeneradas } from "../diseño.ts";
import {
    erroresSeleccion,
    filasAGenerar,
    filasTrasBuscar,
    filtraPorPedido,
    filtrosNecesidadesIniciales,
    motivoAFabricarNoValido,
    motivoFiltrosNoValidos,
    necesidadManual,
    noLanzables,
    ordenesPropuestas,
    OrdenRejilla,
    ORDENES_REJILLA,
    ordenarFilas,
    seleccionadas,
    TIPOS_FECHA,
} from "../dominio.ts";
import { getNecesidades, postGenerarOrdenes } from "../infraestructura.ts";
import { RejillaNecesidades } from "./RejillaNecesidades.tsx";
import "./GenerarOrdenes.css";

type InfoBusqueda = { total: number; pedidoCompleto: boolean; aFaltas: boolean; almacenId: string };
type LineaManual = { articulo: OpcionArticuloFabricado | null; cantidad: string };

const textoSeGeneraran = (n: number): string =>
    n === 1 ? "Se generará 1 orden" : `Se generarán ${n} órdenes`;

const lineaManualVacia: LineaManual = { articulo: null, cantidad: "" };

/**
 * Producción > Generar órdenes de producción (F6): busca las necesidades (pedidos pendientes,
 * stock bajo mínimo y sus semielaborados), deja elegir filas y cantidades y genera una orden
 * por artículo de golpe, opcionalmente lanzadas. Nada se crea hasta pulsar «Generar».
 */
export const GenerarOrdenes = () => {
    const { intentar } = useContext(ContextoError);
    const [filtros, setFiltros] = useState<FiltrosNecesidades>(() => filtrosNecesidadesIniciales());
    const [info, setInfo] = useState<InfoBusqueda | null>(null);
    const [filas, setFilas] = useState<FilaPropuesta[]>([]);
    const [orden, setOrden] = useState<OrdenRejilla>("busqueda");
    const [buscando, setBuscando] = useState(false);
    const [manual, setManual] = useState<LineaManual>(lineaManualVacia);
    const [numeroManual, setNumeroManual] = useState(1);
    const [fechaFabricacion, setFechaFabricacion] = useState("");
    const [confirmando, setConfirmando] = useState<{ lanzar: boolean } | null>(null);
    const [generadas, setGeneradas] = useState<(OrdenesGeneradas & { lanzar: boolean }) | null>(null);

    // «Cantidad completa del pedido» empieza como la configuración (si no se puede leer, lo decide el servidor).
    useEffect(() => {
        getConfigProduccion()
            .then((c) => setFiltros((f) => (f.pedidoCompleto === null ? { ...f, pedidoCompleto: c.pedidoCompleto } : f)))
            .catch(() => undefined);
    }, []);

    const cambiar = <K extends keyof FiltrosNecesidades>(campo: K, valor: FiltrosNecesidades[K]) =>
        setFiltros((f) => ({ ...f, [campo]: valor }));

    const motivoFiltros = motivoFiltrosNoValidos(filtros);

    const buscar = useCallback(async (anteriores: FilaPropuesta[]) => {
        setBuscando(true);
        try {
            const respuesta = await intentar(() => getNecesidades(filtros));
            setInfo({ total: respuesta.total, pedidoCompleto: respuesta.pedidoCompleto, aFaltas: respuesta.aFaltas, almacenId: respuesta.almacenId });
            setFiltros((f) => (f.pedidoCompleto === null ? { ...f, pedidoCompleto: respuesta.pedidoCompleto } : f));
            setFilas(filasTrasBuscar(anteriores, respuesta.datos));
        } catch {
            // `intentar` ya muestra el error (400: filtros no válidos).
        } finally {
            setBuscando(false);
        }
    }, [filtros, intentar]);

    const crearLinea = () => {
        const cantidad = cantidadDesdeTexto(manual.cantidad);
        if (!manual.articulo || cantidad === null || motivoAFabricarNoValido(manual.cantidad)) return;
        const a = manual.articulo.articulo;
        setFilas((fs) => [...fs, necesidadManual({ id: a.id, descripcion: a.descripcion, tipoProcesoId: a.tipoProcesoId }, cantidad, numeroManual)]);
        setNumeroManual((n) => n + 1);
        setManual(lineaManualVacia);
    };

    const generar = async (lanzar: boolean) => {
        setConfirmando(null);
        try {
            const resultado = await intentar(() => postGenerarOrdenes({ filas: filasAGenerar(filas), lanzar, fechaFabricacion }));
            setGeneradas({ ...resultado, lanzar });
            // Lo generado ya está cubierto: se vuelve a buscar sin selección ni líneas manuales.
            setFilas([]);
            if (info) await buscar([]);
        } catch {
            // 400/409: no se ha creado nada; `intentar` muestra el motivo.
        }
    };

    const propuestas = useMemo(() => ordenesPropuestas(filas), [filas]);
    const errores = useMemo(() => erroresSeleccion(filas), [filas]);
    const sinLanzar = noLanzables(propuestas);
    const filasOrdenadas = useMemo(() => ordenarFilas(filas, orden), [filas, orden]);
    const puedeGenerar = propuestas.length > 0 && errores.length === 0;
    const motivoManual = manual.cantidad ? motivoAFabricarNoValido(manual.cantidad) : null;
    const soloPedidos = filtraPorPedido(filtros);

    return (
        <div className="GenerarOrdenes">
            <h2>Generar órdenes de producción</h2>

            <section className="filtros-generar" aria-label="Filtros de búsqueda">
                <quimera-formulario>
                    <Familia valor={filtros.familiaId} onChange={(o) => cambiar("familiaId", o?.valor ?? "")} />
                    <SelectorArticuloFabricado label="Referencia desde" nombre="referenciaDesde" valor={filtros.referenciaDesde}
                        onChange={(o) => cambiar("referenciaDesde", o?.valor ?? "")} />
                    <SelectorArticuloFabricado label="Referencia hasta" nombre="referenciaHasta" valor={filtros.referenciaHasta}
                        onChange={(o) => cambiar("referenciaHasta", o?.valor ?? "")} />
                    <SelectorPedidoCliente valor={filtros.pedidoId} clienteId={filtros.clienteId || undefined}
                        onChange={(o) => cambiar("pedidoId", o?.valor ?? "")} />
                    <Cliente valor={filtros.clienteId} opcional onChange={(o) => cambiar("clienteId", o?.valor ?? "")} />
                    <QSelect label="Tipo de fecha" nombre="tipoFecha" valor={filtros.tipoFecha} opciones={TIPOS_FECHA}
                        onChange={(o) => cambiar("tipoFecha", (o?.valor ?? "pedido") as FiltrosNecesidades["tipoFecha"])} />
                    <CampoFecha label="Fecha desde" nombre="fechaDesde" valor={filtros.fechaDesde} opcional
                        onChange={(v) => cambiar("fechaDesde", v)} />
                    <CampoFecha label="Fecha hasta" nombre="fechaHasta" valor={filtros.fechaHasta} opcional
                        onChange={(v) => cambiar("fechaHasta", v)} />
                </quimera-formulario>
                <div className="opciones-generar">
                    <QCheckbox label="Buscar en pedidos" nombre="enPedidos" valor={filtros.enPedidos}
                        onChange={(v) => cambiar("enPedidos", comoBooleano(v))} />
                    <QCheckbox label="Cantidad completa del pedido" nombre="pedidoCompleto" valor={!!filtros.pedidoCompleto}
                        onChange={(v) => cambiar("pedidoCompleto", comoBooleano(v))} />
                    <QCheckbox label="Buscar en stock" nombre="enStock" valor={filtros.enStock || filtros.bajoMinimo}
                        deshabilitado={filtros.bajoMinimo} onChange={(v) => cambiar("enStock", comoBooleano(v))} />
                    <QCheckbox label="Bajo mínimo" nombre="bajoMinimo" valor={filtros.bajoMinimo}
                        onChange={(v) => cambiar("bajoMinimo", comoBooleano(v))} />
                    <QCheckbox label="Incluir componentes" nombre="incluirComponentes" valor={filtros.incluirComponentes}
                        onChange={(v) => cambiar("incluirComponentes", comoBooleano(v))} />
                </div>
                {soloPedidos && (filtros.enStock || filtros.bajoMinimo) && (
                    <p className="nota-generar">Con pedido, cliente o fechas solo se busca en pedidos.</p>
                )}
                <div className="maestro-botones">
                    <QBoton onClick={() => buscar(filas)} deshabilitado={!!motivoFiltros || buscando}>
                        {buscando ? "Buscando…" : "Buscar"}
                    </QBoton>
                    {motivoFiltros && <span className="aviso-generar" role="alert">{motivoFiltros}</span>}
                </div>
            </section>

            <section className="necesidades-generar" aria-label="Necesidades">
                <div className="cabecera-necesidades">
                    <h3>Necesidades</h3>
                    {info && (
                        <span className="nota-generar">
                            {info.total} encontradas · {seleccionadas(filas).length} seleccionadas
                            {info.almacenId ? ` · almacén ${info.almacenId}` : ""}
                            {info.pedidoCompleto ? " · cantidad completa del pedido" : " · lo que falta del pedido"}
                        </span>
                    )}
                    <QSelect label="Ordenar por" nombre="ordenRejilla" valor={orden} opciones={ORDENES_REJILLA} condensado
                        onChange={(o) => setOrden((o?.valor ?? "busqueda") as OrdenRejilla)} />
                </div>
                <RejillaNecesidades filas={filasOrdenadas} todas={filas} conAFaltas={!!info?.aFaltas} cambiar={setFilas} />

                <div className="crear-linea" aria-label="Crear línea">
                    <SelectorArticuloFabricado label="Crear línea: artículo" nombre="articuloManual"
                        valor={manual.articulo?.valor ?? ""} descripcion={manual.articulo?.descripcion}
                        onChange={(o) => setManual((m) => ({ ...m, articulo: o }))} />
                    <QInput label="Cantidad" nombre="cantidadManual" valor={manual.cantidad}
                        erroneo={!!motivoManual} textoValidacion={motivoManual ?? ""}
                        onChange={(v) => setManual((m) => ({ ...m, cantidad: v }))} />
                    <QBoton variante="borde" onClick={crearLinea}
                        deshabilitado={!manual.articulo || !manual.cantidad || !!motivoManual}>
                        Crear línea
                    </QBoton>
                </div>
            </section>

            <section className="resumen-generar" aria-label="Resumen">
                <h3>{textoSeGeneraran(propuestas.length)}</h3>
                {propuestas.length > 0 && (
                    <table className="tabla-generar tabla-resumen">
                        <thead>
                            <tr><th>Artículo</th><th className="num">Cantidad</th><th className="num">Filas</th><th>Pedidos</th><th>Lanzable</th></tr>
                        </thead>
                        <tbody>
                            {propuestas.map((o) => (
                                <tr key={o.articuloId} className={o.lanzable ? "" : "no-lanzable"}>
                                    <td>{o.articuloId} - {o.descripcion}</td>
                                    <td className="num">{formatearCantidad(o.cantidad)}</td>
                                    <td className="num">{o.filas}</td>
                                    <td>{o.pedidos.join(", ")}</td>
                                    <td>{o.lanzable ? "Sí" : "No"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                {errores.length > 0 && (
                    <ul className="aviso-generar" role="alert">{errores.map((e) => <li key={e}>{e}</li>)}</ul>
                )}
                <div className="acciones-generar">
                    <CampoFecha label="Fecha de fabricación (vacía: hoy + 20 días)" nombre="fechaFabricacion" valor={fechaFabricacion} opcional
                        onChange={(v) => setFechaFabricacion(v)} />
                    <QBoton deshabilitado={!puedeGenerar} onClick={() => setConfirmando({ lanzar: false })}>Generar</QBoton>
                    <QBoton deshabilitado={!puedeGenerar || sinLanzar.length > 0} onClick={() => setConfirmando({ lanzar: true })}>
                        Generar y lanzar
                    </QBoton>
                </div>
                {sinLanzar.length > 0 && (
                    <p className="nota-generar">
                        No se pueden lanzar ({sinLanzar.join(", ")}): sin tipo de proceso o con el tipo incompleto. Se pueden generar sin lanzar.
                    </p>
                )}
            </section>

            {generadas && (
                <section className="generadas" aria-label="Órdenes generadas">
                    <h3>
                        {generadas.ordenes.length === 1
                            ? `Orden generada${generadas.lanzar ? " y lanzada" : ""}`
                            : `${generadas.ordenes.length} órdenes generadas${generadas.lanzar ? " y lanzadas" : ""}`}
                    </h3>
                    <ul>
                        {generadas.ordenes.map((o) => (
                            <li key={o.id}>
                                <Link to={`/produccion/ordenes?id=${encodeURIComponent(o.id)}`}>{o.id}</Link>
                                {" · "}
                                {o.lotes.map((l) => `${l.articuloId} ${formatearCantidad(l.cantidad)} (lote ${l.id}, fabricación ${fechaDdMmAaaa(l.fechaFabricacion)})`).join("; ")}
                                {o.pedidoId ? ` · pedido ${o.pedidoId}` : ""}
                            </li>
                        ))}
                    </ul>
                    <QBoton variante="texto" onClick={() => setGeneradas(null)}>Cerrar</QBoton>
                </section>
            )}

            {confirmando && (
                <QModalConfirmacion
                    nombre="confirmarGenerarOrdenes"
                    abierto={true}
                    titulo={confirmando.lanzar ? "Generar y lanzar" : "Generar órdenes"}
                    mensaje={`${textoSeGeneraran(propuestas.length)} de producción`
                        + ` (${propuestas.map((o) => `${o.articuloId}: ${formatearCantidad(o.cantidad)}`).join(", ")})`
                        + `${confirmando.lanzar ? (propuestas.length === 1 ? " y se lanzará" : " y se lanzarán") : ""}. ¿Continuar?`}
                    labelAceptar={confirmando.lanzar ? "Generar y lanzar" : "Generar"}
                    onCerrar={() => setConfirmando(null)}
                    onAceptar={() => generar(confirmando.lanzar)}
                />
            )}
        </div>
    );
};
