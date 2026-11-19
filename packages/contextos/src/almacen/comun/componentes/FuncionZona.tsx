import { QSelect } from "@olula/componentes/index.js";
import { QAutocompletarProps } from "@olula/componentes/moleculas/qautocompletar.tsx";
import { funcionesZona } from "../../zona/dominio.ts";

type FuncionZonaProps = Omit<QAutocompletarProps, "obtenerOpciones" | "label"> & { label?: string };

export const FuncionZona = ({
    valor,
    nombre = "funcion",
    label = "Función",
    onChange,
    ...props
}: FuncionZonaProps) => (
    <QSelect
        label={label}
        nombre={nombre}
        valor={valor}
        onChange={onChange}
        opciones={funcionesZona}
        {...props}
    />
);
