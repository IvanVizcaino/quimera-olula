import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { opcionesEstadoBaseOportunidad } from "../valores/estado_base_oportunidad.ts";

interface EstadoBaseOportunidadProps {
  valor: string;
  onChange: (opcion: { valor: string; descripcion: string } | null) => void;
  getProps?: (campo: string) => Record<string, unknown>;
}

export const EstadoBaseOportunidad = ({
  valor,
  onChange,
  getProps,
}: EstadoBaseOportunidadProps) => {
  return (
    <QSelect
      label="Estado Base"
      nombre="estadobase"
      valor={valor}
      onChange={onChange}
      opciones={opcionesEstadoBaseOportunidad}
      {...(getProps ? getProps("estadobase") : {})}
    />
  );
};
