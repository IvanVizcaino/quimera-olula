import { LineaOrdenAlmacen, OrdenAlmacen } from "#/almacen/orden/diseño.ts";
import {
    getLotesDeArticuloEnCaja,
    getSkuLote,
    getStockDesgloseCaja,
    registrarLecturasOrden,
} from "#/almacen/orden/infraestructura.ts";
import { buscarCajaCompletaPorTexto, CajaCompletaResuelta } from "#/almacen/comun/voz_resolvers.ts";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QEtiqueta } from "@olula/componentes/atomos/qetiqueta.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useCallback, useContext, useRef, useState } from "react";

const esPendiente = (l: LineaOrdenAlmacen): boolean =>
    (l.cantidadPick ?? l.cantidadReal ?? 0) < l.cantidadPrevista;

const encontrarLineaPorSku = (
    orden: OrdenAlmacen,
    sku: string,
): LineaOrdenAlmacen | null =>
    orden.lineas.find((l) => esPendiente(l) && l.sku === sku) ?? null;

export const LeerPickLoteCaja = ({
    orden,
    publicar,
}: {
    orden: OrdenAlmacen;
    publicar: EmitirEvento;
}) => {
    const { intentar } = useContext(ContextoError);
    const [valor, setValor] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [cargando, setCargando] = useState(false);
    const [ultimaLectura, setUltimaLectura] = useState<{
        loteId: string;
        lpn: string | null;
        articulo: string;
    } | null>(null);
    // Selector de lote: se rellena cuando la caja tiene múltiples lotes del artículo
    const [lotesParaElegir, setLotesParaElegir] = useState<string[] | null>(null);
    const [cajaParaElegirLote, setCajaParaElegirLote] = useState<{
        caja: CajaCompletaResuelta;
        linea: LineaOrdenAlmacen;
    } | null>(null);
    const inputRef = useRef<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null>(null);

    const limpiarInput = useCallback(() => {
        setValor("");
        (inputRef.current as HTMLInputElement | null)?.focus();
    }, []);

    const registrarLecturaCajaConLote = useCallback(
        async (
            caja: CajaCompletaResuelta,
            linea: LineaOrdenAlmacen,
            loteId: string,
        ) => {
            const cantidadPendiente = linea.cantidadPrevista - (linea.cantidadPick ?? 0);
            await registrarLecturasOrden(orden.id, [
                {
                    sku: linea.sku,
                    articulo: linea.articulo,
                    idLote: loteId,
                    idLinea: linea.id,
                    cantidad: cantidadPendiente,
                    cajaCompleta: false,
                    idCajaOrigen: caja.id,
                    idCajaDestino: null,
                    idUbicacionOrigen: linea.idUbicacionOrigen,
                    idUbicacionDestino: null,
                    fase: "PICK",
                },
            ]);
            setUltimaLectura({ loteId, lpn: caja.lpn, articulo: linea.articulo });
            setLotesParaElegir(null);
            setCajaParaElegirLote(null);
            await publicar("lectura_registrada");
        },
        [orden.id, publicar],
    );

    const elegirLote = useCallback(
        async (loteId: string) => {
            if (!cajaParaElegirLote) return;
            setCargando(true);
            await intentar(() =>
                registrarLecturaCajaConLote(
                    cajaParaElegirLote.caja,
                    cajaParaElegirLote.linea,
                    loteId,
                ),
            );
            setCargando(false);
        },
        [cajaParaElegirLote, intentar, registrarLecturaCajaConLote],
    );

    const procesarTexto = useCallback(
        async (texto: string) => {
            if (!texto.trim()) return;
            setCargando(true);
            setError(null);
            setLotesParaElegir(null);
            setCajaParaElegirLote(null);
            let mostrandoSelector = false;

            await intentar(async () => {
                // 1. ¿Es una caja (por LPN)?
                const caja = await buscarCajaCompletaPorTexto(texto);

                if (caja !== null) {
                    // Determinar la línea pendiente y los lotes de la caja
                    let linea: LineaOrdenAlmacen | null = null;
                    let lotesEnCaja: string[] = [];

                    if (caja.sku !== null) {
                        // Caja monoproducto: el artículo está en caja.sku
                        linea = encontrarLineaPorSku(orden, caja.sku);
                        if (!linea) {
                            setError(
                                `No hay línea pendiente para el artículo de la caja (${caja.sku}).`,
                            );
                            return;
                        }
                        if (caja.idLote !== null) {
                            // Caja con lote asignado: registrar directamente
                            await registrarLecturaCajaConLote(caja, linea, caja.idLote);
                            return;
                        }
                        // Caja monoproducto sin lote: consultar desglose
                        if (linea.idUbicacionOrigen) {
                            lotesEnCaja = await getLotesDeArticuloEnCaja(
                                linea.idUbicacionOrigen,
                                caja.sku,
                                caja.id,
                            );
                        }
                    } else {
                        // Caja multiproducto: buscar la línea pendiente en el desglose
                        // Probamos con las líneas pendientes de la orden
                        const lineasPendientes = orden.lineas.filter(esPendiente);
                        for (const candidata of lineasPendientes) {
                            if (!candidata.idUbicacionOrigen) continue;
                            const lotes = await getLotesDeArticuloEnCaja(
                                candidata.idUbicacionOrigen,
                                candidata.sku,
                                caja.id,
                            );
                            if (lotes.length > 0) {
                                linea = candidata;
                                lotesEnCaja = lotes;
                                break;
                            }
                        }
                        if (!linea) {
                            setError("El artículo no está contenido en esta caja.");
                            return;
                        }
                    }

                    if (lotesEnCaja.length === 0) {
                        setError("El artículo no está contenido en esta caja.");
                        return;
                    }
                    if (lotesEnCaja.length === 1) {
                        await registrarLecturaCajaConLote(caja, linea, lotesEnCaja[0]);
                        return;
                    }
                    // Múltiples lotes: mostrar selector
                    setLotesParaElegir(lotesEnCaja);
                    setCajaParaElegirLote({ caja, linea });
                    mostrandoSelector = true;
                } else {
                    // 2. No es una caja → tratar como código de lote
                    const loteId = texto.trim();
                    const skuLote = await getSkuLote(loteId);
                    const articuloId = skuLote.sku;

                    const linea = encontrarLineaPorSku(orden, articuloId);
                    if (!linea) {
                        setError(
                            `No hay línea pendiente para el artículo del lote ${loteId}.`,
                        );
                        return;
                    }

                    // Verificar que existe stock suelto (sin caja) en la ubicación origen
                    let cantidadSuelta = 0;
                    if (linea.idUbicacionOrigen) {
                        const desglose = await getStockDesgloseCaja(
                            linea.idUbicacionOrigen,
                            articuloId,
                            loteId,
                        );
                        const itemSuelto = desglose?.find(
                            (item) => item.cajaId === null && item.cantidad > 0,
                        );

                        if (!itemSuelto) {
                            setError(
                                `El lote ${loteId} solo tiene stock en cajas. Lee la etiqueta de la caja.`,
                            );
                            return;
                        }
                        cantidadSuelta = itemSuelto.cantidad;
                    }

                    const cantidadPendiente =
                        linea.cantidadPrevista - (linea.cantidadPick ?? 0);
                    const cantidad = cantidadSuelta > 0
                        ? Math.min(cantidadPendiente, cantidadSuelta)
                        : cantidadPendiente;
                    await registrarLecturasOrden(orden.id, [
                        {
                            sku: linea.sku,
                            articulo: linea.articulo,
                            idLote: loteId,
                            idLinea: linea.id,
                            cantidad,
                            cajaCompleta: false,
                            idCajaOrigen: null,
                            idCajaDestino: null,
                            idUbicacionOrigen: linea.idUbicacionOrigen,
                            idUbicacionDestino: null,
                            fase: "PICK",
                        },
                    ]);
                    setUltimaLectura({
                        loteId,
                        lpn: null,
                        articulo: linea.articulo,
                    });
                    await publicar("lectura_registrada");
                }
            });

            setCargando(false);
            if (!mostrandoSelector) limpiarInput();
        },
        [orden, intentar, publicar, limpiarInput, registrarLecturaCajaConLote],
    );

    return (
        <QModal
            abierto={true}
            nombre="leerPickLoteCaja"
            titulo="Leer pick (Lote/Caja)"
            onCerrar={() => publicar("lectura_pick_cancelada")}
        >
            <div className="LeerPickLoteCaja">
                {lotesParaElegir !== null ? (
                    <div>
                        <p>La caja contiene varios lotes. Elige el lote a sacar:</p>
                        <div className="botones maestro-botones">
                            {lotesParaElegir.map((lote) => (
                                <QBoton
                                    key={lote}
                                    onClick={() => elegirLote(lote)}
                                    deshabilitado={cargando}
                                >
                                    {lote}
                                </QBoton>
                            ))}
                        </div>
                        <div className="botones maestro-botones">
                            <QBoton
                                variante="borde"
                                onClick={() => {
                                    setLotesParaElegir(null);
                                    setCajaParaElegirLote(null);
                                    limpiarInput();
                                }}
                            >
                                Cancelar
                            </QBoton>
                        </div>
                    </div>
                ) : (
                    <>
                        <quimera-formulario>
                            <QInput
                                ref={inputRef}
                                nombre="textoLectura"
                                label="Lee caja o lote"
                                valor={valor}
                                onChange={(v) => {
                                    setValor(v);
                                    setError(null);
                                }}
                                onEnterKeyUp={(v) => procesarTexto(v)}
                                autoFocus
                                deshabilitado={cargando}
                            />
                        </quimera-formulario>

                        {cargando && <p>Procesando...</p>}
                        {error && <p className="q-texto-error">{error}</p>}

                        {ultimaLectura && (
                            <p>
                                <QEtiqueta variante="exito">
                                    {`Lote ${ultimaLectura.loteId}`}
                                    {ultimaLectura.lpn ? ` — Caja ${ultimaLectura.lpn}` : " (suelto)"}
                                    {` — ${ultimaLectura.articulo}`}
                                </QEtiqueta>
                            </p>
                        )}

                        <div className="botones maestro-botones">
                            <QBoton
                                onClick={() => procesarTexto(valor)}
                                deshabilitado={!valor.trim() || cargando}
                            >
                                Confirmar
                            </QBoton>
                            <QBoton
                                variante="borde"
                                onClick={() => publicar("lectura_pick_cancelada")}
                            >
                                Cancelar
                            </QBoton>
                        </div>
                    </>
                )}
            </div>
        </QModal>
    );
};
