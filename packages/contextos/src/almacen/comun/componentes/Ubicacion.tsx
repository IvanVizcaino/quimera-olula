import { QAutocompletar } from "@olula/componentes/moleculas/qautocompletar.tsx";
import { RestAPI } from "@olula/lib/api/rest_api.js";
import { Criteria } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.js";


interface UbicacionProps {
  descripcion?: string;
  valor: string;
  nombre?: string;
  label?: string;
  autoFocus?: boolean;
  ref?: React.RefObject<HTMLInputElement | null>;
  onChange: (opcion: { valor: string; descripcion: string } | null) => void;
}

export const Ubicacion = ({
  descripcion = "",
  valor,
  nombre = "ubicacion_id2",
  label = "Ubicación",
  onChange,
  ...props
}: UbicacionProps) => {

    const obtenerOpciones = async (texto: string, id?: string) => {
        const criteria: Criteria = {
            ...criteriaDefecto,
            filtro: id
                ? [["id", "=", id]]
                : [["codigo", "~", texto]],
            orden: ["codigo", "ASC"],
        };

        const ubicaciones = await getTagsUbicacion(criteria);

        return ubicaciones.map((ubicacion) => ({
            valor: ubicacion.id,
            descripcion: ubicacion.codigo,
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

// INFRAESTRUCTURA
interface TagUbicacionApi {
    id: string;
    codigo: string;
}

const url = `/almacen/ubicacion`;


const getTagsUbicacion = async (criteria: Criteria): Promise<TagUbicacionApi[]> => {

    const respuesta = await RestAPI.getQuery<TagUbicacionApi, TagUbicacionApi>(
        url,
        criteria,
    )
    return respuesta.datos
};
