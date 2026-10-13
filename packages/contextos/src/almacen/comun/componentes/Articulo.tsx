import { TagArticulo } from "#/ventas/articulo/diseño.ts";
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
  soloLectura?: boolean;
  /** Texto de cada opción del desplegable. Por defecto "referencia - descripción". */
  formatoOpcion?: (articulo: TagArticulo) => string;
  onChange: (opcion: { valor: string; descripcion: string; datos: TagArticulo } | null) => void;
}

export const Articulo = ({
  descripcion = "",
  valor,
  nombre = "referencia",
  label = "Artículo",
  onChange,
  formatoOpcion = (a) => `${a.id} - ${a.descripcion}`,
  ...props
}: ArticuloProps) => {
  const [descripcionResuelta, setDescripcionResuelta] = useState(descripcion);

  useEffect(() => {
    if (!valor) {
      setDescripcionResuelta(descripcion);
      return;
    }
    if (descripcion) {
      setDescripcionResuelta(descripcion);
      return;
    }
    getArticulo(valor).then((articulo) =>
      setDescripcionResuelta(articulo.descripcion)
    );
  }, [valor]); // eslint-disable-line react-hooks/exhaustive-deps

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
      descripcionOpcion: formatoOpcion(articulo),
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
