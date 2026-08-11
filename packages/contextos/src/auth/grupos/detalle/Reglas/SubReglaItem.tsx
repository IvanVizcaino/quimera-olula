import { EmitirEvento } from "@olula/lib/diseño.ts";
import { CategoriaReglas, ReglaAnidada } from "../../diseño.ts";
import { AccionesRegla } from "./Acciones.tsx";

const descripcionSubRegla = (descripcion: string): string => {
  const partes = descripcion.split(" - ");
  const detalle = partes.slice(2).join(" - ").trim();
  if (detalle) return detalle.replace(/_/g, " ");

  return descripcion.replace(/_/g, " ");
};

export const SubReglaItem = ({
  regla,
  padre,
  grupoId,
  reglaGeneral,
  emitir,
}: {
  regla: ReglaAnidada;
  padre?: ReglaAnidada;
  reglaGeneral?: CategoriaReglas;
  grupoId: string;
  emitir: EmitirEvento;
}) => (
  <div className="reglaItem subRegla">
    <div>{descripcionSubRegla(regla.descripcion)}</div>
    <AccionesRegla
      regla={regla}
      reglaPadre={padre}
      grupoId={grupoId}
      emitir={emitir}
      reglaGeneral={reglaGeneral}
    />
  </div>
);
