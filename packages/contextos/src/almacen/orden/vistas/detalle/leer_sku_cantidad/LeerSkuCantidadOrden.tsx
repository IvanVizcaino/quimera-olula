import { LineaOrdenAlmacen, OrdenAlmacen } from "#/almacen/orden/diseño.ts";
import { registrarLecturasOrden } from "#/almacen/orden/infraestructura.ts";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QEtiqueta } from "@olula/componentes/atomos/qetiqueta.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useCallback, useContext, useState } from "react";
import { LecturaSkuLote } from "../lectura/LecturaSkuLote.tsx";

type SkuLeido = { sku: string; descripcion: string; loteId: string | null };

const encontrarLineaPendiente = (
    orden: OrdenAlmacen,
    sku: string,
): LineaOrdenAlmacen | null => {
    const pendiente = (l: LineaOrdenAlmacen) =>
        (l.cantidadReal ?? 0) < l.cantidadPrevista;
    return orden.lineas.find((l) => pendiente(l) && l.sku === sku) ?? null;
};

export const LeerSkuCantidadOrden = ({
    orden,
    publicar,
}: {
    orden: OrdenAlmacen;
    publicar: EmitirEvento;
}) => {
    const { intentar } = useContext(ContextoError);
    const [skuLeido, setSkuLeido] = useState<SkuLeido | null>(null);
    const [linea, setLinea] = useState<LineaOrdenAlmacen | null>(null);
    const [errorSku, setErrorSku] = useState<string | null>(null);
    const [cantidad, setCantidad] = useState<string>("");

    const onSkuLoteLeido = useCallback(
        (resultado: SkuLeido) => {
            setErrorSku(null);
            const lineaEncontrada = encontrarLineaPendiente(orden, resultado.sku);
            if (!lineaEncontrada) {
                setErrorSku(`No hay línea pendiente para el artículo ${resultado.sku}`);
                return;
            }
            setSkuLeido(resultado);
            setLinea(lineaEncontrada);
            const pendiente = lineaEncontrada.cantidadPrevista - (lineaEncontrada.cantidadReal ?? 0);
            setCantidad(String(pendiente));
        },
        [orden],
    );

    const registrar = useCallback(async () => {
        if (!skuLeido || !linea) return;
        const cantidadNum = parseFloat(cantidad);
        if (isNaN(cantidadNum) || cantidadNum <= 0) return;

        await intentar(() =>
            registrarLecturasOrden(orden.id, [{
                sku: skuLeido.sku,
                articulo: skuLeido.descripcion,
                idLote: skuLeido.loteId ?? linea.loteId,
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
        setSkuLeido(null);
        setLinea(null);
        setCantidad("");
    }, [skuLeido, linea, cantidad, orden.id, intentar, publicar]);

    return (
        <QModal
            abierto={true}
            nombre="leerSkuCantidadOrden"
            titulo="Leer drop (SKU · Cantidad)"
            onCerrar={() => publicar("lectura_drop_cancelada")}
        >
            <div>
                {!skuLeido ? (
                    <div>
                        <quimera-formulario>
                            <LecturaSkuLote nombre="sku" onLectura={onSkuLoteLeido} />
                        </quimera-formulario>
                        {errorSku && <p className="q-texto-error">{errorSku}</p>}
                    </div>
                ) : (
                    <div>
                        <p>
                            <QEtiqueta variante="exito">{skuLeido.sku}</QEtiqueta>
                            {" "}
                            <QEtiqueta>{skuLeido.descripcion}</QEtiqueta>
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
                            <QBoton variante="borde" onClick={() => { setSkuLeido(null); setLinea(null); }}>
                                Cambiar artículo
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
