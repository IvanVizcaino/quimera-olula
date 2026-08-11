import { QSelect } from "@olula/componentes/atomos/qselect.tsx";

interface TipoMotivoDevolucionProps {
  valor: string;
  onChange: (opcion: { valor: string; descripcion: string } | null) => void;
  getProps?: (campo: string) => Record<string, unknown>;
}

const opcionesTipoMotivoDevolucion = [
  { valor: "Interno", descripcion: "Interno" },
  { valor: "Externo", descripcion: "Externo" },
];

export const TipoMotivoDevolucion = ({
  valor,
  onChange,
  ...props
}: TipoMotivoDevolucionProps) => {
  return (
    <QSelect
      label="TipoMotivoDevolucion"
      nombre="TipoMotivoDevolucion"
      valor={valor}
      onChange={onChange}
      opciones={opcionesTipoMotivoDevolucion}
      {...props}
    />
  );
};
