import { EtiquetaEstado } from "#/comun/componentes/etiqueta_estado/EtiquetaEstado.tsx";
import { ImprimirEtiquetasLote } from "#/almacen/lote/etiqueta/ImprimirEtiquetasLote.tsx";
import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { MouseEvent, useCallback, useEffect, useReducer, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router";
import { SelectorCentroCoste } from "../../centro_coste/SelectorCentroCoste.tsx";
import { formatearCantidad } from "../../orden/dominio.ts";
import { etiquetaEstadoTarea, textoInicialFinal } from "../../tarea/dominio.ts";
import { ConsumosTramo } from "../consumos/ConsumosTramo.tsx";
import { ConfigTerminal, TareaTerminal, TramoTerminal } from "../diseño.ts";
import {
    accionTerminal,
    atajoOperario,
    atajoTarea,
    cantidadPendienteTarea,
    CLAVE_CENTRO_PUESTO,
    estadoTerminalInicial,
    formatearCodigoTarea,
    motivoOperarioNoValido,
    nombreEtiquetaTarea,
    preguntarEtiqueta,
    textoError,
    transicionTerminal,
} from "../dominio.ts";
import {
    getConfigTerminal,
    getEtiquetaTarea,
    getTareaTerminal,
    getTrabajadorPorCodigo,
    postDeshacerTarea,
    postIniciarTarea,
} from "../infraestructura.ts";
import { LectorCodigo } from "../lector/LectorCodigo.tsx";
import { ListaTareasTerminal } from "../lista/ListaTareasTerminal.tsx";
import { TramosTarea } from "../tramos/TramosTarea.tsx";
import "./TerminalProduccion.css";

const CLAVE_MANTENER = "olula.produccion.terminal.mantener_operario";
const CLAVE_LISTA = "olula.produccion.terminal.lista";

// El almacenamiento del navegador puede no estar disponible (modo privado, bloqueado): se ignora.
const leerLocal = (clave: string): string | null => {
    try {
        return window.localStorage.getItem(clave);
    } catch {
        return null;
    }
};
const guardarLocal = (clave: string, valor: string) => {
    try {
        if (valor) window.localStorage.setItem(clave, valor);
        else window.localStorage.removeItem(clave);
    } catch {
        // Sin almacenamiento: no se recuerda.
    }
};

/** Mientras no se lee la configuración, la de Eneboo sin plugin. */
const CONFIG_DEFECTO: ConfigTerminal = {
    usarTramos: false, mostrarFormulario: false, controlTiempo: false, decimales: 2, maximoTramo: null, permiteDeshacer: true,
};

/**
 * Producción > Terminal de planta (F7, `pr_masterterminal` de produccion4): a pantalla completa,
 * para lector de código de barras (campo siempre enfocado + Enter) y teclado numérico. Se lee
 * el operario, luego la tarea; según su estado se inicia o se abre la pantalla de consumos para
 * declarar un tramo (pausar o terminar). Panel de tramos de la tarea, deshacer la última tarea
 * procesada y lista lateral de tareas del centro del puesto.
 */
export const TerminalProduccion = () => {
    const navegar = useNavigate();
    const [estado, enviar] = useReducer(transicionTerminal, undefined, () =>
        estadoTerminalInicial(leerLocal(CLAVE_MANTENER) === "true"));
    const [config, setConfig] = useState<ConfigTerminal>(CONFIG_DEFECTO);
    const [codigoOperario, setCodigoOperario] = useState("");
    const [codigoTarea, setCodigoTarea] = useState("");
    const [ocupado, setOcupado] = useState(false);
    const [version, setVersion] = useState(0);
    const [centro, setCentro] = useState(() => leerLocal(CLAVE_CENTRO_PUESTO) ?? "");
    const [conLista, setConLista] = useState(() => leerLocal(CLAVE_LISTA) !== "false");
    const [verPuesto, setVerPuesto] = useState(false);
    const [deshaciendo, setDeshaciendo] = useState(false);
    /** Tarea final recién declarada de la que se ofrece imprimir la etiqueta del lote. */
    const [etiqueta, setEtiqueta] = useState<{ id: string; loteId: string } | null>(null);
    const refOperario = useRef<HTMLInputElement>(null);
    const refTarea = useRef<HTMLInputElement>(null);
    const refRaiz = useRef<HTMLDivElement>(null);

    useEffect(() => {
        getConfigTerminal()
            .then(setConfig)
            .catch((e) => enviar({ tipo: "error", texto: `No se puede leer la configuración del Terminal. ${textoError(e)}` }));
    }, []);

    const enfocar = useCallback(() => {
        setTimeout(() => {
            if (estado.paso === "operario") refOperario.current?.focus();
            else if (estado.paso === "tarea") refTarea.current?.focus();
        }, 0);
    }, [estado.paso]);

    // Foco de vuelta al lector tras cada cambio de paso o mensaje.
    useEffect(() => {
        if (!ocupado && !deshaciendo && !etiqueta) enfocar();
    }, [estado.paso, estado.mensaje, estado.tarea?.id, ocupado, deshaciendo, etiqueta, enfocar]);

    const recargar = () => setVersion((v) => v + 1);
    const error = (texto: string) => enviar({ tipo: "error", texto });

    const limpiar = () => {
        setCodigoOperario("");
        setCodigoTarea("");
        enviar({ tipo: "limpiar" });
    };

    const leerOperario = async (texto: string) => {
        const codigo = texto.trim();
        if (!codigo) return;
        setOcupado(true);
        try {
            const t = await getTrabajadorPorCodigo(codigo);
            const motivo = motivoOperarioNoValido(t);
            if (motivo) error(motivo);
            else enviar({ tipo: "operario_leido", codigo: t.codigo || codigo, nombre: t.nombre });
        } catch (e) {
            error(textoError(e));
        } finally {
            setCodigoOperario("");
            setOcupado(false);
        }
    };

    const ejecutar = async (tarea: TareaTerminal) => {
        const accion = accionTerminal(tarea, config);
        if (accion.tipo === "ninguna") return error(accion.motivo);
        if (accion.tipo === "consumos") return enviar({ tipo: "abrir_consumos", modo: { tipo: "declarar" } });
        if (!estado.operario) return;
        setOcupado(true);
        try {
            await postIniciarTarea(tarea.id, estado.operario.codigo);
            const despues = await getTareaTerminal(tarea.id).catch(() => null);
            const terminada = despues?.estado === "TERMINADA";
            const texto = terminada ? "iniciada y terminada" : tarea.estado === "EN PAUSA" ? "reanudada" : "iniciada";
            enviar({ tipo: "procesada", tarea: { id: tarea.id, descripcion: tarea.descripcion }, texto: `Tarea ${tarea.id} ${texto}` });
            if (preguntarEtiqueta(tarea, terminada ? "terminada_en_un_paso" : "iniciada")) {
                setEtiqueta({ id: tarea.id, loteId: tarea.loteId });
            }
            setCodigoTarea("");
            recargar();
        } catch (e) {
            error(textoError(e));
        } finally {
            setOcupado(false);
        }
    };

    const leerTarea = async (texto: string) => {
        const codigo = formatearCodigoTarea(texto);
        // Enter sin código o con la misma tarea: su acción.
        if (estado.tarea && (codigo === "" || codigo === estado.tarea.id)) {
            setCodigoTarea("");
            return ejecutar(estado.tarea);
        }
        if (!codigo) return;
        if (!estado.operario) return error("Lea primero el código del operario");
        setOcupado(true);
        try {
            const tarea = await getTareaTerminal(codigo);
            enviar({ tipo: "tarea_leida", tarea });
            const accion = accionTerminal(tarea, config);
            if (accion.tipo === "ninguna") enviar({ tipo: "aviso", texto: accion.motivo });
        } catch (e) {
            error((e as { estado?: number }).estado === 404 ? `La tarea ${codigo} no existe` : textoError(e));
        } finally {
            setCodigoTarea("");
            setOcupado(false);
        }
    };

    const elegirDeLista = (id: string) => {
        if (!estado.operario) return error("Lea primero el código del operario");
        void leerTarea(id);
    };

    const recargarTarea = async () => {
        if (!estado.tarea) return;
        try {
            enviar({ tipo: "tarea_recargada", tarea: await getTareaTerminal(estado.tarea.id) });
        } catch {
            // Se queda la que había.
        }
    };

    const trasConsumos = (envio: "pausar" | "terminar" | "guardar", cantidad: number) => {
        const tarea = estado.tarea;
        if (!tarea) return;
        const c = formatearCantidad(cantidad);
        recargar();
        if (envio === "guardar") {
            enviar({ tipo: "exito", texto: `Tramo de la tarea ${tarea.id} cambiado: ${c}` });
            void recargarTarea();
            return;
        }
        const texto = envio === "terminar"
            ? `Tarea ${tarea.id} terminada (${config.usarTramos ? "tramo de " : ""}${c})`
            : `Tramo de ${c} declarado. Tarea ${tarea.id} en pausa`;
        enviar({ tipo: "procesada", tarea: { id: tarea.id, descripcion: tarea.descripcion }, texto });
        if (preguntarEtiqueta(tarea, envio)) setEtiqueta({ id: tarea.id, loteId: tarea.loteId });
    };

    const editarTramo = (tramo: TramoTerminal) => enviar({ tipo: "abrir_consumos", modo: { tipo: "editar", tramo } });

    const deshacer = async () => {
        const ultima = estado.ultima;
        setDeshaciendo(false);
        if (!ultima) return;
        setOcupado(true);
        try {
            await postDeshacerTarea(ultima.id);
            enviar({ tipo: "deshecha", texto: `Tarea ${ultima.id} deshecha` });
            recargar();
        } catch (e) {
            error(textoError(e));
        } finally {
            setOcupado(false);
        }
    };

    const cambiarMantener = (valor: boolean) => {
        guardarLocal(CLAVE_MANTENER, valor ? "true" : "");
        enviar({ tipo: "mantener_operario", valor });
    };

    const cambiarCentro = (valor: string) => {
        setCentro(valor);
        guardarLocal(CLAVE_CENTRO_PUESTO, valor);
    };

    const alternarLista = () => {
        setConLista((v) => {
            guardarLocal(CLAVE_LISTA, v ? "false" : "true");
            return !v;
        });
    };

    const pantallaCompleta = () => {
        try {
            if (document.fullscreenElement) void document.exitFullscreen();
            else void refRaiz.current?.requestFullscreen();
        } catch {
            // El navegador no lo permite.
        }
    };

    // Pulsar en una zona vacía devuelve el foco al lector.
    const pulsarFondo = (e: MouseEvent) => {
        const t = e.target as HTMLElement;
        if (!t.closest("input, button, select, textarea, label, a, dialog")) enfocar();
    };

    const tarea = estado.tarea;
    const accion = tarea ? accionTerminal(tarea, config) : null;

    // En el `body` y no dentro de la plantilla: su contenedor limita los `position: fixed`.
    return createPortal(
        <div className="TerminalProduccion" ref={refRaiz} onClick={pulsarFondo}>
            <header className="barra-terminal">
                <h1>Terminal de producción</h1>
                <span className="puesto">{centro ? `Puesto: ${centro}` : "Todos los centros"}</span>
                <span className="modo">{config.usarTramos ? "Con tramos" : "Sin tramos"}</span>
                <div className="botones-barra">
                    {config.permiteDeshacer && estado.ultima && (
                        <button type="button" className="boton-terminal aviso" disabled={ocupado || estado.paso === "consumos"} onClick={() => setDeshaciendo(true)}>
                            Deshacer {estado.ultima.id}
                        </button>
                    )}
                    <button type="button" className="boton-terminal secundario" aria-pressed={conLista} onClick={alternarLista}>Tareas</button>
                    <button type="button" className="boton-terminal secundario" aria-pressed={verPuesto} onClick={() => setVerPuesto((v) => !v)}>Puesto</button>
                    <button type="button" className="boton-terminal secundario" onClick={pantallaCompleta}>Pantalla completa</button>
                    <button type="button" className="boton-terminal secundario" onClick={() => navegar("/")}>Salir</button>
                </div>
            </header>

            {verPuesto && (
                <div className="puesto-terminal">
                    <SelectorCentroCoste
                        label="Centro de coste del puesto"
                        nombre="centroPuesto"
                        valor={centro}
                        onChange={(opcion) => cambiarCentro(opcion?.valor ?? "")}
                    />
                    <span className="nota-consumos">Filtra la lista de tareas. Se recuerda en este navegador.</span>
                </div>
            )}

            {estado.mensaje && (
                <div className={`mensaje-terminal ${estado.mensaje.tipo}`} role={estado.mensaje.tipo === "error" ? "alert" : "status"}>
                    <span>{estado.mensaje.texto}</span>
                    <button type="button" className="cerrar-mensaje" aria-label="Cerrar el mensaje" onClick={() => enviar({ tipo: "limpiar_mensaje" })}>×</button>
                </div>
            )}

            <div className={`cuerpo-terminal${conLista ? " con-lista" : ""}`}>
                <main className="principal-terminal">
                    {estado.paso === "consumos" && tarea && estado.operario && estado.modo ? (
                        <ConsumosTramo
                            tarea={tarea}
                            config={config}
                            operario={estado.operario.codigo}
                            modo={estado.modo}
                            onHecho={trasConsumos}
                            onError={error}
                            onCancelar={() => enviar({ tipo: "cerrar_consumos" })}
                        />
                    ) : (
                        <>
                            <div className="lectores">
                                <div className="paso-operario">
                                    {estado.operario ? (
                                        <div className="operario-leido">
                                            <span className="etiqueta-paso">Operario</span>
                                            <strong data-operario={estado.operario.codigo}>{estado.operario.codigo} - {estado.operario.nombre}</strong>
                                            <button type="button" className="boton-terminal secundario pequeno" onClick={limpiar}>Cambiar</button>
                                        </div>
                                    ) : (
                                        <LectorCodigo
                                            nombre="operario"
                                            etiqueta="Operario"
                                            marcador="Lea su código de operario"
                                            inputRef={refOperario}
                                            valor={codigoOperario}
                                            deshabilitado={ocupado}
                                            onChange={setCodigoOperario}
                                            onLeer={leerOperario}
                                            atajo={(_, tecla) => atajoOperario(tecla)}
                                            onLimpiar={limpiar}
                                        />
                                    )}
                                    <label className="mantener">
                                        <input
                                            type="checkbox"
                                            className="casilla-terminal"
                                            checked={estado.mantenerOperario}
                                            onChange={(e) => cambiarMantener(e.target.checked)}
                                        />
                                        Mantener operario
                                    </label>
                                </div>
                                {estado.operario && (
                                    <LectorCodigo
                                        nombre="tarea"
                                        etiqueta="Tarea"
                                        marcador={tarea ? `Enter: ${accion?.tipo === "ninguna" ? "—" : accion?.texto} · otra tarea: léala` : "Lea el código de la tarea (TA…)"}
                                        inputRef={refTarea}
                                        valor={codigoTarea}
                                        deshabilitado={ocupado}
                                        onChange={setCodigoTarea}
                                        onLeer={leerTarea}
                                        atajo={atajoTarea}
                                        onLimpiar={limpiar}
                                    />
                                )}
                                <p className="nota-consumos atajos">
                                    Atajos: <kbd>/</kbd> limpia operario y tarea · <kbd>*</kbd> escribe «TA» · <kbd>.</kbd> rellena con ceros · <kbd>Enter</kbd> con la tarea leída hace su acción
                                </p>
                            </div>

                            {tarea && (
                                <article className="tarjeta-tarea" data-tarea={tarea.id}>
                                    <header>
                                        <span className="codigo-tarea">{tarea.id}</span>
                                        <EtiquetaEstado {...etiquetaEstadoTarea(tarea.estado)} />
                                        <span className="descripcion-tarea">
                                            {tarea.descripcion || tarea.codigo}
                                            {textoInicialFinal(tarea) ? ` · ${textoInicialFinal(tarea)}` : ""}
                                            {tarea.terminaEnUnPaso ? " · Un paso" : ""}
                                        </span>
                                    </header>
                                    <dl>
                                        <div><dt>Orden</dt><dd>{tarea.ordenId}</dd></div>
                                        <div><dt>Lote</dt><dd>{tarea.loteId}</dd></div>
                                        <div className="ancho"><dt>Artículo</dt><dd>{tarea.articuloId} {tarea.articulo}</dd></div>
                                        <div><dt>Prevista</dt><dd>{formatearCantidad(tarea.cantidad)}</dd></div>
                                        <div><dt>Hecha</dt><dd>{formatearCantidad(tarea.cantidadHecha)}</dd></div>
                                        <div><dt>Pendiente</dt><dd>{formatearCantidad(cantidadPendienteTarea(tarea))}</dd></div>
                                        {tarea.realizadaPor && <div className="ancho"><dt>Realizada por</dt><dd>{tarea.realizadaPor} {tarea.trabajador}</dd></div>}
                                    </dl>
                                    {accion && accion.tipo !== "ninguna" && (
                                        <button
                                            type="button"
                                            className="boton-terminal principal enorme"
                                            disabled={ocupado}
                                            onClick={() => ejecutar(tarea)}
                                        >
                                            {accion.texto}
                                        </button>
                                    )}
                                </article>
                            )}

                            {tarea && config.usarTramos && tarea.estado !== "PTE" && tarea.estado !== "OFF" && (
                                <TramosTarea
                                    tarea={tarea}
                                    version={version}
                                    onEditar={editarTramo}
                                    onBorrado={(texto) => {
                                        enviar({ tipo: "exito", texto });
                                        recargar();
                                        void recargarTarea();
                                    }}
                                    onError={error}
                                />
                            )}
                        </>
                    )}
                </main>
                {conLista && (
                    <ListaTareasTerminal centroId={centro} version={version} actual={tarea?.id ?? null} onElegir={elegirDeLista} />
                )}
            </div>

            {etiqueta && (
                <ImprimirEtiquetasLote
                    titulo="¿Imprimir etiqueta?"
                    mensaje={`Etiqueta del lote ${etiqueta.loteId || "de la orden"} (tarea ${etiqueta.id}).`}
                    ayudaCantidad="Cantidad vacía: lo declarado en la tarea."
                    nombreFichero={nombreEtiquetaTarea(etiqueta.id)}
                    cargar={(opciones) => getEtiquetaTarea(etiqueta.id, opciones)}
                    cerrar={() => setEtiqueta(null)}
                    labelCancelar="No"
                />
            )}

            {deshaciendo && estado.ultima && (
                <QModalConfirmacion
                    nombre="deshacerTareaTerminal"
                    abierto={true}
                    titulo={`Deshacer ${estado.ultima.id}`}
                    mensaje={`¿Deshacer la última tarea procesada (${estado.ultima.id}${estado.ultima.descripcion ? ` - ${estado.ultima.descripcion}` : ""})? Una tarea terminada vuelve a En curso; una iniciada o en pausa, a Pendiente, y se borran sus tramos y consumos declarados.`}
                    labelAceptar="Deshacer"
                    onCerrar={() => setDeshaciendo(false)}
                    onAceptar={deshacer}
                />
            )}
        </div>,
        document.body,
    );
};
