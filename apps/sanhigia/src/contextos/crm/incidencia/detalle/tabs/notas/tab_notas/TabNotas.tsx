import { QBoton } from "@olula/componentes/atomos/qboton.js";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { useEffect } from "react";
import { Nota } from "../diseño.ts";
import { BorrarNota } from "./BorrarNota.tsx";
import { CrearNota } from "./CrearNota.tsx";
import { TabNotasLista } from "./TabNotasLista.tsx";
import { getMaquina } from "./maquina.ts";

export const TabNotas = ({
  incidenciaId,
  agenteId,
}: {
  incidenciaId: string;
  agenteId: string;
}) => {
  const { ctx, emitir } = useMaquina(getMaquina, {
    estado: "lista" as const,
    notas: [] as Nota[],
    cargando: true,
    incidenciaId,
    agenteId,
  });

  useEffect(() => {
    if (incidenciaId) emitir("cargar_notas", incidenciaId, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incidenciaId]);

  const handleAgregarNota = () => {
    emitir("crear_nota_solicitado");
  };

  return (
    <div className="TabNotas">
      {ctx.estado === "lista" && (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "12px",
          }}
        >
          <QBoton onClick={handleAgregarNota}>Nueva nota</QBoton>
        </div>
      )}
      {ctx.estado === "creando" && (
        <CrearNota
          incidenciaId={incidenciaId}
          agenteId={agenteId}
          emitir={emitir}
        />
      )}
      {ctx.estado === "borrando" && ctx.notaSeleccionada && (
        <BorrarNota nota={ctx.notaSeleccionada} emitir={emitir} />
      )}
      <TabNotasLista
        notas={ctx.notas}
        cargando={ctx.cargando}
        onBorrar={(nota) => emitir("borrar_nota_solicitado", nota)}
      />
    </div>
  );
};
