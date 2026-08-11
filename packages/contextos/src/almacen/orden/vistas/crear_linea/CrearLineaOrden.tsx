import { Caja } from "#/almacen/comun/componentes/Caja.tsx";
import { Ubicacion } from "#/almacen/comun/componentes/Ubicacion.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo } from "react";
import { OrdenAlmacen } from "../../diseño.ts";
import { postLineasOrden } from "../../infraestructura.ts";
import { nuevaLineaOrdenDesdeOrden } from "./crear_linea.ts";
import { getMetaNuevaLineaOrden } from "./diseño.ts";

export const CrearLineaOrden = ({
    publicar,
    orden,
}: {
    publicar: EmitirEvento;
    orden: OrdenAlmacen;
}) => {
    const meta = getMetaNuevaLineaOrden(orden.tipo);

    const lineaInicial = useMemo(
        () => nuevaLineaOrdenDesdeOrden(orden),
        [orden.idUbicacionOrigen, orden.idCajaOrigen, orden.idUbicacionDestino, orden.idCajaDestino]
    );

    const { modelo, uiProps, valido } = useModelo(
        meta,
        lineaInicial
    );

    const mostrarOrigen = orden.tipo === "SALIDA" || orden.tipo === "TRASPASO";
    const mostrarDestino = orden.tipo === "ENTRADA" || orden.tipo === "TRASPASO";

    const crear_ = useCallback(async () => {
        await postLineasOrden(orden.id, [
            {
                sku: modelo.sku,
                cantidadPrevista: modelo.cantidadPrevista,
                loteId: null,
                idUbicacionOrigen: modelo.idUbicacionOrigen,
                idCajaOrigen: modelo.idCajaOrigen,
                idUbicacionDestino: modelo.idUbicacionDestino,
                idCajaDestino: modelo.idCajaDestino,
            },
        ]);
        publicar("linea_creada");
    }, [modelo, publicar, orden.id]);

    const cancelar_ = useCallback(() => {
        publicar("alta_de_linea_cancelada");
    }, [publicar]);

    const [crear, cancelar] = useForm(crear_, cancelar_);

    return (
        <QModal
            abierto={true}
            nombre="crearLineaOrden"
            titulo="Nueva línea"
            onCerrar={cancelar}
        >
            <div className="CrearLineaOrden">
                <quimera-formulario>
                    <QInput label="SKU" {...uiProps("sku")} />
                    <QInput label="Cantidad prevista" {...uiProps("cantidadPrevista")} />
                    {mostrarOrigen && (
                        <Ubicacion
                            {...uiProps("idUbicacionOrigen")}
                            label="Ubicación origen"
                            nombre="idUbicacionOrigen"
                        />
                    )}
                    {mostrarOrigen && (
                        <Caja
                            {...uiProps("idCajaOrigen")}
                            label="Caja origen"
                            nombre="idCajaOrigen"
                        />
                    )}
                    {mostrarDestino && (
                        <Ubicacion
                            {...uiProps("idUbicacionDestino")}
                            label="Ubicación destino"
                            nombre="idUbicacionDestino"
                        />
                    )}
                    {mostrarDestino && (
                        <Caja
                            {...uiProps("idCajaDestino")}
                            label="Caja destino"
                            nombre="idCajaDestino"
                        />
                    )}
                </quimera-formulario>
                <div className="botones maestro-botones">
                    <QBoton onClick={crear} deshabilitado={!valido}>
                        Guardar
                    </QBoton>
                </div>
            </div>
        </QModal>
    );
};
