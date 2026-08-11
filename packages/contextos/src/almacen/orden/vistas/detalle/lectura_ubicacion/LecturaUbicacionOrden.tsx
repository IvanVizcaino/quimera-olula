import { Caja } from "#/almacen/comun/componentes/Caja.tsx";
import { Ubicacion } from "#/almacen/comun/componentes/Ubicacion.tsx";
import { OrdenAlmacen, TipoOrden } from "#/almacen/orden/diseño.ts";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { ProcesarEvento } from "@olula/lib/useMaquina.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useContext, useMemo } from "react";
import { registrarLecturaUbicacionOrden } from "../../../infraestructura.ts";
import { getLecturaUbicacionOrdenVacia, getMetaLecturaUbicacionOrden } from "./lectura_ubicacion_orden.ts";
import "./LecturaUbicacionOrden.css";

export const LecturaUbicacionOrden = ({
    publicar,
    orden,
    tipo,
}: {
    publicar: ProcesarEvento;
    orden: OrdenAlmacen;
    tipo: TipoOrden;
}) => {
    const { intentar } = useContext(ContextoError);

    const [lecturaInicial, metaLecturaUbicacionOrden] = useMemo(
        () => [
            getLecturaUbicacionOrdenVacia(orden),
            getMetaLecturaUbicacionOrden(orden.tipo),
        ],
        [orden]
    );

    const { modelo, uiProps, valido, init } = useModelo(
        metaLecturaUbicacionOrden,
        lecturaInicial
    );

    const esTraspaso = tipo === "TRASPASO";

    const registrar = useCallback(async () => {
        await intentar(() =>
            registrarLecturaUbicacionOrden(orden.id, {
                idUbicacion: modelo.idUbicacion,
                idUbicacionDestino: esTraspaso
                    ? modelo.idUbicacionDestino
                    : null,
                idCajaDestino: esTraspaso ? modelo.idCajaDestino : null,
            })
        );
        publicar("lectura_registrada");
        init();
    }, [modelo, publicar, orden.id, intentar, init, esTraspaso]);

    return (
        <QModal abierto={true} nombre="lecturaUbicacionOrden" titulo="Lectura de ubicación" onCerrar={() => publicar("lectura_ubicacion_cancelada")}>
            <div className="LecturaUbicacionOrden">
                <quimera-formulario>
                    <Ubicacion
                        {...uiProps("idUbicacion")}
                        label="Ubicación"
                        nombre="idUbicacion"
                    />
                    {esTraspaso && (
                        <>
                            <Ubicacion
                                {...uiProps("idUbicacionDestino")}
                                label="Ubicación destino"
                                nombre="idUbicacionDestino"
                            />
                            <Caja
                                {...uiProps("idCajaDestino")}
                                label="Caja destino"
                                nombre="idCajaDestino"
                            />
                        </>
                    )}
                </quimera-formulario>
                <div className="botones maestro-botones">
                    <QBoton onClick={registrar} deshabilitado={!valido}>
                        Registrar
                    </QBoton>
                    <QBoton onClick={() => publicar("lectura_ubicacion_cancelada")}>
                        Cerrar
                    </QBoton>
                </div>
            </div>
        </QModal>
    );
};
