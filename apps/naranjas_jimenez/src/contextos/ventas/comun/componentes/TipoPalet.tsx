import { QSelect } from "@olula/componentes/index.js";
import { QAutocompletarProps } from "@olula/componentes/moleculas/qautocompletar.tsx";
import { Criteria } from "@olula/lib/diseño.js";
import { useEffect, useState } from "react";
import { ItemListaTipoPalet } from "../../tipo_palet/diseño.ts";
import { getItemsListaTipoPalet } from "../../tipo_palet/infraestructura.ts";

type TipoPaletProps = Omit<QAutocompletarProps, "obtenerOpciones">;

export const TipoPalet = ({
  valor,
  nombre = "tipo_palet",
  label = "Tipo Palet",
  onChange,
  ...props
}: TipoPaletProps) => {
  const [items, setItems] = useState<ItemListaTipoPalet[]>([]);

  const criteria: Criteria = {
      filtro: [],
      orden: ["descripcion", "ASC"],
      paginacion: { limite: 1000, pagina: 1 },
    };

  useEffect(() => {
    getItemsListaTipoPalet(criteria).then(setItems);
  }, []);

  const opciones = items.map((item) => ({
    valor: item.id,
    descripcion: item.descripcion,
  }));

  const handleChange = (
    opcion: { valor: string; descripcion: string } | null,
    e: React.ChangeEvent<HTMLElement>
  ) => {
    if (!opcion) {
      onChange?.(null, e);
      return;
    }
    const item = items.find((i) => i.id === opcion.valor);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onChange?.({ ...opcion, cantidadEnvase: item?.cantidadEnvase } as any, e);
  };

  return (
    <QSelect
      label={label}
      nombre={nombre}
      valor={valor}
      onChange={handleChange}
      opciones={opciones}
      {...props}
    />
  );
};
