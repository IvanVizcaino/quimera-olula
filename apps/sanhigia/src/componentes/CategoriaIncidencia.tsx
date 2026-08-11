import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { Filtro } from "@olula/lib/diseño.ts";
import { useEffect, useState } from "react";
import { getCategorias } from "../contextos/crm/incidencia/infraestructura.ts";

interface CategoriaAPI {
  id: string;
  descripcion: string;
  tipo_causante: string;
}

interface CategoriaIncidenciaProps {
  valor: string;
  label?: string;
  nombre?: string;
  deshabilitado?: boolean;
  opcional?: boolean;
  onChange?: (
    opcion: {
      valor: string;
      descripcion: string;
      tipoIncidencia?: string;
    } | null
  ) => void;
  ref?: React.RefObject<HTMLInputElement | null>;
}

export const CategoriaIncidencia = ({
  valor,
  label = "Categoría",
  nombre = "categoria_incidencia",
  deshabilitado = false,
  onChange,
  ...props
}: CategoriaIncidenciaProps) => {
  const [opciones, setOpciones] = useState<CategoriaAPI[]>([]);

  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        const filtro = {
          or: [
            ["shtipocausante", "Proveedor"],
            ["shtipocausante", "Transportista"],
          ],
        } as unknown as Filtro;
        const { datos } = await getCategorias(filtro, [], {
          pagina: 1,
          limite: 100,
        });
        setOpciones(datos);
      } catch (error) {
        console.error("Error cargando categorías:", error);
      }
    };

    cargarCategorias();
  }, []);

  const handleChange = (
    opcion: { valor: string; descripcion: string } | null
  ) => {
    if (opcion) {
      const opcionCompleta = opciones.find((opt) => opt.id === opcion.valor);
      onChange?.({
        valor: opcion.valor,
        descripcion: opcion.descripcion,
        tipoIncidencia: opcionCompleta?.tipo_causante,
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
      opciones={opciones.map((cat) => ({
        valor: cat.id,
        descripcion: `${cat.descripcion} (${cat.id})`,
      }))}
      deshabilitado={deshabilitado}
      {...props}
    />
  );
};
