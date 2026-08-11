import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { ESTADOS_COMUNICACION } from "../comunicacion/diseño.ts";

interface EstadoComunicacionProps {
  valor: string;
  nombre?: string;
  label?: string;
  onChange: (opcion: { valor: string; descripcion: string } | null) => void;
}

const opcionesEstadoComunicacion = [
  { valor: ESTADOS_COMUNICACION.NO_LEIDA, descripcion: "No leida" },
  { valor: ESTADOS_COMUNICACION.LEIDA, descripcion: "Leida" },
];

export const EstadoComunicacion = ({
  valor,
  nombre = "estado",
  label = "Estado",
  onChange,
  ...props
}: EstadoComunicacionProps) => {
  return (
    <QSelect
      label={label}
      nombre={nombre}
      valor={valor}
      onChange={onChange}
      opciones={opcionesEstadoComunicacion}
      placeholder="Todas"
      {...props}
    />
  );
};
