import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback } from "react";
import { CamposCondicion } from "../comun/CamposCondicion.tsx";
import { PrecioArticulo } from "../diseño.ts";
import { descripcionPrecioArticulo, metaPrecioArticulo } from "../dominio.ts";
import { patchPrecioArticulo } from "../infraestructura.ts";

/**
 * Cambio del tramo, el descuento o el precio de una condición. El artículo
 * no se cambia: para otro artículo se crea otra condición.
 */
export const CambiarPrecioArticulo = ({
    precio,
    publicar,
}: {
    precio: PrecioArticulo;
    publicar: EmitirEvento;
}) => {
    const { modelo, uiProps, valido } = useModelo(metaPrecioArticulo, precio);

    const cambiar_ = useCallback(async () => {
        await patchPrecioArticulo(precio.id, {
            cantidadMin: modelo.cantidadMin,
            cantidadMax: modelo.cantidadMax,
            dtoPorcentual: modelo.dtoPorcentual,
            pvp: modelo.pvp,
        });
        publicar("precio_cambiado", precio);
    }, [modelo, precio, publicar]);

    const cancelar_ = useCallback(() => publicar("cambio_cancelado"), [publicar]);

    const [cambiar, cancelar] = useForm(cambiar_, cancelar_);

    return (
        <QModal
            abierto={true}
            nombre="cambiar_precio_articulo"
            titulo={`Precio de ${descripcionPrecioArticulo(precio)}`}
            onCerrar={cancelar}
        >
            <div className="CambiarPrecioArticulo">
                <quimera-formulario>
                    <CamposCondicion uiProps={uiProps} modelo={modelo} />
                </quimera-formulario>
                <div className="botones maestro-botones">
                    <QBoton onClick={cambiar} deshabilitado={!valido}>
                        Guardar
                    </QBoton>
                </div>
            </div>
        </QModal>
    );
};
