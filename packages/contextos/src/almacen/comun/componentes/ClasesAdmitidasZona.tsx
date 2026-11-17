import { QMultiCheckbox } from "@olula/componentes/atomos/qmulticheckbox.tsx";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { useEffect, useState } from "react";
import { getClasesAlmacenamiento } from "../../clase_almacenamiento/infraestructura.ts";

type ClasesAdmitidasZonaProps = Omit<Parameters<typeof QMultiCheckbox>[0], "opciones" | "label" | "nombre"> & {
    label?: string;
    nombre?: string;
};

type OpcionClase = { valor: string; descripcion: string };

/** Selección múltiple de las clases de almacenamiento que admite una zona. */
export const ClasesAdmitidasZona = ({
    valor,
    nombre = "clasesAdmitidas",
    label = "Clases admitidas",
    ...props
}: ClasesAdmitidasZonaProps) => {
    const [opciones, setOpciones] = useState<OpcionClase[]>([]);

    useEffect(() => {
        getClasesAlmacenamiento(criteriaDefecto).then((resultado) =>
            setOpciones(
                resultado.datos.map((c) => ({ valor: c.id, descripcion: `${c.codigo} - ${c.descripcion}` }))
            )
        );
    }, []);

    return (
        <QMultiCheckbox
            {...props}
            label={label}
            nombre={nombre}
            valor={(Array.isArray(valor) ? valor : []) as unknown as string}
            opciones={opciones}
        />
    );
};
