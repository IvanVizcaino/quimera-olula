import { Lote } from "#/almacen/comun/componentes/Lote.tsx";
import { LineaOrdenAlmacen, OrdenAlmacen } from "#/almacen/orden/diseño.ts";
import { getSkuLote, registrarLecturasOrden } from "#/almacen/orden/infraestructura.ts";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QEtiqueta } from "@olula/componentes/atomos/qetiqueta.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { ComponentProps, useCallback, useContext, useState } from "react";

type OpcionLote = NonNullable<Parameters<ComponentProps<typeof Lote>["onChange"]>[0]>;

const encontrarLineaPendiente = (
    orden: OrdenAlmacen,
    loteId: string,
    sku: string,
): LineaOrdenAlmacen | null => {
    const pendiente = (l: LineaOrdenAlmacen) =>
        (l.cantidadReal ?? 0) < l.cantidadPrevista;
    return (
        orden.lineas.find((l) => pendiente(l) && l.loteId === loteId) ??
        // eslint-disable-next-line eqeqeq
        orden.lineas.find((l) => pendiente(l) && l.sku === sku && l.loteId == null) ??
        null
    );
};

export const LeerLoteCantidadOrden = ({
    orden,
    publicar,
}: {
    orden: OrdenAlmacen;
    publicar: EmitirEvento;
}) => {
    const { intentar } = useContext(ContextoError);
    const [loteId, setLoteId] = useState<string | null>(null);
    const [loteValor, setLoteValor] = useState("");
    const [linea, setLinea] = useState<LineaOrdenAlmacen | null>(null);
    const [errorLote, setErrorLote] = useState<string | null>(null);
    const [cantidad, setCantidad] = useState<string>("");

    const onLoteSeleccionado = useCallback(
        async (opcion: OpcionLote | null) => {
            if (!opcion) {
                setLoteValor("");
                return;
            }
            setErrorLote(null);
            setLoteValor(opcion.valor);

            let sku: string = opcion.sku;
            if (!sku) {
                await intentar(async () => {
                    const res = await getSkuLote(opcion.id);
                    sku = res.sku;
                });
            }
            if (!sku) return;

            const lineaEncontrada = encontrarLineaPendiente(orden, opcion.id, sku);
            if (!lineaEncontrada) {
                setErrorLote(`No hay línea pendiente para el lote ${opcion.id} (sku ${sku})`);
                return;
            }
            setLoteId(opcion.id);
            setLinea(lineaEncontrada);
            const pendiente = lineaEncontrada.cantidadPrevista - (lineaEncontrada.cantidadReal ?? 0);
            setCantidad(String(pendiente));
        },
        [orden, intentar],
    );

    const registrar = useCallback(async () => {
        if (!loteId || !linea) return;
        const cantidadNum = parseFloat(cantidad);
        if (isNaN(cantidadNum) || cantidadNum <= 0) return;

        await intentar(() =>
            registrarLecturasOrden(orden.id, [{
                sku: linea.sku,
                articulo: linea.articulo,
                idLote: loteId,
                idLinea: linea.id,
                cajaCompleta: false,
                cantidad: cantidadNum,
                idCajaOrigen: null,
                idUbicacionOrigen: linea.idUbicacionOrigen,
                idCajaDestino: linea.idCajaDestino,
                idUbicacionDestino: linea.idUbicacionDestino,
                fase: 'DROP',
            }])
        );
        publicar("lectura_registrada");
        // Reiniciar para siguiente lectura
        setLoteId(null);
        setLoteValor("");
        setLinea(null);
        setCantidad("");
    }, [loteId, linea, cantidad, orden.id, intentar, publicar]);

    return (
        <QModal
            abierto={true}
            nombre="leerLoteCantidadOrden"
            titulo="Leer drop (Lote · Cantidad)"
            onCerrar={() => publicar("lectura_drop_cancelada")}
        >
            <div>
                {!loteId ? (
                    <div>
                        <quimera-formulario>
                            <Lote
                                label="Lote"
                                valor={loteValor}
                                onChange={onLoteSeleccionado}
                                autoFocus
                            />
                        </quimera-formulario>
                        {errorLote && <p className="q-texto-error">{errorLote}</p>}
                    </div>
                ) : (
                    <div>
                        <p>
                            <QEtiqueta variante="exito">Lote: {loteId}</QEtiqueta>
                            {" "}
                            <QEtiqueta>{linea?.sku} — {linea?.articulo}</QEtiqueta>
                        </p>
                        <quimera-formulario>
                            <QInput
                                label="Cantidad"
                                nombre="cantidad"
                                tipo="numero"
                                valor={cantidad}
                                onChange={setCantidad}
                            />
                        </quimera-formulario>
                        <div className="botones maestro-botones">
                            <QBoton onClick={registrar} deshabilitado={!cantidad || parseFloat(cantidad) <= 0}>
                                Registrar
                            </QBoton>
                            <QBoton variante="borde" onClick={() => { setLoteId(null); setLoteValor(""); setLinea(null); }}>
                                Cambiar lote
                            </QBoton>
                        </div>
                    </div>
                )}
                <div className="botones maestro-botones">
                    <QBoton onClick={() => publicar("lectura_drop_cancelada")}>Cerrar</QBoton>
                </div>
            </div>
        </QModal>
    );
};
