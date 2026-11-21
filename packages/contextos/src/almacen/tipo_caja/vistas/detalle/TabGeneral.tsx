import { urlFicha } from "#/almacen/comun/fichas.ts";
import { ValorConEnlace } from "@olula/componentes/atomos/qenlace_ficha.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { HookModelo } from "@olula/lib/useModelo.js";
import { TipoCaja } from "../../diseño.js";

/**
 * Tab General: formulario del tipo de caja.
 *
 * - descripcion: editable por auto-guardado.
 * - sku / capacidad: solo lectura; se modifican desde el modal CambiarSkuTipoCaja.
 */
interface TabGeneralProps {
    form: HookModelo<TipoCaja>;
    tipoCaja: TipoCaja;
    publicar: EmitirEvento;
}

export const TabGeneral = ({
    form,
    tipoCaja,
    publicar = async () => {},
}: TabGeneralProps) => {

    const { uiProps } = form;

    return (
        <div className="TabGeneral">
            <quimera-formulario>
                <QInput label="Descripción" {...uiProps("descripcion")} />
                <QInput label="Prefijo" {...uiProps("prefijo")} maxLength={2} />
            </quimera-formulario>

            <div className="tipo-caja-sku-seccion">
                <dl>
                    <dt>SKU</dt>
                    <dd>
                        <ValorConEnlace href={urlFicha.articulo(tipoCaja.sku)} etiqueta={`Abrir artículo ${tipoCaja.sku ?? ""}`}>
                            {tipoCaja.sku ?? "—"}
                        </ValorConEnlace>
                    </dd>
                    <dt>Capacidad</dt>
                    <dd>{tipoCaja.capacidad !== null ? tipoCaja.capacidad : "—"}</dd>
                </dl>
                <QBoton
                    tamaño="pequeño"
                    onClick={() => publicar("cambio_de_sku_solicitado")}
                >
                    Cambiar SKU
                </QBoton>
            </div>
        </div>
    );
};
