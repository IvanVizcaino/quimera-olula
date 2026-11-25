import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { useEffect, useMemo, useRef, useState } from "react";
import { cantidadDesdeTexto, formatearCantidad } from "../../orden/dominio.ts";
import { ConfigTerminal, ConsumosTarea, LineaConsumo, TareaTerminal } from "../diseño.ts";
import {
    anadirLoteLeido,
    cantidadPropuestaTramo,
    consumoLinea,
    cuerpoDeclarar,
    cuerpoEditarTramo,
    lineaBajoMinimo,
    lineasDeTramo,
    lineasIniciales,
    ModoConsumos,
    motivoCantidadTramo,
    previstoTramo,
    textoCantidad,
    textoError,
    validarConsumos,
} from "../dominio.ts";
import { getConsumosTarea, getLoteTerminal, patchTramo, postDeclarar } from "../infraestructura.ts";
import { LectorCodigo } from "../lector/LectorCodigo.tsx";

type Envio = "pausar" | "terminar" | "guardar";

/**
 * Pantalla de consumos de un tramo (`pr4_selectlotetarea`): la cantidad a fabricar, los
 * componentes con lo previsto del tramo, los lotes leídos de los que van por lotes y la
 * cantidad de los demás, y «cerrar» la línea. Pausar declara el tramo (la tarea queda en
 * pausa), Terminar lo declara y termina la tarea, y en edición se guarda el tramo.
 */
