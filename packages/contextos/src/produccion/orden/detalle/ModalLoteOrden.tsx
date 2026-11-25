import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo } from "react";
import { CampoFecha } from "../../comun/componentes/CampoFecha.tsx";
import { SelectorArticuloFabricado } from "../../articulo/SelectorArticuloFabricado.tsx";
import { fechaDdMmAaaa } from "../../comun/dominio.ts";
import { FormLoteOrden } from "../diseño.ts";
import { fechaFabricacionPorDefecto, metaFormLote } from "../dominio.ts";

/**
 * Añadir el lote de la orden (artículo fabricado, cantidad y fecha de fabricación) o cambiar su
 * cantidad y fecha (`descripcionArticulo` indica que se cambia: el artículo no se toca).
 */
export const ModalLoteOrden = ({
    titulo,
    inicial,
    descripcionArticulo,
    guardar,
    cerrar,
}: {
    titulo: string;
    /** Constante mientras el modal está abierto. */
    inicial: FormLoteOrden;
    descripcionArticulo?: string;
    guardar: (lote: FormLoteOrden) => Promise<void>;
    cerrar: () => void;
}) => {
    const { modelo, uiProps, valido } = useModelo(metaFormLote, inicial);
    const cambiando = descripcionArticulo !== undefined;
    const porDefecto = useMemo(() => fechaDdMmAaaa(fechaFabricacionPorDefecto()), []);

    const guardar_ = useCallback(() => guardar(modelo), [guardar, modelo]);
    const [aceptar, cancelar] = useForm(guardar_, cerrar);

    return (
        <QModal abierto={true} nombre="loteOrdenProduccion" titulo={titulo} onCerrar={cancelar}>
            <div className="ModalLoteOrden FormOrdenProduccion">
                <quimera-formulario>
                    <SelectorArticuloFabricado {...uiProps("articuloId")}
                        descripcion={cambiando ? `${inicial.articuloId} - ${descripcionArticulo}` : undefined}
                        soloLectura={cambiando} />
                    <QInput label="Cantidad" {...uiProps("cantidad")} />
                    <CampoFecha label={cambiando ? "Fecha de fabricación" : `Fecha de fabricación (vacía: ${porDefecto})`}
                        {...uiProps("fechaFabricacion")} />
                </quimera-formulario>
                <div className="botones maestro-botones">
                    <QBoton onClick={aceptar} deshabilitado={!valido}>{cambiando ? "Guardar" : "Añadir"}</QBoton>
                </div>
            </div>
        </QModal>
    );
};
