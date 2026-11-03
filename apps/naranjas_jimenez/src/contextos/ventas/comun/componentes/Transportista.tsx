import { QSelect } from "@olula/componentes/index.js";
import { QAutocompletarProps } from "@olula/componentes/moleculas/qautocompletar.tsx";
import { Criteria } from "@olula/lib/diseño.js";
import { useEffect, useState } from "react";
import { ItemListaTransportista } from "../../transportista/diseño.ts";
import { getItemsListaTransportista } from "../../transportista/infraestructura.ts";

type TransportistaProps = Omit<QAutocompletarProps, "obtenerOpciones">;

export const Transportista = ({
  valor,
  nombre = "transportista",
  label = "Transportista",
  onChange,
  ...props
}: TransportistaProps) => {
  const [items, setItems] = useState<ItemListaTransportista[]>([]);

  const criteria: Criteria = {
    filtro: [],
    orden: ["descripcion", "ASC"],
    paginacion: { limite: 1000, pagina: 1 },
  };

  useEffect(() => {
    getItemsListaTransportista(criteria).then(setItems);
  }, []);

  const opciones = items.map((item) => ({
    valor: item.id,
    descripcion: item.descripcion,
  }));

  return (
    <QSelect
      label={label}
      nombre={nombre}
      valor={valor}
      onChange={onChange}
      opciones={opciones}
      {...props}
    />
  );
};
