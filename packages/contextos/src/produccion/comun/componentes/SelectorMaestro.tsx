import { QSelect, QSelectProps } from "@olula/componentes/atomos/qselect.tsx";
import { puede } from "@olula/lib/dominio.ts";
import { useEffect, useState } from "react";

export type OpcionMaestro = { valor: string; descripcion: string };

export type PropsSelectorMaestro = Omit<QSelectProps, "opciones" | "label" | "nombre"> & {
    label?: string;
    nombre?: string;
    /** Descripción del valor actual, para mostrarlo sin poder leer el maestro. */
    descripcionActual?: string | null;
};

const sinValor: OpcionMaestro = { valor: "", descripcion: "—" };

/**
 * Selector de un maestro de producción. Sin la regla del maestro no se puede leer su lista:
 * solo se ofrece el valor actual.
 */
export const SelectorMaestro = ({
    cargar,
    regla,
    valor,
    descripcionActual,
    label,
    nombre,
    ...props
}: PropsSelectorMaestro & {
    label: string;
    nombre: string;
    cargar: () => Promise<OpcionMaestro[]>;
    regla: string;
}) => {
    const actual: OpcionMaestro[] = valor
        ? [{ valor: String(valor), descripcion: descripcionActual ? `${valor} - ${descripcionActual}` : String(valor) }]
        : [];
    const [opciones, setOpciones] = useState<OpcionMaestro[] | null>(null);

    useEffect(() => {
        if (!puede(regla)) return;
        cargar().then(setOpciones);
    }, [cargar, regla]);

    return (
        <QSelect
            label={label}
            nombre={nombre}
            valor={valor}
            opciones={[sinValor, ...(opciones ?? actual)]}
            {...props}
        />
    );
};
