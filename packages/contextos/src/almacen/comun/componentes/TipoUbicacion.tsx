import { QSelect } from "@olula/componentes/index.js";
import { QAutocompletarProps } from "@olula/componentes/moleculas/qautocompletar.tsx";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { useEffect, useState } from "react";
import { getTiposUbicacion } from "../../tipo_ubicacion/infraestructura.ts";

type TipoUbicacionProps = Omit<QAutocompletarProps, "obtenerOpciones" | "label"> & { label?: string };

type OpcionTipo = { valor: string; descripcion: string };

const SIN_TIPO: OpcionTipo = { valor: "", descripcion: "(sin tipo)" };

export const TipoUbicacion = ({
    valor,
    nombre = "tipo_ubicacion_id",
    label = "Tipo de ubicación",
    onChange,
    ...props
}: TipoUbicacionProps) => {
    const [opciones, setOpciones] = useState<OpcionTipo[]>([SIN_TIPO]);

    useEffect(() => {
        getTiposUbicacion(criteriaDefecto).then((resultado) =>
            setOpciones([
                SIN_TIPO,
                ...resultado.datos.map((t) => ({ valor: t.id, descripcion: t.codigo })),
            ])
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
