import { pitidoError } from "#/almacen/comun/audio.ts";
import { LineaOrdenAlmacen, OrdenAlmacen } from "#/almacen/orden/diseño.ts";
import { registrarLecturaCajaOrden, registrarLecturasOrden } from "#/almacen/orden/infraestructura.ts";
import { definicionDeLinea } from "#/almacen/orden/pasos/catalogo.ts";
import {
    CodigoResuelto,
    ContextoLectura,
    DefinicionPasos,
    DimensionLectura,
    FaseLectura,
    TipoCodigo,
    ValoresLectura,
} from "#/almacen/orden/pasos/diseño.ts";
import {
    aLecturaOrden,
    aLecturaPalet,
    aplicarCodigo,
    buscarLineaParaCodigo,
    cantidadALeer,
    cantidadPendiente,
    definicionParaPalet,
    dimensionesPendientes,
    elegirLote,
    instruccionDimension,
    lineasPendientes,
    sinDestino,
    tiposAceptados,
    tiposAceptadosCabecera,
} from "#/almacen/orden/pasos/lector.ts";
import { resolverCodigo } from "#/almacen/orden/pasos/resolver.ts";
import { buscarLineaEnCajaMultiproducto, contextoPara } from "#/almacen/orden/pasos/servicio.ts";
import { IndicadorVoz } from "@olula/componentes/atomos/indicador_voz.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QEtiqueta } from "@olula/componentes/atomos/qetiqueta.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useFocus } from "@olula/lib/useFocus.js";
import { useFlujoVoz } from "@olula/lib/voz/useFlujoVoz.ts";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import "./LeerPasosOrden.css";

type Mensaje = { exito: boolean; texto: string };

/** Lectura en curso: la línea (null para un palé leído en cabecera), su definición y lo leído. */
type Lectura = { lineaId: string | null; def: DefinicionPasos; valores: ValoresLectura };

const describirCodigo = (c: CodigoResuelto): string => {
    if (c.tipo === "caja") return `Caja ${c.lpn}`;
    if (c.tipo === "ubicacion") return `Ubicación ${c.codigo}`;
    return c.loteId ? `Lote ${c.loteId} de ${c.descripcion}` : `Artículo ${c.descripcion}`;
};

const CampoCodigo = ({ onLeido }: { onLeido: (texto: string) => void }) => {
    const focus = useFocus();
    return <QInput label="Código" nombre="codigo_lectura" valor="" onEnterKeyUp={onLeido} ref={focus} />;
};

const CampoCantidad = ({
    inicial,
    onConfirmar,
}: {
    inicial: number;
    onConfirmar: (cantidad: number) => void;
}) => {
    const focus = useFocus(true);
    const [valor, setValor] = useState(String(inicial));
    const num = parseFloat(valor);
    const valida = !isNaN(num) && num > 0;
    return (
        <>
            <QInput
                label="Cantidad"
                nombre="cantidad_lectura"
                tipo="numero"
                valor={valor}
                onChange={setValor}
                onEnterKeyUp={() => valida && onConfirmar(num)}
                ref={focus}
            />
            <QBoton onClick={() => onConfirmar(num)} deshabilitado={!valida}>Siguiente</QBoton>
        </>
    );
};

type Fila = [string, string | null, string | null];

