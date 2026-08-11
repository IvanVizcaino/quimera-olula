import { QSelect } from "@olula/componentes/index.js";
import { QAutocompletarProps } from "@olula/componentes/moleculas/qautocompletar.tsx";

type TipoOrdenProps = Omit<QAutocompletarProps, "obtenerOpciones" | "label"> & { label?: string };

const TIPOS_ORDEN = [
    { valor: "ENTRADA", descripcion: "Entrada" },
    { valor: "SALIDA", descripcion: "Salida" },
    { valor: "TRASPASO", descripcion: "Traspaso" },
];

export const TipoOrden = ({
    valor,
    nombre = "tipoOrden",
    label = "Tipo de orden",
    onChange,
    ...props
}: TipoOrdenProps) => {
    return (
        <QSelect
            label={label}
            nombre={nombre}
            valor={valor}
            onChange={onChange}
            opciones={TIPOS_ORDEN}
            {...props}
        />
    );
};