export const ConsumosTramo = ({
    tarea,
    config,
    operario,
    modo,
    onHecho,
    onError,
    onCancelar,
}: {
    tarea: TareaTerminal;
    config: ConfigTerminal;
    operario: string;
    modo: ModoConsumos;
    onHecho: (envio: Envio, cantidad: number) => void;
    onError: (texto: string) => void;
    onCancelar: () => void;
}) => {
    const [consumos, setConsumos] = useState<ConsumosTarea | null>(null);
    const [cantidad, setCantidad] = useState("");
    const [lineas, setLineas] = useState<LineaConsumo[]>([]);
    const [codigoLote, setCodigoLote] = useState("");
    const [confirmando, setConfirmando] = useState<Envio | null>(null);
    const [enviando, setEnviando] = useState(false);
    const refCantidad = useRef<HTMLInputElement>(null);
    const refLote = useRef<HTMLInputElement>(null);
    const editando = modo.tipo === "editar" ? modo.tramo : null;

    useEffect(() => {
        let vigente = true;
        getConsumosTarea(tarea.id, operario)
            .then((c) => {
                if (!vigente) return;
                setConsumos(c);
                if (editando) {
                    setCantidad(textoCantidad(editando.cantidad));
                    setLineas(lineasDeTramo(c.componentes, editando));
                } else {
                    setCantidad(cantidadPropuestaTramo(c.cantidadPendiente, config));
                    setLineas(lineasIniciales(c.componentes));
                }
            })
            .catch((e) => vigente && onError(textoError(e)));
        return () => {
            vigente = false;
        };
        // Se carga una vez por tarea y tramo.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tarea.id, editando?.id]);

    // Con los consumos cargados, el foco a la cantidad a fabricar (seleccionada para teclear encima).
    const cargados = consumos !== null;
    useEffect(() => {
        if (!cargados) return;
        refCantidad.current?.focus();
        refCantidad.current?.select();
    }, [cargados]);

    const numero = cantidadDesdeTexto(cantidad);
    const motivoCantidad = cantidad === "" ? null : motivoCantidadTramo(cantidad, config);
    const validacion = useMemo(() => validarConsumos(cantidad, lineas, config), [cantidad, lineas, config]);
    const conLotes = lineas.some((l) => l.componente.porLotes);

    const cambiarLinea = (indice: number, cambio: (l: LineaConsumo) => LineaConsumo) =>
        setLineas((ls) => ls.map((l, i) => (i === indice ? cambio(l) : l)));

    const leerLote = async (codigo: string) => {
        const cod = codigo.trim().toUpperCase();
        if (!cod) return;
        try {
            const lote = await getLoteTerminal(cod, tarea.id);
            const resultado = anadirLoteLeido(lineas, lote, numero);
            if (!resultado.ok) onError(resultado.motivo);
            else setLineas(resultado.lineas);
        } catch (e) {
            onError((e as { estado?: number }).estado === 404 ? `El lote ${cod} no existe` : textoError(e));
        }
        setCodigoLote("");
        refLote.current?.focus();
    };

    const pedir = (envio: Envio) => {
        if (validacion.errores.length) {
            onError(validacion.errores.join("\n"));
            return;
        }
        if (envio === "terminar" || validacion.bajoMinimo.length) setConfirmando(envio);
        else void enviar(envio);
    };

    const enviar = async (envio: Envio) => {
        setConfirmando(null);
        setEnviando(true);
        try {
            if (editando) await patchTramo(tarea.id, editando.id, cuerpoEditarTramo(cantidad, lineas, operario));
            else await postDeclarar(tarea.id, cuerpoDeclarar(cantidad, lineas, operario, envio === "terminar"));
            onHecho(envio, numero ?? 0);
        } catch (e) {
            onError(textoError(e));
        } finally {
            setEnviando(false);
        }
    };

    if (!consumos) return <div className="ConsumosTramo cargando">Cargando consumos de {tarea.id}…</div>;

    const avisoMinimo = validacion.bajoMinimo.length
        ? `Por debajo del mínimo sin cerrar (el servidor lo rechazará):\n${validacion.bajoMinimo.join("\n")}`
        : "";

    return (
        <section className="ConsumosTramo" aria-label="Consumos del tramo">
            <header className="cabecera-consumos">
                <h2>
                    {editando ? `Editar tramo de ${tarea.id}` : config.usarTramos ? `Declarar tramo de ${tarea.id}` : `Declarar y terminar ${tarea.id}`}
                </h2>
                <div className="datos-consumos">
                    <span>Orden <strong>{consumos.ordenId}</strong></span>
                    <span>Lote <strong>{consumos.loteId}</strong></span>
                    <span>Artículo <strong>{consumos.articuloId}</strong> {consumos.articulo}</span>
                    <span>Prevista <strong>{formatearCantidad(consumos.cantidadPrevista)}</strong></span>
                    <span>Hecha <strong>{formatearCantidad(consumos.cantidadHecha)}</strong></span>
                    <span>Pendiente <strong>{formatearCantidad(consumos.cantidadPendiente)}</strong></span>
                </div>
            </header>

            <div className="fila-cantidad">
                <label htmlFor="cantidad-tramo">Cantidad a fabricar{config.usarTramos ? " en este tramo" : ""}</label>
                <input
                    id="cantidad-tramo"
                    ref={refCantidad}
                    className="campo-lector cantidad"
                    inputMode="decimal"
                    autoComplete="off"
                    value={cantidad}
                    aria-invalid={!!motivoCantidad}
                    onChange={(e) => setCantidad(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key !== "Enter") return;
                        e.preventDefault();
                        if (conLotes) refLote.current?.focus();
                    }}
                />
                <span className="nota-consumos">
                    {config.decimales} decimales
                    {config.maximoTramo !== null ? ` · máximo ${formatearCantidad(config.maximoTramo)}` : ""}
                </span>
                {motivoCantidad && <span className="error-campo" role="alert">{motivoCantidad}</span>}
            </div>

            {conLotes && (
                <LectorCodigo
                    nombre="lote"
                    etiqueta="Lote de componente"
                    marcador="Lea el código del lote"
                    inputRef={refLote}
                    valor={codigoLote}
                    onChange={setCodigoLote}
                    onLeer={leerLote}
                />
            )}

            <div className="tabla-desplazable">
            <table className="tabla-consumos">
                <thead>
                    <tr>
                        <th>Componente</th>
                        <th className="numero">Por unidad</th>
                        <th className="numero">Previsto tramo</th>
                        <th className="numero">Consumido</th>
                        <th className="numero">Pendiente lote</th>
                        <th>En este tramo</th>
                        <th>Cerrar</th>
                    </tr>
                </thead>
                <tbody>
                    {lineas.map((linea, i) => {
                        const c = linea.componente;
                        const bajo = lineaBajoMinimo(linea, numero);
                        return (
                            <tr key={c.componenteId} data-componente={c.componenteId} className={bajo ? "bajo-minimo" : undefined}>
                                <td>
                                    <strong>{c.articuloId}</strong> {c.descripcion}
                                    {c.porLotes && <span className="marca-lotes">por lotes</span>}
                                </td>
                                <td className="numero">{formatearCantidad(c.cantidadUnidad)}</td>
                                <td className="numero">{formatearCantidad(previstoTramo(numero, c))}</td>
                                <td className="numero">{formatearCantidad(c.consumido)}</td>
                                <td className="numero">{formatearCantidad(c.pendiente)}</td>
                                <td>
                                    {c.porLotes ? (
                                        <div className="lotes-linea">
                                            {linea.lotes.length === 0 && <span className="nota-consumos">Sin lotes leídos</span>}
                                            {linea.lotes.map((lote, j) => (
                                                <div className="lote-leido" key={lote.loteId} data-lote={lote.loteId}>
                                                    <span>{lote.loteId}</span>
                                                    <input
                                                        className="cantidad-linea"
                                                        inputMode="decimal"
                                                        aria-label={`Cantidad del lote ${lote.loteId}`}
                                                        value={lote.cantidad}
                                                        onChange={(e) => cambiarLinea(i, (l) => ({
                                                            ...l,
                                                            lotes: l.lotes.map((x, k) => (k === j ? { ...x, cantidad: e.target.value } : x)),
                                                        }))}
                                                    />
                                                    <button
                                                        type="button"
                                                        className="boton-terminal peligro pequeno"
                                                        aria-label={`Quitar el lote ${lote.loteId}`}
                                                        onClick={() => cambiarLinea(i, (l) => ({ ...l, lotes: l.lotes.filter((_, k) => k !== j) }))}
                                                    >
                                                        Quitar
                                                    </button>
                                                </div>
                                            ))}
                                            {linea.lotes.length > 1 && (
                                                <span className="nota-consumos">Total {formatearCantidad(consumoLinea(linea, numero))}</span>
                                            )}
                                        </div>
                                    ) : (
                                        <input
                                            className="cantidad-linea"
                                            inputMode="decimal"
                                            aria-label={`Consumo de ${c.articuloId}`}
                                            value={linea.cantidad ?? textoCantidad(previstoTramo(numero, c))}
                                            onChange={(e) => cambiarLinea(i, (l) => ({ ...l, cantidad: e.target.value }))}
                                        />
                                    )}
                                    {bajo && <div className="aviso-minimo">Por debajo del {formatearCantidad(c.minimo)} %</div>}
                                </td>
                                <td>
                                    {c.puedeCerrar ? (
                                        <input
                                            type="checkbox"
                                            className="casilla-terminal"
                                            aria-label={`Cerrar ${c.articuloId}`}
                                            checked={linea.cerrado}
                                            onChange={(e) => cambiarLinea(i, (l) => ({ ...l, cerrado: e.target.checked }))}
                                        />
                                    ) : (
                                        <span className="nota-consumos" title="El operario no puede cerrar esta línea">—</span>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                    {lineas.length === 0 && (
                        <tr>
                            <td colSpan={7} className="nota-consumos">Esta tarea no consume componentes</td>
                        </tr>
                    )}
                </tbody>
            </table>
            </div>

            {avisoMinimo && <div className="aviso-minimo bloque" role="status">{avisoMinimo}</div>}

            <div className="botones-consumos">
                <button type="button" className="boton-terminal secundario" disabled={enviando} onClick={onCancelar}>
                    Cancelar
                </button>
                {editando ? (
                    <button type="button" className="boton-terminal principal" disabled={enviando} onClick={() => pedir("guardar")}>
                        Guardar tramo
                    </button>
                ) : (
                    <>
                        {config.usarTramos && (
                            <button type="button" className="boton-terminal aviso" disabled={enviando} onClick={() => pedir("pausar")}>
                                Pausar
                            </button>
                        )}
                        <button type="button" className="boton-terminal principal" disabled={enviando} onClick={() => pedir("terminar")}>
                            Terminar
                        </button>
                    </>
                )}
            </div>

            {confirmando && (
                <QModalConfirmacion
                    nombre="confirmarConsumosTerminal"
                    abierto={true}
                    titulo={confirmando === "terminar" ? "Terminar la tarea" : "Consumos por debajo del mínimo"}
                    mensaje={[
                        confirmando === "terminar" ? "¿Desea terminar la tarea?" : "",
                        avisoMinimo,
                    ].filter(Boolean).join("\n\n")}
                    labelAceptar={confirmando === "terminar" ? "Terminar" : "Enviar igualmente"}
                    labelCancelar={confirmando === "terminar" ? "No" : "Revisar"}
                    onCerrar={() => setConfirmando(null)}
                    onAceptar={() => enviar(confirmando)}
                />
            )}
        </section>
    );
};