const Resumen = ({
    orden,
    linea,
    def,
    valores,
    fase,
}: {
    orden: OrdenAlmacen;
    linea: LineaOrdenAlmacen;
    def: DefinicionPasos;
    valores: ValoresLectura;
    fase: FaseLectura;
}) => {
    const pendientes = dimensionesPendientes(def, linea, valores);
    const cantidadLeida = pendientes.includes("cantidad") || (pendientes.includes("que") && def.cantidad !== "LEER")
        ? null
        : def.cantidad === "CAPACIDAD_SUBCAJA"
          ? "Capacidad de la caja"
          : String(cantidadALeer(def, linea, orden, valores, fase));

    const filas: Fila[] = [];
    if (fase === "PICK" && def.origen && def.origen !== "LINEA") {
        const previsto = linea.cajaOrigen ? `Caja ${linea.cajaOrigen}` : linea.ubicacionOrigen;
        const leido = valores.cajaOrigen
            ? `Caja ${valores.cajaOrigen}`
            : valores.idCajaOrigen === null ? `${valores.ubicacionOrigen ?? linea.ubicacionOrigen ?? ""} (suelto)` : null;
        filas.push(["Origen", previsto, leido]);
    }
    filas.push(["Artículo", `${linea.sku} - ${linea.articulo}`, valores.sku ? `${valores.sku} - ${valores.articulo ?? ""}` : (def.que === "LINEA" ? linea.sku : null)]);
    if (linea.porLotes) filas.push(["Lote", linea.loteId, valores.loteId ?? null]);
    filas.push(["Cantidad", `${cantidadPendiente(linea, orden, fase)} pendiente de ${linea.cantidadPrevista}`, cantidadLeida]);
    if (def.destino !== "NINGUNO") {
        const previsto = linea.cajaDestino ? `Caja ${linea.cajaDestino}` : linea.ubicacionDestino;
        const leido = def.destino === "LINEA"
            ? previsto
            : valores.cajaDestino
              ? `Caja ${valores.cajaDestino}`
              : valores.ubicacionDestino ? `${valores.ubicacionDestino} (suelto)` : null;
        filas.push(["Destino", def.destino === "CAJA_ETIQUETA" ? "Caja etiqueta" : previsto, leido]);
    }

    return (
        <table className="resumen-leer-linea">
            <thead>
                <tr><th>Campo</th><th>Previsto</th><th>Leído</th></tr>
            </thead>
            <tbody>
                {filas.map(([campo, previsto, leido]) => (
                    <tr key={campo}>
                        <td className="resumen-leer-linea__campo">{campo}</td>
                        <td>{previsto ?? <span className="q-texto-secundario">--</span>}</td>
                        <td>
                            {leido
                                ? <QEtiqueta variante="exito">{leido}</QEtiqueta>
                                : <QEtiqueta variante="advertencia">Pendiente</QEtiqueta>}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

/**
 * Lector común de pasos de pick y drop. Con `linea` lee esa línea (botones de
 * la línea); sin ella (cabecera) localiza la línea a partir de la primera
 * lectura y, tras registrar, queda listo para la siguiente.
 */
export const LeerPasosOrden = ({
    orden,
    fase,
    linea: lineaFija,
    publicar,
    modoVoz = false,
}: {
    orden: OrdenAlmacen;
    fase: FaseLectura;
    linea?: LineaOrdenAlmacen;
    publicar: EmitirEvento;
    modoVoz?: boolean;
}) => {
    const { intentar } = useContext(ContextoError);
    const flujoVoz = useFlujoVoz();
    const [actual, setActual] = useState<Lectura | null>(null);
    const [serie, setSerie] = useState<Lectura[]>([]);
    const [mensaje, setMensaje] = useState<Mensaje | null>(null);
    const [clave, setClave] = useState(0);
    const ocupado = useRef(false);

    const lineaDe = useCallback(
        (id: string | null): LineaOrdenAlmacen | null =>
            id === null ? null : (orden.lineas.find((l) => l.id === id) ?? (lineaFija?.id === id ? lineaFija : null)),
        [orden, lineaFija],
    );

    // En modo línea la lectura empieza ya con la línea y su definición.
    const defFija = lineaFija ? definicionDeLinea(lineaFija, orden, fase) : null;
    const enCurso: Lectura | null =
        actual ?? (lineaFija && defFija ? { lineaId: lineaFija.id, def: defFija, valores: {} } : null);
    const linea = enCurso ? lineaDe(enCurso.lineaId) : null;
    const def = enCurso?.def ?? null;
    const valores = enCurso?.valores ?? {};
    const pendientes: DimensionLectura[] = def ? dimensionesPendientes(def, linea, valores) : [];
    const dimension: DimensionLectura | null = def ? (pendientes[0] ?? null) : null;

    // Serie de cajas (CAJAS-UBICACION): mientras se espera el destino se puede leer otra caja.
    const admiteOtraCaja = !lineaFija && def?.serie === "QUE" && dimension === "destino";
    const aceptados: TipoCodigo[] = !def
        ? tiposAceptadosCabecera(orden, fase)
        : dimension
          ? [...new Set([...tiposAceptados(def, dimension, valores), ...(admiteOtraCaja ? ["caja" as const] : [])])]
          : [];

    const hayPendientes = lineasPendientes(orden, fase).length > 0;

    const cancelar = useCallback(() => {
        flujoVoz.cancelar();
        if (lineaFija) return publicar("lectura_guion_cancelada");
        return publicar(fase === "DROP" ? "lectura_drop_cancelada" : "lectura_pick_cancelada");
    }, [lineaFija, fase, publicar, flujoVoz]);

    const reiniciar = () => {
        setActual(null);
        setSerie([]);
        setClave((k) => k + 1);
    };

    const fallo = (texto: string) => {
        pitidoError();
        setMensaje({ exito: false, texto });
        setClave((k) => k + 1);
    };

    // Serie de destinos: al quedar completa la línea se empieza de cero.
    useEffect(() => {
        if (!actual?.lineaId || actual.def.serie !== "DESTINO") return;
        const l = lineaDe(actual.lineaId);
        if (l && cantidadPendiente(l, orden, fase) <= 0) reiniciar();
    }, [orden]); // eslint-disable-line react-hooks/exhaustive-deps

    const registrar = async (lecturas: Lectura[]) => {
        const deLinea = lecturas.filter((x) => x.lineaId && !x.valores.palet);
        const palets = lecturas.filter((x) => x.valores.palet);
        let registrado = false;
        await intentar(async () => {
            if (deLinea.length > 0) {
                await registrarLecturasOrden(
                    orden.id,
                    deLinea.map((x) => aLecturaOrden(x.def, lineaDe(x.lineaId)!, orden, x.valores, fase)),
                );
            }
            for (const p of palets) await registrarLecturaCajaOrden(orden.id, aLecturaPalet(p.valores));
            registrado = true;
        });
        if (!registrado) {
            pitidoError();
            setClave((k) => k + 1);
            return;
        }

        const ultima = lecturas[lecturas.length - 1];
        const destino = ultima.valores.cajaDestino
            ? ` en caja ${ultima.valores.cajaDestino}`
            : ultima.valores.ubicacionDestino ? ` en ${ultima.valores.ubicacionDestino}` : "";
        const texto = lecturas.length > 1
            ? `${lecturas.length} lecturas registradas${destino}`
            : ultima.valores.palet
              ? `Palé ${ultima.valores.palet.lpn} registrado${destino}`
              : `Registrado ${linea?.sku ?? ""}${destino}`;
        setMensaje({ exito: true, texto });

        if (ultima.def.serie === "DESTINO" && ultima.lineaId) {
            // Se mantiene lo leído (palé / lote) para la siguiente caja etiqueta.
            setActual({ ...ultima, valores: sinDestino(ultima.valores) });
            setSerie([]);
            setClave((k) => k + 1);
        } else {
            reiniciar();
        }
        await publicar("lectura_registrada");
    };

    /** Guarda la lectura en curso y registra si ya no falta nada. */
    const avanzar = async (siguiente: Lectura, enSerie: Lectura[] = serie) => {
        setMensaje(null);
        setActual(siguiente);
        setSerie(enSerie);
        setClave((k) => k + 1);
        const l = lineaDe(siguiente.lineaId);
        if (dimensionesPendientes(siguiente.def, l, siguiente.valores).length > 0) return;
        await registrar([...enSerie, siguiente]);
    };

    /** Primera lectura en cabecera: localiza la línea (o el palé) e inicia la lectura. */
    const iniciar = async (codigo: CodigoResuelto, enSerie: Lectura[]) => {
        let l = buscarLineaParaCodigo(orden, fase, codigo);
        let ctx: ContextoLectura | null = null;

        if (!l && codigo.tipo === "caja" && !codigo.sku) {
            if (fase === "PICK") {
                const encontrada = await buscarLineaEnCajaMultiproducto(orden, fase, codigo);
                if (encontrada) ({ linea: l, ctx } = encontrada);
            }
            if (!l) {
                const defPalet = definicionParaPalet(orden, fase);
                if (!defPalet) return fallo(`La caja ${codigo.lpn} no corresponde a ninguna línea pendiente`);
                return avanzar({ lineaId: null, def: defPalet, valores: { palet: { id: codigo.id, lpn: codigo.lpn } } }, enSerie);
            }
        }
        if (!l) return fallo(`${describirCodigo(codigo)} no corresponde a ninguna línea pendiente`);

        const d = definicionDeLinea(l, orden, fase);
        if (!d) return fallo(`La línea ${l.sku} no tiene pasos de lectura`);
        const r = aplicarCodigo(d, l, {}, codigo, ctx ?? await contextoPara(d, l, codigo, fase));
        if (!r.ok) return fallo(r.error);
        await avanzar({ lineaId: l.id, def: d, valores: r.valores }, enSerie);
    };

    const procesarCodigo = async (codigo: CodigoResuelto) => {
        if (!enCurso) return iniciar(codigo, []);

        // Otra caja en una serie de cajas: la lectura actual queda a la espera del destino.
        if (admiteOtraCaja && codigo.tipo === "caja") return iniciar(codigo, [...serie, enCurso]);

        const ctx = linea ? await contextoPara(enCurso.def, linea, codigo, fase) : {};
        const r = aplicarCodigo(enCurso.def, linea, enCurso.valores, codigo, ctx);
        if (!r.ok) return fallo(r.error);

        // El destino leído vale para todas las cajas de la serie.
        let enSerie = serie;
        if (dimension === "destino" && serie.length > 0) {
            enSerie = [];
            for (const x of serie) {
                const rx = aplicarCodigo(x.def, lineaDe(x.lineaId), x.valores, codigo);
                if (!rx.ok) return fallo(rx.error);
                enSerie.push({ ...x, valores: rx.valores });
            }
        }
        await avanzar({ ...enCurso, valores: r.valores }, enSerie);
    };

    const onCodigoLeido = async (texto: string) => {
        if (!texto.trim() || ocupado.current) return;
        ocupado.current = true;
        try {
            const codigo = await resolverCodigo(texto, aceptados);
            if (!codigo) return fallo(`Código ${texto} no reconocido`);
            await procesarCodigo(codigo);
        } finally {
            ocupado.current = false;
        }
    };

    const onCantidad = async (cantidad: number) => {
        if (!enCurso) return;
        await avanzar({ ...enCurso, valores: { ...enCurso.valores, cantidad } });
    };

    const onLoteElegido = async (lote: string) => {
        if (!enCurso) return;
        await avanzar({ ...enCurso, valores: elegirLote(enCurso.valores, lote) });
    };

    // --- Modo voz: cada paso se pide y se confirma por voz ---
    const procesarRef = useRef({ procesarCodigo, onCantidad });
    procesarRef.current = { procesarCodigo, onCantidad };
    const vozActiva = useRef(false);

    useEffect(() => {
        if (!modoVoz || !flujoVoz.soportado || vozActiva.current) return;
        if (valores.lotesParaElegir || (!dimension && (def || !hayPendientes))) return;
        const instruccion = def && dimension ? instruccionDimension(def, dimension, valores) : "Lee el primer código";
        vozActiva.current = true;
        const pregunta = dimension === "cantidad"
            ? {
                  instruccion,
                  tipo: "numero" as const,
                  confirmacion: (v: number) => `${v} unidades, ¿correcto?`,
              }
            : {
                  instruccion,
                  tipo: "texto" as const,
                  resolver: (t: string) => resolverCodigo(t, aceptados),
                  confirmacion: (c: CodigoResuelto) => `${describirCodigo(c)}, ¿correcto?`,
              };
        flujoVoz.preguntar(pregunta)
            .then((valor) => {
                vozActiva.current = false;
                return dimension === "cantidad"
                    ? procesarRef.current.onCantidad(valor as number)
                    : procesarRef.current.procesarCodigo(valor as CodigoResuelto);
            })
            .catch(() => { vozActiva.current = false; });
        return () => {
            flujoVoz.cancelar();
            vozActiva.current = false;
        };
    }, [modoVoz, clave]); // eslint-disable-line react-hooks/exhaustive-deps

    const titulo = `Leer ${fase === "DROP" ? "drop" : "pick"}${def ? ` · ${def.nombre}` : ""}`;

    return (
        <QModal abierto={true} nombre="leerPasosOrden" titulo={titulo} onCerrar={cancelar}>
            <div className="LeerPasosOrden">
                {linea && def && <Resumen orden={orden} linea={linea} def={def} valores={valores} fase={fase} />}
                {!linea && valores.palet && <p><QEtiqueta variante="exito">Palé {valores.palet.lpn}</QEtiqueta></p>}

                {serie.length > 0 && (
                    <ul className="LeerPasosOrden__serie">
                        {[...serie, ...(enCurso ? [enCurso] : [])].map((x, i) => (
                            <li key={i}>
                                {x.valores.palet
                                    ? `Palé ${x.valores.palet.lpn}`
                                    : `Caja ${x.valores.cajaOrigen ?? ""} — ${lineaDe(x.lineaId)?.sku ?? ""}`}
                            </li>
                        ))}
                    </ul>
                )}

                {modoVoz && (
                    <IndicadorVoz
                        estado={flujoVoz.estado}
                        textoReconocido={flujoVoz.textoReconocido}
                        interino={flujoVoz.interino}
                    />
                )}

                {lineaFija && !defFija ? (
                    <p>La línea no tiene pasos de {fase === "DROP" ? "drop" : "pick"}.</p>
                ) : !def && !hayPendientes ? (
                    <p>No quedan líneas pendientes.</p>
                ) : valores.lotesParaElegir ? (
                    <div className="paso-guion">
                        <p className="paso-guion__instruccion">{instruccionDimension(def!, "que", valores)}</p>
                        <div className="botones maestro-botones">
                            {valores.lotesParaElegir.map((lote) => (
                                <QBoton key={lote} onClick={() => onLoteElegido(lote)}>{lote}</QBoton>
                            ))}
                        </div>
                    </div>
                ) : (
                    (dimension || !def) && (
                        <div className="paso-guion">
                            <p className="paso-guion__instruccion">
                                {def && dimension
                                    ? instruccionDimension(def, dimension, valores)
                                    : "Lee el primer código (artículo, lote, caja o palé)"}
                                {admiteOtraCaja && " — o lee otra caja"}
                            </p>
                            <quimera-formulario>
                                {dimension === "cantidad" && linea && def ? (
                                    <CampoCantidad
                                        key={clave}
                                        inicial={cantidadALeer(def, linea, orden, valores, fase)}
                                        onConfirmar={onCantidad}
                                    />
                                ) : (
                                    <CampoCodigo key={clave} onLeido={onCodigoLeido} />
                                )}
                            </quimera-formulario>
                        </div>
                    )
                )}

                {mensaje && (
                    <p>
                        {mensaje.exito
                            ? <QEtiqueta variante="exito">{mensaje.texto}</QEtiqueta>
                            : <span className="q-texto-error">{mensaje.texto}</span>}
                    </p>
                )}

                <div className="botones maestro-botones">
                    {(actual || serie.length > 0) && (
                        <QBoton variante="borde" onClick={() => { setMensaje(null); reiniciar(); }}>
                            Empezar de nuevo
                        </QBoton>
                    )}
                    <QBoton onClick={cancelar}>Cerrar</QBoton>
                </div>
            </div>
        </QModal>
    );
};
