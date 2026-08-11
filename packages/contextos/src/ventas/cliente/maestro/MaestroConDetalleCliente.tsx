import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { useEffect } from "react";
import { CrearCliente } from "../crear/CrearCliente.tsx";
import { DetalleCliente } from "../detalle/DetalleCliente.tsx";
import { Cliente } from "../diseño.ts";
import { metaTablaCliente } from "./diseño.ts";
import { TarjetaCliente } from "./TarjetaCliente.tsx";
import "./MaestroConDetalleCliente.css";
import { getMaquina } from "./maquina.ts";

export const MaestroConDetalleCliente = () => {
  const { id, criteria } = getUrlParams();

  const { ctx, emitir } = useMaquina(getMaquina, {
    estado: "INICIAL",
    clientes: listaActivaEntidadesInicial<Cliente>(id, criteria),
  });

  useUrlParams(ctx.clientes.activo, ctx.clientes.criteria);

  useEffect(() => {
    emitir("recarga_de_clientes_solicitada", ctx.clientes.criteria);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="Cliente">
      <MaestroDetalle<Cliente>
        Maestro={
          <>
            <h2>Clientes</h2>
            <Listado<Cliente>
              metaTabla={metaTablaCliente}
              tarjeta={TarjetaCliente}
              modoInicial="tarjetas"
              criteria={ctx.clientes.criteria}
              entidades={ctx.clientes.lista}
              totalEntidades={ctx.clientes.total}
              seleccionada={ctx.clientes.activo}
              renderAcciones={() => (
                <div className="maestro-botones">
                  <QBoton onClick={() => emitir("creacion_solicitada")}>
                    Nuevo Cliente
                  </QBoton>
                </div>
              )}
              onSeleccion={(payload) => emitir("cliente_seleccionado", payload)}
              onCriteriaChanged={(payload) =>
                emitir("criteria_cambiado", payload)
              }
              onSiguientePagina={(payload) =>
                emitir("siguiente_pagina", payload)
              }
            />
          </>
        }
        Detalle={<DetalleCliente id={ctx.clientes.activo} publicar={emitir} />}
        seleccionada={ctx.clientes.activo}
        modoDisposicion="maestro-50"
      />

      {ctx.estado === "CREANDO_CLIENTE" && (
        <CrearCliente
          publicar={emitir}
          onCancelar={() => emitir("creacion_cancelada")}
        />
      )}
    </div>
  );
};
