import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { EmitirEvento, Entidad } from "@olula/lib/diseño.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useEffect } from "react";
import { useParams } from "react-router";
import { BorrarArticulo } from "../borrar/BorrarArticulo.tsx";
import { articuloVacio, metaArticulo } from "./dominio.ts";
import { getMaquina } from "./maquina.ts";

const titulo = (articulo: Entidad) => articulo.descripcion as string;

export const DetalleArticulo = ({
  id,
  publicar = async () => {},
}: {
  id?: string;
  publicar?: EmitirEvento;
}) => {
  const params = useParams();
  const articuloId = id ?? params.id;

  const { ctx, emitir } = useMaquina(
    getMaquina,
    {
      estado: "INICIAL",
      articulo: articuloVacio(),
      articuloInicial: articuloVacio(),
    },
    publicar
  );

  const articulo = useModelo(metaArticulo, ctx.articulo);

  useEffect(() => {
    emitir("articulo_id_cambiado", articuloId, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articuloId]);

  const { estado } = ctx;
  const { modificado, valido } = articulo;

  const handleGuardar = useCallback(() => {
    emitir("edicion_de_articulo_lista", articulo.modelo);
  }, [emitir, articulo]);

  const handleCancelar = useCallback(() => {
    emitir("edicion_de_articulo_cancelada");
  }, [emitir]);

  if (!ctx.articulo.id) return null;

  return (
    <Detalle
      id={ctx.articulo.id}
      obtenerTitulo={titulo}
      setEntidad={() => {}}
      entidad={ctx.articulo}
      cerrarDetalle={() => emitir("articulo_deseleccionado", null)}
    >
      <div className="DetalleArticulo">
        <div className="maestro-botones">
          <QBoton onClick={() => emitir("borrado_solicitado")} variante="texto">
            Borrar
          </QBoton>
        </div>
        <Tabs
          children={[
            <Tab
              key="tab-1"
              label="Datos"
              children={
                <quimera-formulario>
                  <QInput
                    label="Descripción"
                    {...articulo.uiProps("descripcion")}
                  />
                </quimera-formulario>
              }
            />,
          ]}
        />
        {modificado && (
          <div className="botones maestro-botones">
            <QBoton onClick={handleGuardar} deshabilitado={!valido}>
              Guardar
            </QBoton>
            <QBoton tipo="reset" variante="texto" onClick={handleCancelar}>
              Cancelar
            </QBoton>
          </div>
        )}
        {estado === "BORRANDO_ARTICULO" && (
          <BorrarArticulo
            articuloId={ctx.articulo.id}
            publicar={emitir}
            onCancelar={() => emitir("borrado_cancelado")}
          />
        )}
      </div>
    </Detalle>
  );
};
