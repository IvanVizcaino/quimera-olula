import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import {
  OpcionGrupoIvaNegocio,
  useOpcionesGrupoIvaNegocio,
} from "./useOpcionesGrupoIvaNegocio.ts";

interface GrupoIvaNegocioProps {
  valor: string;
  label?: string;
  nombre?: string;
  onChange: (opcion: OpcionGrupoIvaNegocio | null) => void;
}

export const GrupoIvaNegocio = ({
  valor,
  label = "Grupo IVA negocio",
  nombre = "grupo_iva_negocio_id",
  onChange,
  ...props
}: GrupoIvaNegocioProps) => {
  const opciones = useOpcionesGrupoIvaNegocio();

  return (
    <QSelect
      {...props}
      label={label}
      nombre={nombre}
      valor={valor}
      onChange={onChange}
      opciones={opciones}
    />
  );
};
