import { QAutocompletar } from "@olula/componentes/moleculas/qautocompletar.tsx";
import { RestAPI } from "@olula/lib/api/rest_api.js";
import { Criteria } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import ApiUrls from "../urls.js";


interface ModulosProps {
  descripcion?: string;
  valor: string;
  nombre?: string;
  label?: string;
  autoFocus?: boolean;
  ref?: React.RefObject<HTMLInputElement | null>;
  onChange: (opcion: { valor: string; descripcion: string } | null) => void;
}

export const AutocompletarIdDescripcion = ({
  descripcion = "",
  valor,
  nombre = "modulo_id",
  label = "Id. Módulo",
  onChange,
  ...props
}: ModulosProps) => {

    const obtenerOpciones = async (texto: string) => {
        const criteria: Criteria = {
            ...criteriaDefecto,
            filtro: {
                or: [
                    ["campo_string", "~", texto],
                    ["id", "~", texto], // Quitar si el ID no es un campo de busqueda
                ],
            },
            orden: ["campo_string", "ASC"],
        };

        const modulos = await getTagsModulo(criteria);

        return modulos.map((modulo) => ({
            valor: modulo.id,
            descripcion: modulo.campo_string,
            // [OPCIONAL] Si se informa, se toma en lugar de descripción para el listado de autocompletar
            descripcionOpcion: `${modulo.id} - ${modulo.campo_string}`,
            // [OPCIONAL] Podemos guardar también módulo / tag entero si necesitamos más datos
            datos: modulo,
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
interface TagModuloApi {
    id: string;
    campo_string: string;
    campo_numero: string
}

// Modificar si hay una URL específica para los tags
const url = new ApiUrls().MODULO;


const getTagsModulo = async (criteria: Criteria): Promise<TagModuloApi[]> => {

    const respuesta = await RestAPI.getQuery<TagModuloApi, TagModuloApi>(
        url, 
        criteria,
        // tagModuloDesdeApi,
    )
    return respuesta.datos
};