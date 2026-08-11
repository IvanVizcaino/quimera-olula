import { QSelect } from "@olula/componentes/atomos/qselect.tsx";

interface PrioridadIncidenciaSanhigiaProps {
  valor: string;
  label?: string;
  nombre?: string;
  deshabilitado?: boolean;
  opcional?: boolean;
  onChange: (opcion: { valor: string; descripcion: string } | null) => void;
}

const opcionesPrioridadIncidenciaSanhigia = [
  { valor: "Alta", descripcion: "Alta" },
  { valor: "Media", descripcion: "Media" },
  { valor: "Baja", descripcion: "Baja" },
];

export const PrioridadIncidenciaSanhigia = ({
  valor,
  label = "Prioridad",
  nombre = "prioridad",
  deshabilitado = false,
  onChange,
  ...props
}: PrioridadIncidenciaSanhigiaProps) => (
  <QSelect
    label={label}
    nombre={nombre}
    valor={valor}
    onChange={onChange}
    opciones={opcionesPrioridadIncidenciaSanhigia}
    deshabilitado={deshabilitado}
    {...props}
  />
);
