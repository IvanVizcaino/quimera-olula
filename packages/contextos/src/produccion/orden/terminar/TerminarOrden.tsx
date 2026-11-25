import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { useContext, useState } from "react";
import { SelectorTrabajador } from "../../trabajador/SelectorTrabajador.tsx";
import { OrdenProduccion } from "../diseño.ts";
import { postTerminarOrden } from "../infraestructura.ts";

/**
 * «Terminar orden»: inicia y termina en bloque las tareas que faltan, con el trabajador que se
 * indique (opcional). Con error o sin él, se cierra y se recarga la orden.
 */
export const TerminarOrden = ({
    orden,
    cerrar,
    recargar,
}: {
    orden: OrdenProduccion;
    cerrar: () => void;
    recargar: () => Promise<void>;
}) => {
    const { intentar } = useContext(ContextoError);
    const [trabajadorId, setTrabajadorId] = useState("");

    const terminar = async () => {
        try {
            await intentar(() => postTerminarOrden(orden.id, trabajadorId));
        } catch {
            // `intentar` ya muestra el error (p. ej. 409) y se recarga la orden.
        } finally {
            cerrar();
            await recargar();
        }
    };

    return (
        <QModalConfirmacion
            nombre="terminarOrdenProduccion"
            abierto={true}
            titulo="Terminar orden"
            mensaje={`Se inician y terminan todas las tareas pendientes de la orden ${orden.id}, se consumen los componentes y entra el producto en el almacén.`}
            labelAceptar="Terminar orden"
            onCerrar={cerrar}
            onAceptar={terminar}
        >
            <quimera-formulario>
                <SelectorTrabajador
                    label="Trabajador (opcional)"
                    nombre="trabajadorId"
                    valor={trabajadorId}
                    onChange={(opcion) => setTrabajadorId(opcion?.valor ?? "")}
                />
            </quimera-formulario>
        </QModalConfirmacion>
    );
};
