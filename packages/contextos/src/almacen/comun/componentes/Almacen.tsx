import { QSelect } from "@olula/componentes/index.js";
import { QAutocompletarProps } from "@olula/componentes/moleculas/qautocompletar.tsx";
import { Filtro, Orden } from "@olula/lib/diseño.ts";
import { useEffect, useState } from "react";
import { obtenerAlmacenes } from "../../almacen/infraestructura.ts";

type AlmacenProps = Omit<QAutocompletarProps, "obtenerOpciones" | "label"> & { label?: string };

type OpcionAlmacen = {
  valor: string;
  descripcion: string;
};

export const Almacen = ({
  valor,
  nombre = "codalmacen",
  label = "Almacén",
  onChange,
  ...props
}: AlmacenProps) => {
  const [opciones, setOpciones] = useState<OpcionAlmacen[]>([]);

  useEffect(() => {
    obtenerAlmacenes(undefined as unknown as Filtro, undefined as unknown as Orden).then(
      (almacenes) =>
        setOpciones(almacenes.map((a) => ({ valor: a.id, descripcion: a.nombre })))
    );
  }, []);

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
