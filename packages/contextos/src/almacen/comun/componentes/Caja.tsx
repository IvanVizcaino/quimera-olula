import { QAutocompletar } from "@olula/componentes/moleculas/qautocompletar.tsx";
import { RestAPI } from "@olula/lib/api/rest_api.js";
import { Criteria } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.js";


interface CajaProps {
  descripcion?: string;
  valor: string;
  nombre?: string;
  label?: string;
  autoFocus?: boolean;
  ref?: React.RefObject<HTMLInputElement | null>;
  onChange: (opcion: { valor: string; descripcion: string } | null) => void;
}

export const Caja = ({
  descripcion = "",
  valor,
  nombre = "cajaId",
  label = "Caja",
  onChange,
  ...props
}: CajaProps) => {

    const obtenerOpciones = async (texto: string) => {
        const criteria: Criteria = {
            ...criteriaDefecto,
            filtro: [["lpn", "~", texto]],
            orden: ["lpn", "ASC"],
        };

        const cajas = await getCajas(criteria);

        return cajas.map((caja) => ({
            valor: caja.id,
            descripcion: caja.lpn,
            // descripcionOpcion: caja.lpn,
            ...caja,
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
interface TagCajaApi {
    id: string;
    lpn: string;
    ubicacion_id: string;
    contenedor_id: string | null;
}

interface TagCaja {
    id: string;
    lpn: string;
    idUbicacion: string;
    idConenedor: string | null;
}

const url = `/almacen/caja`;

const tagCajaApiATagCaja = (caja: TagCajaApi): TagCaja => ({
    id: caja.id,
    lpn: caja.lpn,
    idUbicacion: caja.ubicacion_id,
    idConenedor: caja.contenedor_id,
})


const getCajas = async (criteria: Criteria): Promise<TagCaja[]> => {

    const respuesta = await RestAPI.getQuery<TagCaja, TagCajaApi>(
        url,
        criteria,
        tagCajaApiATagCaja,
    )
    return respuesta.datos
};
