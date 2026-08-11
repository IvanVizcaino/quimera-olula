import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { Detalle, QBoton, QInput } from "@olula/componentes/index.js";
import { EmitirEvento, Entidad } from "@olula/lib/diseño.js";
import { useModelo } from "@olula/lib/useModelo.js";
import { useEffect } from "react";
import { useParams } from "react-router";
import { TipoMotivoDevolucion } from "../../../../componentes/tipoMotivoDevolucion.tsx";
import { BorrarMotivoDevolucion } from "../borrar/BorrarMotivoDevolucion.tsx";
import { motivoDevolucionVacio } from "../dominio.ts";
import "./DetalleMotivoDevolucion.css";
import { metaMotivoDevolucion } from "./dominio.ts";
import { getMaquina } from "./maquina.ts";

export const DetalleMotivoDevolucion = ({
  id,
  publicar,
}: {
  id?: string;
  publicar: EmitirEvento;
}) => {
  const params = useParams();
  const motivoDevolucionId = id ?? params.id;
  const titulo = (motivoDevolucion: Entidad) =>
    motivoDevolucion.descripcion as string;

  const { ctx, emitir } = useMaquina(
    getMaquina,
    {
      estado: "INICIAL",
      motivoDevolucion: motivoDevolucionVacio,
    },
    publicar
  );

  const motivoDevolucion = useModelo(
    metaMotivoDevolucion,
    ctx.motivoDevolucion
  );
  const { modelo, modificado, uiProps, valido } = motivoDevolucion;

  useEffect(() => {
    if (motivoDevolucionId) {
      emitir("motivo_devolucion_id_cambiado", motivoDevolucionId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [motivoDevolucionId]);

  return (
    <Detalle
      id={motivoDevolucionId}
      obtenerTitulo={titulo}
      setEntidad={() => {}}
      entidad={modelo}
      cerrarDetalle={() => emitir("edicion_motivo_devolucion_cancelada", null)}
    >
      {!!motivoDevolucionId && (
        <div className="DetalleMotivoDevolucion">
          <div className="maestro-botones">
            <QBoton
              onClick={() => emitir("borrado_motivo_devolucion_solicitado")}
            >
              Borrar
            </QBoton>
          </div>

          <quimera-formulario>
            <TipoMotivoDevolucion {...uiProps("tipo")} />
            <QInput
              label="Descripción"
              {...uiProps("descripcion")}
              deshabilitado={modelo.otros}
            />
          </quimera-formulario>

          {modificado && (
            <div className="botones maestro-botones">
              <QBoton
                onClick={() => emitir("motivo_devolucion_cambiado", modelo)}
                deshabilitado={!valido}
              >
                Guardar
              </QBoton>
              <QBoton
                tipo="reset"
                variante="texto"
                onClick={() => emitir("edicion_motivo_devolucion_cancelada")}
              >
                Cancelar
              </QBoton>
            </div>
          )}

          {ctx.estado === "BORRANDO" && (
            <BorrarMotivoDevolucion
              publicar={emitir}
              motivoDevolucion={modelo}
            />
          )}
        </div>
      )}
    </Detalle>
  );
};
