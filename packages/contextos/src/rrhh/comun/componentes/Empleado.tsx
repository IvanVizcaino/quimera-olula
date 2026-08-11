import { QAutocompletar } from "@olula/componentes/moleculas/qautocompletar.tsx";
import { Filtro, Orden } from "@olula/lib/diseño.ts";
import { useEffect, useState } from "react";
import { getTagsEmpleado } from "../../empleado/infraestructura.ts";

interface EmpleadoProps {
    descripcion?: string;
    valor: string;
    nombre?: string;
    label?: string;
    autoFocus?: boolean;
    ref?: React.RefObject<HTMLInputElement | null>;
    onChange: (opcion: { valor: string; descripcion: string } | null) => void;
}

export const Empleado = ({
    descripcion: descripcionProp = "",
    valor,
    nombre = "empleadoId",
    label = "Empleado",
    onChange,
    ...props
}: EmpleadoProps) => {

    const [descripcion, setDescripcion] = useState(descripcionProp);
    
    useEffect(() => {
        if (valor && !descripcionProp) {
            getTagsEmpleado([["id", "=", valor]], ["id"]).then((empleados) => {
                if (empleados[0]) setDescripcion(empleados[0].nombre);
            });
        } else {
            setDescripcion(descripcionProp);
        }
    }, [valor, descripcionProp]);
  
    const obtenerOpciones = async (texto: string) => {
    const criteria = {
        filtro: {
            or: [
                ["nombre_completo", "~", texto],
                ["id", "~", texto],
            ],
        },
        orden: ["id"],
    };

    const empleados = await getTagsEmpleado(
        criteria.filtro as unknown as Filtro,
        criteria.orden as Orden
    );

    return empleados.map((empleado) => ({
        valor: empleado.id,
        descripcion: empleado.nombre,
        descripcionOpcion: `${empleado.id} - ${empleado.nombre}`,
        datos: empleado,
    }));
  };

    return (
        <QAutocompletar
            label={`${label} ${valor}`}
            nombre={nombre}
            onChange={onChange}
            valor={valor}
            obtenerOpciones={obtenerOpciones}
            descripcion={descripcion}
            {...props}
        />
    );
};
