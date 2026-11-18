import { QSelect } from "@olula/componentes/index.js";
import { QAutocompletarProps } from "@olula/componentes/moleculas/qautocompletar.tsx";

type OpcionFijaProps = Omit<
    QAutocompletarProps,
    "obtenerOpciones" | "label" | "nombre"
> & {
    label?: string;
    nombre?: string;
};

/**
 * `co_i_mayor.orden1` solo ofrece asiento o fecha, a diferencia del libro
 * diario. Los valores son los literales que guarda Eneboo.
 */
const CRITERIOS_ORDEN_MAYOR = [
    { valor: "Fecha", descripcion: "Fecha" },
    { valor: "Asiento", descripcion: "Asiento" },
];

export const CriterioOrdenMayor = ({
    valor,
    nombre = "orden",
    label = "Criterio",
    onChange,
    ...props
}: OpcionFijaProps) => (
    <QSelect
        label={label}
        nombre={nombre}
        valor={valor}
        onChange={onChange}
        opciones={CRITERIOS_ORDEN_MAYOR}
        {...props}
    />
);
