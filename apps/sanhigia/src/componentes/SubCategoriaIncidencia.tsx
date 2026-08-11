import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { Criteria } from "@olula/lib/diseño.ts";
import { useEffect, useState } from "react";
import { getSubCategorias } from "../contextos/crm/incidencia/infraestructura.ts";

interface SubCategoriaAPI {
  id: string;
  descripcion: string;
}

interface SubCategoriaIncidenciaProps {
  valor: string;
  label?: string;
  nombre?: string;
  categoriaIncidencia?: string;
  deshabilitado?: boolean;
  opcional?: boolean;
  onChange?: (
    opcion: {
      valor: string;
      descripcion: string;
    } | null
  ) => void;
  ref?: React.RefObject<HTMLInputElement | null>;
}

export const SubCategoriaIncidencia = ({
  valor,
  label = "Subcategoría",
  nombre = "subcategoria_incidencia",
  categoriaIncidencia = "",
  deshabilitado = false,
  onChange,
  ...props
}: SubCategoriaIncidenciaProps) => {
  const [opciones, setOpciones] = useState<SubCategoriaAPI[]>([]);

  useEffect(() => {
    const cargarSubCategorias = async () => {
      try {
        const criteria: Criteria = {
          filtro: [["codcategoria", categoriaIncidencia]],
          orden: ["id"],
          paginacion: { limite: 100, pagina: 1 },
        };
        const { datos } = await getSubCategorias(
          criteria.filtro,
          criteria.orden,
          {
            pagina: 1,
            limite: 100,
          }
        );
        setOpciones(datos);
      } catch (error) {
        console.error("Error cargando subcategorías:", error);
      }
    };

    cargarSubCategorias();
  }, [categoriaIncidencia]);

  const handleChange = (
    opcion: { valor: string; descripcion: string } | null
  ) => {
    if (opcion) {
      // const opcionCompleta = opciones.find((opt) => opt.id === opcion.valor);
      onChange?.({
        valor: opcion.valor,
        descripcion: opcion.descripcion,
      });
    } else {
      onChange?.(null);
    }
  };

  return (
    <QSelect
      label={label}
      nombre={nombre}
      valor={valor}
      onChange={handleChange}
      opciones={[
        { valor: "", descripcion: "-- Sin subcategoría --" },
        ...opciones.map((subcat) => ({
          valor: subcat.id,
          descripcion: `${subcat.descripcion}`,
        })),
      ]}
      deshabilitado={deshabilitado || opciones.length === 0}
      {...props}
    />
  );
};
