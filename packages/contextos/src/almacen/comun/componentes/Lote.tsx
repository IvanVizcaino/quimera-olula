import { QAutocompletar } from "@olula/componentes/moleculas/qautocompletar.tsx";
import { RestAPI } from "@olula/lib/api/rest_api.js";
import { Criteria, Filtro } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.js";


interface LoteProps {
  valor: string;
  sku?: string;
  nombre?: string;
  label?: string;
  autoFocus?: boolean;
  ref?: React.RefObject<HTMLInputElement | null>;
  onChange: (opcion: { valor: string; descripcion: string } | null) => void;
}

export const Lote = ({
  valor,
  sku,
  nombre = "lote_id",
  label = "Lote",
  onChange,
  ...props
}: LoteProps) => {

    const obtenerOpciones = async (texto: string) => {

        const filtro:Filtro = sku
            ? {
                and: [
                    ['articulo_id', "=", sku],
                    ["id", "~", texto]
                ]
            }
            : [["id", "~", texto]]

        const criteria: Criteria = {
            ...criteriaDefecto,
            filtro,
            orden: ["id", "ASC"],
        };

        const lotes = await getTagsLote(criteria);

        return lotes.map((lote) => ({
            valor: lote.id,
            descripcion: lote.id,
        }));
    };

    return (
        <QAutocompletar
            label={label}
            nombre={nombre}
            onChange={onChange}
            valor={valor}
            obtenerOpciones={obtenerOpciones}
            descripcion={valor}
            {...props}
        />
    );
};


interface TagLoteApi {
    id: string;
}

const url = `/almacen/lote`;


const getTagsLote = async (criteria: Criteria): Promise<TagLoteApi[]> => {

    const respuesta = await RestAPI.getQuery<TagLoteApi, TagLoteApi>(
        url,
        criteria,
    )
    return respuesta.datos
};
