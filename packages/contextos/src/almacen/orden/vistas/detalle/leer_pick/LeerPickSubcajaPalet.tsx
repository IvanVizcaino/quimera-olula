import { Caja } from "#/almacen/comun/componentes/Caja.tsx";
import { Lote } from "#/almacen/comun/componentes/Lote.tsx";
import { LineaOrdenAlmacen, OrdenAlmacen } from "#/almacen/orden/diseño.ts";
import { registrarLecturasOrden, getSkuLote } from "#/almacen/orden/infraestructura.ts";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QEtiqueta } from "@olula/componentes/atomos/qetiqueta.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { ComponentProps, useCallback, useContext, useState } from "react";

type OpcionCaja = NonNullable<Parameters<ComponentProps<typeof Caja>["onChange"]>[0]>;
type OpcionLote = NonNullable<Parameters<ComponentProps<typeof Lote>["onChange"]>[0]>;

// Busca línea pendiente:
// 1. Por lote exacto
// 2. Por sku con lote vacío (línea creada sin lote asignado)
// No filtra por pasos: el orden.pasosPick ya garantiza el contexto SUBCAJA_PALET
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

export const LeerPickSubcajaPalet = ({
    orden,
    publicar,
}: {
    orden: OrdenAlmacen;
    publicar: EmitirEvento;
}) => {
    const { intentar } = useContext(ContextoError);
    const [loteValor, setLoteValor] = useState("");
    const [loteId, setLoteId] = useState<string | null>(null);
    const [linea, setLinea] = useState<LineaOrdenAlmacen | null>(null);
    const [errorLote, setErrorLote] = useState<string | null>(null);
    const [cajasConfirmadas, setCajasConfirmadas] = useState<string[]>([]);
    const [claveCaja, setClaveCaja] = useState(0);
    const [resultado, setResultado] = useState<{ exito: boolean; mensaje: string } | null>(null);

    const onLoteSeleccionado = useCallback(
        async (opcion: OpcionLote | null) => {
            if (!opcion) {
                setLoteValor("");
                return;
            }
            setLoteValor(opcion.valor);
            setErrorLote(null);

            // Usa el sku del componente Lote si está disponible; si no, lo resuelve desde la API
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
            setCajasConfirmadas([]);
        },
        [orden, intentar],
    );

    const procesarCaja = useCallback(
        async (opcion: OpcionCaja) => {
            if (!loteId || !linea) return;

            await intentar(async () => {
                await registrarLecturasOrden(orden.id, [{
                    sku: linea.sku,
                    articulo: linea.articulo,
                    idLote: loteId,
                    idLinea: linea.id,
                    cantidad: 0,
                    cajaCompleta: false,
                    idCajaOrigen: linea.idCajaOrigen,
                    idCajaDestino: opcion.id,
                    idUbicacionOrigen: null,
                    idUbicacionDestino: null,
                    fase: 'PICK',
                }]);
            });

            setCajasConfirmadas((prev) => [...prev, opcion.lpn ?? opcion.id]);
            setResultado({ exito: true, mensaje: `Caja ${opcion.lpn ?? opcion.id} confirmada` });
            setClaveCaja((k) => k + 1);
            await publicar("lectura_registrada");
        },
        [loteId, linea, orden.id, intentar, publicar],
    );

    const cambiarLote = useCallback(() => {
        setLoteValor("");
        setLoteId(null);
        setLinea(null);
        setErrorLote(null);
        setCajasConfirmadas([]);
        setResultado(null);
    }, []);

    return (
        <QModal
            abierto={true}
            nombre="leerPickSubcajaPalet"
            titulo="Leer pick (Subcaja Palé)"
            onCerrar={() => publicar("lectura_pick_cancelada")}
        >
            <div className="LeerPickSubcajaPalet">
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
                            <QEtiqueta variante="neutro">{linea?.sku} — {linea?.articulo}</QEtiqueta>
                        </p>
                        <quimera-formulario>
                            <Caja
                                key={claveCaja}
                                label="Caja etiqueta"
                                nombre="idCajaEtiqueta"
                                valor=""
                                onChange={(opcion) => {
                                    if (opcion) procesarCaja(opcion);
                                }}
                                autoFocus
                            />
                        </quimera-formulario>
                        {resultado && (
                            <p>
                                {resultado.exito ? (
                                    <QEtiqueta variante="exito">{resultado.mensaje}</QEtiqueta>
                                ) : (
                                    <span className="q-texto-error">{resultado.mensaje}</span>
                                )}
                            </p>
                        )}
                        {cajasConfirmadas.length > 0 && (
                            <ul>
                                {cajasConfirmadas.map((lpn, i) => (
                                    <li key={i}>{lpn}</li>
                                ))}
                            </ul>
                        )}
                        <div className="botones maestro-botones">
                            <QBoton variante="borde" onClick={cambiarLote}>
                                Cambiar lote
                            </QBoton>
                        </div>
                    </div>
                )}
                <div className="botones maestro-botones">
                    <QBoton onClick={() => publicar("lectura_pick_cancelada")}>
                        Cancelar
                    </QBoton>
                </div>
            </div>
        </QModal>
    );
};
