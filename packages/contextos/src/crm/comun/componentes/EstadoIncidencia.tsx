import { QSelect } from "@olula/componentes/atomos/qselect.tsx";

interface EstadoProps {
  valor: string;
  onChange: (opcion: { valor: string; descripcion: string } | null) => void;
  getProps?: (campo: string) => Record<string, unknown>;
}

export const opcionesEstadoIncidencia = [
  { valor: "nueva", descripcion: "Nueva" },
  { valor: "en_espera", descripcion: "En espera" },
  { valor: "asignada", descripcion: "Asignada" },
  { valor: "rechazada", descripcion: "Rechazada" },
  { valor: "cerrada", descripcion: "Cerrada" },
];

const opcionesEstado = opcionesEstadoIncidencia;

export const descripcionEstadoIncidencia = (estado: string): string =>
  opcionesEstadoIncidencia.find((o) => o.valor === estado)?.descripcion ??
  estado;

export const EstadoIncidencia = ({
  valor,
  onChange,
  ...props
}: EstadoProps) => {
  return (
    <QSelect
      label="Estado"
      nombre="estado"
      valor={valor}
      onChange={onChange}
      opciones={opcionesEstado}
      {...props}
    />
  );
};
