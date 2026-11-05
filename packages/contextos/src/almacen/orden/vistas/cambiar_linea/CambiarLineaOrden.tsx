import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback } from "react";
import { LineaOrdenAlmacen, OrdenAlmacen } from "../../diseño.ts";
import { metaNuevaLinea } from "../../dominio.ts";
import { patchLineaOrden } from "../../infraestructura.ts";

export const CambiarLineaOrden = ({
    publicar,
    linea,
    orden,
}: {
    publicar: EmitirEvento;
    linea: LineaOrdenAlmacen;
    orden: OrdenAlmacen;
}) => {
    const { modelo, uiProps, valido } = useModelo(metaNuevaLinea, linea);

    const mostrarOrigen = orden.tipo === "SALIDA" || orden.tipo === "TRASPASO";
    const mostrarDestino = orden.tipo === "ENTRADA" || orden.tipo === "TRASPASO";

    const guardar_ = useCallback(async () => {
        await patchLineaOrden(orden.id, linea.id, modelo);
        publicar("linea_cambiada", modelo);
    }, [modelo, publicar, orden.id, linea.id]);

    const cancelar_ = useCallback(() => {
        publicar("cambio_de_linea_cancelado");
    }, [publicar]);

    const [guardar, cancelar] = useForm(guardar_, cancelar_);

    return (
        <QModal
            abierto={true}
            nombre="cambiarLineaOrden"
            titulo="Edición de línea"
            onCerrar={cancelar}
        >
            <div className="CambiarLineaOrden">
                <quimera-formulario>
                    <QInput label="SKU" {...uiProps("sku")} />
                    <QInput label="Cantidad prevista" {...uiProps("cantidadPrevista")} />
                    <QInput label="Cantidad real" {...uiProps("cantidadReal")} soloLectura />
                    {mostrarOrigen && (
                        <>
                            <label>Pasos pick</label>
                            <select
                                value={modelo.pasosPick ?? ""}
                                onChange={(e) => uiProps("pasosPick").onChange(e.target.value || null)}
                            >
                                <option value="">Sin pasos</option>
                                <option value="LOTE-CAJAS">Lote → Caja etiqueta</option>
                                <option value="CAJA-CAJAS">Caja origen → Caja etiqueta</option>
                            </select>
                        </>
                    )}
                    {mostrarDestino && (
                        <>
                            <label>Pasos drop</label>
                            <select
                                value={modelo.pasosDrop ?? ""}
                                onChange={(e) => uiProps("pasosDrop").onChange(e.target.value || null)}
                            >
                                <option value="">Sin pasos</option>
                                <option value="CAJAS-UBICACION">Caja → Ubicación</option>
                                <option value="SKU-CANTIDAD">SKU → Cantidad</option>
                                <option value="LOTE-CANTIDAD">Lote → Cantidad</option>
                                <option value="CAJAS">Leer cajas</option>
                                <option value="PALET">Leer palés</option>
                            </select>
                        </>
                    )}
                </quimera-formulario>
                <div className="botones maestro-botones">
                    <QBoton onClick={guardar} deshabilitado={!valido}>
                        Guardar
                    </QBoton>
                </div>
            </div>
        </QModal>
    );
};
