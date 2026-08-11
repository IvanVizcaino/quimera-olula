import {
  QAutocompletar,
  QAutocompletarProps,
} from "@olula/componentes/moleculas/qautocompletar.tsx";
import { Criteria } from "@olula/lib/diseño.ts";
import { getItemsListaCategoria } from "../../categoria/infraestructura.ts";

type CategoriaProps = Omit<QAutocompletarProps, "obtenerOpciones">;

export const Categoria = ({
  descripcion = "",
  valor,
  nombre = "categoria",
  label = "Categoria",
  onChange,
  ...props
}: CategoriaProps) => {
  const obtenerOpciones = async (texto: string) => {
    const criteria: Criteria = {
      filtro: [["descripcion", "~", texto]],
      orden: ["id"],
      paginacion: { limite: 1000, pagina: 1 },
    };

    const categoriaes = await getItemsListaCategoria(
      criteria.filtro,
      criteria.orden
    );

    return categoriaes.map((categoria) => ({
      valor: categoria.id,
      descripcion: categoria.descripcion,
    }));
  };

  return (
    <QAutocompletar
      label={label}
      nombre={nombre}
      onChange={onChange}
      valor={valor}
      descripcion={descripcion}
      obtenerOpciones={obtenerOpciones}
      {...props}
    />
  );
};
