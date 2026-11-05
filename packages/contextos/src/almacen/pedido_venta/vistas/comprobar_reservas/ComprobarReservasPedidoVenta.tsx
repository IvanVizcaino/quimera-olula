import { Zona } from "#/almacen/comun/componentes/Zona.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback } from "react";
import { comprobarReservas } from "../../infraestructura.ts";
import { comprobarReservasVacio, metaComprobarReservas } from "./comprobar_reservas.ts";

const LIMITE_PEDIDOS = 10;

export const ComprobarReservasPedidoVenta = ({
    publicar,
}: {
    publicar: EmitirEvento;
}) => {
    const { modelo, uiProps, valido } = useModelo(metaComprobarReservas, comprobarReservasVacio);

    const comprobar_ = useCallback(async () => {
        const zonaId = parseInt(modelo.zonaId as string, 10);
        const resultados = await comprobarReservas([zonaId], LIMITE_PEDIDOS);
        publicar("reservas_comprobadas", resultados);
    }, [modelo.zonaId, publicar]);

    const cancelar_ = useCallback(() => publicar("comprobar_reservas_cancelado"), [publicar]);

    const [comprobar, cancelar] = useForm(comprobar_, cancelar_);

    return (
        <QModal
            abierto={true}
            nombre="comprobarReservasPedidoVenta"
            titulo={`Comprobar disponibilidad (${LIMITE_PEDIDOS} pedidos prioritarios)`}
            onCerrar={cancelar}
        >
            <quimera-formulario>
                <Zona label="Zona de almacén" {...uiProps("zonaId")} />
            </quimera-formulario>

            <div className="botones maestro-botones">
                <QBoton onClick={comprobar} deshabilitado={!valido}>
                    Comprobar
                </QBoton>
            </div>
        </QModal>
    );
};
