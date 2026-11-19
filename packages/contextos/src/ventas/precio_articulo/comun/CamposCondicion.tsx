import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { UiProps } from "@olula/lib/useModelo.ts";
import { pvpIgnorado, tramoValido } from "../dominio.ts";
import "./CamposCondicion.css";

type Condicion = { cantidadMin: number; cantidadMax: number; dtoPorcentual: number; pvp: number };

/**
 * Tramo, descuento y precio neto, comunes al alta y al cambio.
 *
 * Con descuento el precio neto no se usa (el precio sale de la tarifa del
 * cliente o de la ficha del artículo), así que se deshabilita.
 */
export const CamposCondicion = ({
    uiProps,
    modelo,
}: {
    uiProps: (campo: string, secundario?: string) => UiProps;
    modelo: Condicion;
}) => {
    const errorTramo = tramoValido(modelo);

    return (
        <>
            <QInput label="Cantidad desde (0 = sin límite)" {...uiProps("cantidadMin")} />
            <QInput label="Cantidad hasta (0 = sin límite)" {...uiProps("cantidadMax")} />
            <QInput label="% Descuento" {...uiProps("dtoPorcentual")} />
            <QInput
                label="Precio neto"
                {...uiProps("pvp")}
                divisa="EUR"
                deshabilitado={pvpIgnorado(modelo)}
            />
            {errorTramo !== true && <span className="texto-validacion">{errorTramo}</span>}
            {pvpIgnorado(modelo) && (
                <p className="nota">
                    Con descuento se aplica sobre el precio de la tarifa del cliente o de la ficha del artículo.
                </p>
            )}
        </>
    );
};
