import {
  getArticulo,
  getTagsArticulo,
} from "#/ventas/articulo/infraestructura.ts";
import { QAutocompletar } from "@olula/componentes/moleculas/qautocompletar.tsx";
import { Filtro, Orden } from "@olula/lib/diseño.ts";
import { useEffect, useState } from "react";

interface ArticuloProps {
  descripcion?: string;
  valor: string;
  nombre?: string;
  label?: string;
  autoFocus?: boolean;
  deshabilitado?: boolean;
  opcional?: boolean;
  ref?: React.RefObject<HTMLInputElement | null>;
  onChange: (opcion: { valor: string; descripcion: string } | null) => void;
}

export const Articulo = ({
  descripcion = "",
  valor,
  nombre = "referencia",
  label = "Artículo",
  onChange,
  ...props
}: ArticuloProps) => {
  const [descripcionResuelta, setDescripcionResuelta] = useState(descripcion);

  useEffect(() => {
    setDescripcionResuelta(descripcion);
  }, [descripcion]);

  useEffect(() => {
    if (!valor || descripcion) return;

    getArticulo(valor).then((articulo) =>
      setDescripcionResuelta(articulo.descripcion)
    );
  }, [valor, descripcion]);

  const obtenerOpciones = async (texto: string) => {
    const criteria = {
      filtro: {
        or: [
          ["descripcion", "~", texto],
          ["id", "~", texto],
        ],
      },
      orden: ["id"],
    };

    const articulos = await getTagsArticulo(
      criteria.filtro as unknown as Filtro,
      criteria.orden as Orden
    );

    return articulos.map((articulo) => ({
      valor: articulo.id,
      descripcion: articulo.descripcion,
      descripcionOpcion: `${articulo.id} - ${articulo.descripcion}`,
      datos: articulo,
    }));
  };

  return (
    <QAutocompletar
      label={`${label} ${valor}`}
      nombre={nombre}
      onChange={onChange}
      valor={valor}
      obtenerOpciones={obtenerOpciones}
      descripcion={descripcionResuelta}
      {...props}
    />
  );
};
