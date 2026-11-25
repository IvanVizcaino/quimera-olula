import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useFocus } from "@olula/lib/useFocus.ts";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo } from "react";
import { Stock } from "../diseño.ts";
import { postRegularizacionStock } from "../infraestructura.ts";
import { metaNuevaRegularizacionStock, nuevaRegularizacionInicial } from "./regularizar.ts";

/**
 * Modal de regularización del stock (fija la cantidad a una fecha y hora).
 * Emite "stock_regularizado" o "regularizacion_cancelada".
 */
export const RegularizarStock = ({
    stock,
    publicar,
}: {
    stock: Stock;
    publicar: EmitirEvento;
}) => {
    const inicial = useMemo(
        () => nuevaRegularizacionInicial(stock.cantidadFisica),
        [stock.cantidadFisica]
    );

    const { modelo, uiProps, valido } = useModelo(metaNuevaRegularizacionStock, inicial);

    const regularizar_ = useCallback(async () => {
        const id = await postRegularizacionStock(stock, modelo);
        publicar("stock_regularizado", id);
    }, [stock, modelo, publicar]);

    const cancelar_ = useCallback(
        () => publicar("regularizacion_cancelada"),
        [publicar]
    );

    const [regularizar, cancelar] = useForm(regularizar_, cancelar_);

    const focus = useFocus();

    return (
        <QModal
            abierto={true}
            nombre="regularizarStock"
            titulo={`Regularizar ${stock.articuloId} en ${stock.almacenId}`}
            onCerrar={cancelar}
        >
            <div className="RegularizarStock">
                <quimera-formulario>
                    <QInput label="Cantidad actual" nombre="cantidadActual" valor={String(stock.cantidadFisica)} soloLectura tipo="numero" />
                    <QInput label="Cantidad nueva" {...uiProps("cantidad")} ref={focus} />
                    <QInput label="Fecha" {...uiProps("fecha")} />
                    <QInput label="Hora" {...uiProps("hora")} />
                    <QInput label="Motivo" {...uiProps("motivo")} />
                </quimera-formulario>

                <div className="botones maestro-botones">
                    <QBoton onClick={regularizar} deshabilitado={!valido}>
                        Regularizar
                    </QBoton>
                </div>
            </div>
        </QModal>
    );
};
