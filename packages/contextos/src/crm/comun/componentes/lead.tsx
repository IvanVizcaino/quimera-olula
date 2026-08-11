import { QAutocompletar } from "@olula/componentes/moleculas/qautocompletar.tsx";
import { Filtro, Orden, Paginacion } from "@olula/lib/diseño.ts";
import { getLeads } from "../../lead/infraestructura.ts";

interface LeadSelectorProps {
  descripcion?: string;
  valor: string;
  nombre?: string;
  label?: string;
  deshabilitado?: boolean;
  onChange: (opcion: { valor: string; descripcion: string } | null) => void;
  [key: string]: unknown;
}

export const LeadSelector = ({
  descripcion = "",
  valor,
  nombre = "lead_id",
  label = "Seleccionar lead",
  deshabilitado = false,
  onChange,
  ...props
}: LeadSelectorProps) => {
  const obtenerOpciones = async (valor: string) => {
    if (valor.length < 3) return [];

    const criteria = {
      filtro: ["nombre", "~", valor],
      orden: ["id"],
      paginacion: { pagina: 1, limite: 10 },
    };

    const { datos: leads } = await getLeads(
      criteria.filtro as unknown as Filtro,
      criteria.orden as Orden,
      criteria.paginacion as Paginacion
    );

    return leads.map((lead) => ({
      valor: lead.id,
      descripcion: lead.nombre,
    }));
  };

  return (
    <QAutocompletar
      {...props}
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
