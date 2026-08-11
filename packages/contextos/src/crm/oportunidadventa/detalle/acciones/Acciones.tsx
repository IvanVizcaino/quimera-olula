import { BorrarAccion } from "#/crm/accion/borrar/BorrarAccion.tsx";
import { nuevaAccionVacia } from "#/crm/accion/crear/crear.ts";
import { CrearAccion } from "#/crm/accion/crear/CrearAccion.tsx";
import { DetalleAccion } from "#/crm/accion/detalle/DetalleAccion.tsx";
import { Accion } from "#/crm/accion/diseño.ts";
import { metaTablaAccion } from "#/crm/accion/maestro/maestro.ts";
import { TarjetaAccionRapida } from "#/crm/accion/maestro/TarjetaAccionRapida.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { ListadoSemiControlado } from "@olula/componentes/maestro/ListadoSemiControlado.tsx";
import { QuimeraAcciones } from "@olula/componentes/moleculas/qacciones.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { listaEntidadesInicial } from "@olula/lib/ListaEntidades.js";
import { HookModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useEffect } from "react";
import { OportunidadVenta } from "../../diseño.ts";
import { getMaquina } from "./maquina.ts";

export const Acciones = ({
  oportunidad,
}: {
  oportunidad: HookModelo<OportunidadVenta>;
}) => {
  const { ctx, emitir } = useMaquina(getMaquina, {
    estado: "INICIAL",
    acciones: listaEntidadesInicial<Accion>(),
  });

  const { modelo } = oportunidad;

  const recargar = useCallback(async () => {
    await emitir("recarga_de_acciones_solicitada", modelo.id);
  }, [emitir, modelo.id]);

  useEffect(() => {
    recargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelo.id]);

  const publicarDetalle = useCallback(
    async (evento: string, payload?: unknown) => {
      await emitir(evento, payload);
    },
    [emitir]
  );

  return (
    <div className="TabAcciones">
      {ctx.estado === "CREANDO" && (
        <CrearAccion
          publicar={emitir}
          modeloVacio={{
            ...nuevaAccionVacia,
            oportunidad_id: modelo.id,
          }}
        />
      )}

      {ctx.estado === "BORRANDO" && ctx.acciones.activo && (
        <BorrarAccion publicar={emitir} accion={ctx.acciones.activo} />
      )}

      <ListadoSemiControlado
        metaTabla={metaTablaAccion}
        tarjeta={(accion) => (
          <TarjetaAccionRapida accion={accion} publicar={emitir} />
        )}
        modosDisponibles={["tarjetas"]}
        entidades={ctx.acciones.lista}
        totalEntidades={ctx.acciones.lista.length}
        renderAcciones={() => (
          <div className="maestro-botones">
            <QBoton onClick={() => emitir("creacion_de_accion_solicitada")}>
              Nueva
            </QBoton>
            <QBoton
              onClick={() => emitir("edicion_accion_solicitada")}
              deshabilitado={!ctx.acciones.activo}
            >
              Editar
            </QBoton>
            <QuimeraAcciones
              vertical
              acciones={[
                {
                  texto: "Borrar",
                  onClick: () => emitir("borrado_accion_solicitado"),
                  deshabilitado: !ctx.acciones.activo,
                  advertencia: true,
                },
              ]}
            />
          </div>
        )}
        seleccionada={ctx.acciones.activo ?? null}
        onSeleccion={(accion) => emitir("accion_seleccionada", accion)}
        criteriaInicial={criteriaDefecto}
        onCriteriaChanged={() => null}
      />

      <QModal
        nombre="editarAccion"
        abierto={ctx.estado === "EDITANDO" && Boolean(ctx.acciones.activo?.id)}
        titulo="Editar acción"
        onCerrar={() => publicarDetalle("accion_deseleccionada")}
        mostrarBotonCerrar={false}
        mostrarCabecera={false}
        anchoEstable
      >
        {ctx.acciones.activo?.id && (
          <DetalleAccion
            id={ctx.acciones.activo.id}
            publicar={publicarDetalle}
          />
        )}
      </QModal>
    </div>
  );
};
