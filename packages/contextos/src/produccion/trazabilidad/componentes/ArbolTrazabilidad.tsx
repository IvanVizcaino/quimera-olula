import { QAviso } from "@olula/componentes/atomos/qaviso.tsx";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { fechaDdMmAaaa } from "../../comun/dominio.ts";
import { FilaArbol, MovimientoLote, SentidoTrazabilidad, Trazabilidad } from "../diseño.ts";
import {
    cantidadConSigno,
    filasArbol,
    lotesRelacionados,
    textoArticuloTrazado,
    textoDocumentoMovimiento,
    textoEnlace,
    textoErrorLectura,
    textoTercero,
    textoTipoMovimientoLote,
} from "../dominio.ts";
import { getTrazabilidad } from "../infraestructura.ts";
import { urlOrdenProduccion } from "./urls.ts";
import "./Trazabilidad.css";

const Documento = ({ m }: { m: MovimientoLote }) => (
    <li className="documento-lote">
        <span className="tipo">{textoTipoMovimientoLote(m.tipo)}</span>
        <span className="codigo">{textoDocumentoMovimiento(m)}</span>
        {textoTercero(m) && <span className="tercero">{textoTercero(m)}</span>}
        <span className="fecha">{fechaDdMmAaaa(m.fecha)}</span>
        <span className={m.cantidad < 0 ? "cantidad-salida" : "cantidad-entrada"}>{cantidadConSigno(m.cantidad)}</span>
    </li>
);

const Nodo = ({ fila, atras, abrirLote }: { fila: FilaArbol; atras: boolean; abrirLote?: (loteId: string) => void }) => {
    const { lote, enlace } = fila;
    const nombreLote = fila.sinLote
        ? <span className="lote-codigo sin-lote">Sin lote</span>
        : abrirLote && fila.profundidad > 0
            ? <button type="button" className="lote-codigo enlace" onClick={() => abrirLote(fila.loteId)}>{fila.loteId}</button>
            : <span className="lote-codigo">{fila.loteId}</span>;
    const articulo = fila.sinLote ? textoArticuloTrazado(fila.sinLote) : lote ? textoArticuloTrazado(lote) : "";

    return (
        <li className={`nodo-trazabilidad nivel-${Math.min(fila.profundidad, 6)}`} style={{ paddingLeft: `${fila.profundidad * 1.75}rem` }}>
            <div className="nodo-cabecera">
                <span className="nivel" title="Nivel">N{fila.profundidad}</span>
                {nombreLote}
                {articulo && <span className="articulo">{articulo}</span>}
                {lote?.ordenId && (
                    <span className="orden">
                        Orden <Link to={urlOrdenProduccion(lote.ordenId)}>{lote.ordenId}</Link>
                        {lote.fechaFabricacion && ` · fabricado ${fechaDdMmAaaa(lote.fechaFabricacion)}`}
                    </span>
                )}
                {lote?.caducidad && <span className="caducidad">Caduca {fechaDdMmAaaa(lote.caducidad)}</span>}
                {enlace && <span className="enlace-consumo">{textoEnlace(enlace)}</span>}
                {fila.repetido && <span className="repetido">(ya mostrado más arriba)</span>}
                {lote && !lote.existe && <span className="repetido">(no está en la tabla de lotes)</span>}
            </div>
            {lote && !fila.repetido && lote.documentos.length > 0 && (
                <ul className="documentos-lote" aria-label={atras ? "Compras" : "Ventas"}>
                    {lote.documentos.map((m) => <Documento key={m.id} m={m} />)}
                </ul>
            )}
        </li>
    );
};

const textos = {
    atras: {
        cargando: "Cargando la trazabilidad hacia atrás…",
        error: "No se ha podido leer la trazabilidad hacia atrás del lote.",
        vacio: "El lote no se ha fabricado con otros lotes: no hay consumos de producción. Abajo, sus compras.",
        ayuda: "Lotes de materia prima consumidos para fabricar el lote, nivel a nivel, con sus compras de origen.",
    },
    adelante: {
        cargando: "Cargando la trazabilidad hacia delante…",
        error: "No se ha podido leer la trazabilidad hacia delante del lote.",
        vacio: "El lote no se ha usado para fabricar otros lotes.",
        ayuda: "Lotes fabricados con este lote, nivel a nivel, con sus ventas y los clientes a los que llegaron.",
    },
};

/**
 * Trazabilidad de un lote como árbol por niveles (lista indentada). Hacia atrás: los lotes que
 * consumió y sus compras; hacia delante: los lotes en los que se usó, sus ventas y los clientes.
 * `abrirLote` permite saltar a la trazabilidad de otro lote del árbol.
 */
export const ArbolTrazabilidad = ({
    loteId,
    sentido,
    abrirLote,
}: {
    loteId: string;
    sentido: SentidoTrazabilidad;
    abrirLote?: (loteId: string) => void;
}) => {
    const [trazabilidad, setTrazabilidad] = useState<Trazabilidad | null>(null);
    const [error, setError] = useState<string | null>(null);
    const atras = sentido === "atras";
    const t = textos[sentido];

    useEffect(() => {
        let vigente = true;
        setTrazabilidad(null);
        setError(null);
        getTrazabilidad(loteId, sentido)
            .then((d) => vigente && setTrazabilidad(d))
            .catch((e) => vigente && setError(textoErrorLectura(e, textos[sentido].error)));
        return () => {
            vigente = false;
        };
    }, [loteId, sentido]);

    const filas = useMemo(() => (trazabilidad ? filasArbol(trazabilidad) : []), [trazabilidad]);

    if (error) return <p className="nota-trazabilidad">{error}</p>;
    if (!trazabilidad) return <p className="nota-trazabilidad">{t.cargando}</p>;

    const sinRelacionados = lotesRelacionados(trazabilidad).length === 0 && filas.length <= 1;

    return (
        <div className={`ArbolTrazabilidad ${sentido}`}>
            <p className="nota-trazabilidad">
                {t.ayuda} {trazabilidad.niveles > 0 && `Niveles: ${trazabilidad.niveles}.`}
            </p>
            {trazabilidad.truncado && (
                <QAviso variante="advertencia">
                    La trazabilidad tiene más niveles de los que se muestran: el árbol está truncado.
                </QAviso>
            )}
            {!atras && trazabilidad.clientes.length > 0 && (
                <div className="clientes-trazados">
                    <h4>Clientes a los que llegó</h4>
                    <ul>
                        {trazabilidad.clientes.map((c) => (
                            <li key={c.clienteId || c.cliente}>
                                <strong>{c.cliente && c.clienteId ? `${c.clienteId} - ${c.cliente}` : c.cliente || c.clienteId || "Sin cliente"}</strong>
                                {c.lotes.length > 0 && <span> · lotes {c.lotes.join(", ")}</span>}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {sinRelacionados && <p className="nota-trazabilidad">{t.vacio}</p>}
            <ul className="arbol-trazabilidad">
                {filas.map((f) => <Nodo key={f.clave} fila={f} atras={atras} abrirLote={abrirLote} />)}
            </ul>
        </div>
    );
};

