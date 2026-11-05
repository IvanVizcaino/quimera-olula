import { QAutocompletar } from "@olula/componentes/moleculas/qautocompletar.tsx";
import { RestAPI } from "@olula/lib/api/rest_api.js";
import { Criteria } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.js";


interface SkuProps {
  descripcion?: string;
  valor: string;
  nombre?: string;
  label?: string;
  autoFocus?: boolean;
  ref?: React.RefObject<HTMLInputElement | null>;
  onChange: (opcion: { valor: string; descripcion: string } | null) => void;
}

export const Sku = ({
  descripcion = "",
  valor,
  nombre = "sku",
  label = "SKU",
  onChange,
  ...props
}: SkuProps) => {

    const obtenerOpciones = async (texto: string) => {
        const criteria: Criteria = {
            ...criteriaDefecto,
            filtro: [["id", "~", texto]],
            orden: ["id", "ASC"],
        };

        const articulos = await getArticulosAlmacen(criteria);

        return articulos.map((articulo) => ({
            valor: articulo.id,
            descripcion: `${articulo.id} - ${articulo.descripcion}`,
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
interface ArticuloAlmacenApi {
    id: string;
    descripcion: string;
}

const url = `/almacen/articulo`;

const getArticulosAlmacen = async (criteria: Criteria): Promise<ArticuloAlmacenApi[]> => {
    const respuesta = await RestAPI.getQuery<ArticuloAlmacenApi, ArticuloAlmacenApi>(
        url,
        criteria,
    );
    return respuesta.datos;
};
