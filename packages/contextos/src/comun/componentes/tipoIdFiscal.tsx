import { opcionesTipoIdFiscal } from "#/valores/idfiscal.ts";
import { QSelect, QSelectProps } from "@olula/componentes/atomos/qselect.tsx";

type TipoIdFiscalProps = Omit<QSelectProps, "opciones" | "label" | "nombre"> & {
  valor: string;
  label?: string;
  nombre?: string;
  opciones?: { valor: string; descripcion: string }[];
};

export const TipoIdFiscal = ({
  valor,
  label = "Tipo Id Fiscal",
  nombre = "tipo_id_fiscal",
  opciones = opcionesTipoIdFiscal,
  ...props
}: TipoIdFiscalProps) => {
  const opcionesConValor =
    valor && !opciones.some((opcion) => opcion.valor === valor)
      ? [...opciones, { valor, descripcion: valor }]
      : opciones;

  return (
    <QSelect
      {...props}
      label={label}
      nombre={nombre}
      valor={valor}
      opciones={opcionesConValor}
    />
  );
};
