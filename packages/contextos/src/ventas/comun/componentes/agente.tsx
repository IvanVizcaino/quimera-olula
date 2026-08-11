import { QAutocompletar } from "@olula/componentes/moleculas/qautocompletar.tsx";
import { Filtro, Orden } from "@olula/lib/diseño.ts";
import { getAgentes } from "../../agente/infraestructura.ts";

interface AgenteProps {
  descripcion?: string;
  valor: string;
  nombre?: string;
  label?: string;
  deshabilitado?: boolean;
  onChange: (opcion: { valor: string; descripcion: string } | null) => void;
}

export const Agente = ({
  descripcion = "",
  valor,
  nombre = "agente_id",
  label = "Agente",
  onChange,
  ...props
}: AgenteProps) => {
  const obtenerOpciones = async (valor: string) => {
    if (valor.length < 3) return [];

    const criteria = {
      filtro: ["nombre", "~", valor],
      orden: ["id"],
    };

    const agentes = await getAgentes(
      criteria.filtro as unknown as Filtro,
      criteria.orden as Orden
    );

    return agentes.map((agente) => ({
      valor: agente.id,
      descripcion: agente.nombre,
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
      {...props}
    />
  );
};
