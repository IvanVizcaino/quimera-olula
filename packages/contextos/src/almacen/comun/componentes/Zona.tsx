import { QSelect } from "@olula/componentes/index.js";
import { QAutocompletarProps } from "@olula/componentes/moleculas/qautocompletar.tsx";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { useEffect, useState } from "react";
import { getZonas } from "../../zona/infraestructura.ts";

type ZonaProps = Omit<QAutocompletarProps, "obtenerOpciones" | "label"> & { label?: string };

type OpcionZona = {
    valor: string;
    descripcion: string;
};

export const Zona = ({
    valor,
    nombre = "zona_id",
    label = "Zona",
    onChange,
    ...props
}: ZonaProps) => {
    const [opciones, setOpciones] = useState<OpcionZona[]>([]);

    useEffect(() => {
        getZonas(criteriaDefecto).then((resultado) =>
            setOpciones(resultado.datos.map((z) => ({ valor: z.id, descripcion: z.codigo })))
        );
    }, []);

    return (
        <QSelect
            label={label}
            nombre={nombre}
            valor={valor}
            onChange={onChange}
            opciones={opciones}
            {...props}
        />
    );
};
