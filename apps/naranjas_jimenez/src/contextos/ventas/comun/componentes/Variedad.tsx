import { QSelect } from "@olula/componentes/index.js";
import { QAutocompletarProps } from "@olula/componentes/moleculas/qautocompletar.tsx";
import { useEffect, useState } from "react";
import { getItemsListaSeleccionVariedad } from "../../variedad/infraestructura.ts";

type VariedadProps = Omit<QAutocompletarProps, "obtenerOpciones">;

type OpcionVariedad = {
  valor: string;
  descripcion: string;
};

export const Variedad = ({
  valor,
  nombre = "variedad",
  label = "Variedad",
  onChange,
  ...props
}: VariedadProps) => {
  const [opcionesVariedad, setOpcionesVariedad] = useState<OpcionVariedad[]>(
    []
  );

  useEffect(() => {
    const cargarOpcionesVariedad = async () => {
      const items = await getItemsListaSeleccionVariedad([], ["descripcion"], {
        pagina: 1,
        limite: 1000,
      });
      setOpcionesVariedad(
        items.map((item) => ({ valor: item.id, descripcion: item.descripcion }))
      );
    };
    cargarOpcionesVariedad();
  }, []);

  return (
    <QSelect
      label={label}
      nombre={nombre}
      valor={valor}
      onChange={onChange}
      opciones={opcionesVariedad}
      {...props}
    />
  );
};
