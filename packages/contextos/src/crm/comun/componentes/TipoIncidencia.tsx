import { QSelect } from "@olula/componentes/atomos/qselect.tsx";

interface TipoIncidenciaProps {
  valor: string;
  onChange: (opcion: { valor: string; descripcion: string } | null) => void;
  getProps?: (campo: string) => Record<string, unknown>;
}

const opcionesTipo = [
  { valor: "proveedor", descripcion: "Proveedor" },
  { valor: "transportista", descripcion: "Transportista" },
];

export const TipoIncidencia = ({
  valor,
  onChange,
  getProps,
}: TipoIncidenciaProps) => {
  return (
    <QSelect
      label="Tipo"
      nombre="tipo_incidencia"
      valor={valor}
      onChange={onChange}
      opciones={opcionesTipo}
      {...(getProps ? getProps("tipo_incidencia") : {})}
    />
  );
};
