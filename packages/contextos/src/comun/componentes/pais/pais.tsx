import { QAutocompletar } from "@olula/componentes/moleculas/qautocompletar.tsx";
import { Filtro, Orden } from "@olula/lib/diseño.ts";
import { getPaises } from "./infraestructura.ts";

interface PaisSelectorProps {
  descripcion?: string;
  valor: string;
  nombre?: string;
  label?: string;
  deshabilitado?: boolean;
  onChange: (opcion: { valor: string; descripcion: string } | null) => void;
}

export const PaisSelector = ({
  descripcion = "",
  valor,
  nombre = "pais_id",
  label = "Seleccionar país",
  deshabilitado = false,
  onChange,
}: PaisSelectorProps) => {
  const obtenerOpciones = async (valor: string) => {
    if (valor.length < 2) return [];

    const criteria = {
      filtro: ["nombre", "~", valor],
      orden: ["id"],
    };

    const paises = await getPaises(
      criteria.filtro as unknown as Filtro,
      criteria.orden as Orden
    );

    return paises.datos.map((pais) => ({
      valor: pais.id,
      descripcion: pais.nombre,
    }));
  };

  return (
    <QAutocompletar
      label={label}
      nombre={nombre}
      onChange={onChange}
      valor={valor}
      autoSeleccion
      obtenerOpciones={obtenerOpciones}
      descripcion={descripcion}
      deshabilitado={deshabilitado}
    />
  );
};
