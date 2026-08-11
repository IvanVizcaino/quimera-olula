import { QSelect } from "@olula/componentes/atomos/qselect.tsx";

interface TipoIncidenciaSanhigiaProps {
  valor: string;
  label?: string;
  nombre?: string;
  deshabilitado?: boolean;
  opcional?: boolean;
  onChange: (opcion: { valor: string; descripcion: string } | null) => void;
}

const opcionesTipoIncidenciaSanhigia = [
  { valor: "Proveedor", descripcion: "Producto" },
  { valor: "Transportista", descripcion: "Transporte" },
];

export const TipoIncidenciaSanhigia = ({
  valor,
  label = "Tipo",
  nombre = "tipo_incidencia",
  deshabilitado = false,
  onChange,
  ...props
}: TipoIncidenciaSanhigiaProps) => (
  <QSelect
    label={label}
    nombre={nombre}
    valor={valor}
    onChange={onChange}
    opciones={opcionesTipoIncidenciaSanhigia}
    deshabilitado={deshabilitado}
    {...props}
  />
);
