import { QSelect } from "@olula/componentes/atomos/qselect.tsx";

interface EstadoIncidenciaSanhigiaProps {
  valor: string;
  label?: string;
  nombre?: string;
  deshabilitado?: boolean;
  opcional?: boolean;
  onChange: (opcion: { valor: string; descripcion: string } | null) => void;
}

const opcionesEstadoIncidenciaSanhigia = [
  { valor: "Nueva", descripcion: "Nueva" },
  { valor: "Pendiente", descripcion: "Pendiente" },
  { valor: "Pendiente de datos", descripcion: "Pendiente de datos" },
  { valor: "Asignada", descripcion: "Asignada" },
  { valor: "Rechazada", descripcion: "Rechazada" },
  { valor: "Cerrada", descripcion: "Cerrada" },
];

export const EstadoIncidenciaSanhigia = ({
  valor,
  label = "Estado",
  nombre = "estado",
  deshabilitado = false,
  onChange,
  ...props
}: EstadoIncidenciaSanhigiaProps) => (
  <QSelect
    label={label}
    nombre={nombre}
    valor={valor}
    onChange={onChange}
    opciones={opcionesEstadoIncidenciaSanhigia}
    deshabilitado={deshabilitado}
    {...props}
  />
);
