import { QMultiCheckbox } from "@olula/componentes/atomos/qmulticheckbox.tsx";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { useEffect, useState } from "react";
import { Link } from "react-router";
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
    const [opciones, setOpciones] = useState<OpcionClase[] | null>(null);

    useEffect(() => {
        getClasesAlmacenamiento(criteriaDefecto).then((resultado) =>
            setOpciones(
                resultado.datos.map((c) => ({ valor: c.id, descripcion: `${c.codigo} - ${c.descripcion}` }))
            )
        );
    }, []);

    if (opciones === null) return null;

    if (opciones.length === 0) {
        return (
            <fieldset>
                {label}
                <p>
                    No hay clases de almacenamiento. Créalas en{" "}
                    <Link to="/almacen/clases_almacenamiento">Clases de almacenamiento</Link> y aparecerán aquí
                    para marcar las que admite la zona.
                </p>
            </fieldset>
        );
    }

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
