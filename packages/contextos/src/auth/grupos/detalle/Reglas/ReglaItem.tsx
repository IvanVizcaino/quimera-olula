import { EmitirEvento } from "@olula/lib/diseño.ts";
import { CategoriaReglas, ReglaAnidada } from "../../diseño.ts";
import { AccionesRegla } from "./Acciones.tsx";
import { SubReglaItem } from "./SubReglaItem.tsx";

export const ReglaItem = ({
  regla,
  grupoId,
  emitir,
  abierta,
  reglaGeneral,
}: {
  regla: ReglaAnidada;
  grupoId: string;
  emitir: EmitirEvento;
  abierta: boolean;
  reglaGeneral?: CategoriaReglas;
}) => (
  <div className="categoria-item">
    <div className="reglaItem">
      {regla.hijos && regla.hijos.length > 0 && (
        <span
          className={"reglaToggle" + (abierta ? " abierto" : "")}
          onClick={() => emitir("TOGGLE_REGLA", regla.id)}
          style={{ cursor: "pointer", marginRight: 8 }}
        >
          {abierta ? "▼" : "►"}
        </span>
      )}
      <div className="reglaDescripcion">
        {regla.descripcion.split(" - ")[1]?.trim().replace(/_/g, " ") ||
          regla.descripcion}
      </div>
      <AccionesRegla
        regla={regla}
        grupoId={grupoId}
        emitir={emitir}
        reglaGeneral={reglaGeneral}
      />
    </div>
    {regla.hijos &&
      regla.hijos.length > 0 &&
      abierta &&
      regla.hijos.map((hijo) => (
        <SubReglaItem
          key={hijo.id}
          regla={hijo}
          padre={regla}
          grupoId={grupoId}
          emitir={emitir}
          reglaGeneral={reglaGeneral}
        />
      ))}
  </div>
);
