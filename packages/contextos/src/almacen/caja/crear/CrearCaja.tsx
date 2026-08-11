import { Ubicacion } from "#/almacen/comun/componentes/Ubicacion.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useFocus } from "@olula/lib/useFocus.ts";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback } from "react";
import { postCaja } from "../infraestructura.ts";
import { metaNuevaCaja, nuevaCajaVacia } from "./crear_caja.ts";

export const CrearCaja = ({
    publicar,
}: {
    publicar: EmitirEvento;
}) => {
    const { modelo: nuevaCaja, uiProps, valido } = useModelo(
        metaNuevaCaja,
        nuevaCajaVacia
    );

    const crear_ = useCallback(
        async () => {
            const id = await postCaja(nuevaCaja);
            publicar("caja_creada", id);
        },
        [nuevaCaja, publicar]
    );

    const cancelar_ = useCallback(
        () => publicar("alta_de_caja_cancelada"),
        [publicar]
    );

    const [crear, cancelar] = useForm(crear_, cancelar_);

    const focus = useFocus();

    return (
        <QModal
            abierto={true}
            nombre="crear_caja"
            titulo="Nueva Caja"
            onCerrar={cancelar}
        >
            <quimera-formulario>
                <Ubicacion label="Ubicación" {...uiProps("idUbicacion")} ref={focus} />
            </quimera-formulario>
            <div className="botones maestro-botones">
                <QBoton onClick={crear} deshabilitado={!valido}>
                    Crear
                </QBoton>
            </div>
        </QModal>
    );
};
