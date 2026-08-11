import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { useEffect } from "react";
import { Grupo } from "../diseño.ts";
import { ContextoDetalleGrupo, EstadoDetalleGrupo } from "./diseño.ts";
import { getMaquina } from "./maquina.ts";
import { ReglasOrganizadas } from "./Reglas/ReglasOrganizadas.tsx";
import "./ReglasGrupo.css";

export const ReglasGrupo = ({
  grupoSeleccionado,
}: {
  grupoSeleccionado: Grupo | null;
}) => {
  const { ctx, emitir } = useMaquina<EstadoDetalleGrupo, ContextoDetalleGrupo>(
    getMaquina,
    {
      estado: "INICIAL",
      grupoSeleccionado: null,
      reglasOrganizadas: [],
      categoriasAbiertas: {},
      reglasAbiertas: {},
    }
  );

  useEffect(() => {
    emitir("grupo_cambiado", grupoSeleccionado);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grupoSeleccionado?.id]);

  const nombreGrupo = grupoSeleccionado
    ? grupoSeleccionado.nombre ||
      (grupoSeleccionado as { descripcion?: string }).descripcion ||
      ""
    : "";

  return (
    <div className="ReglasGrupo">
      <h2>Reglas{nombreGrupo ? ` ${nombreGrupo}` : ""}</h2>
      <div className="ListaReglas">
        <ReglasOrganizadas
          reglasOrganizadas={ctx.reglasOrganizadas}
          grupoSeleccionado={grupoSeleccionado}
          categoriasAbiertas={ctx.categoriasAbiertas}
          emitir={emitir}
          reglasAbiertas={ctx.reglasAbiertas}
        />
      </div>
    </div>
  );
};
