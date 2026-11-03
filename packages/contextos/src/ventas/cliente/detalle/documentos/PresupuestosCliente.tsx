import { DetallePresupuesto } from "#/ventas/presupuesto/detalle/DetallePresupuesto.tsx";
import {
  metaTablaPresupuesto,
  Presupuesto,
} from "#/ventas/presupuesto/maestro/diseño.ts";
import { getMaquina } from "#/ventas/presupuesto/maestro/maquina.ts";
import { TarjetaMaestroPresupuesto } from "#/ventas/presupuesto/maestro/TarjetaMaestroPresupuesto.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { Criteria } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { useEffect } from "react";
import "./PresupuestosCliente.css";

const criteriaCliente = (clienteId: string): Criteria => ({
  ...criteriaDefecto,
  filtro: [["cliente_id", "=", clienteId]],
});

export const PresupuestosCliente = ({ clienteId }: { clienteId: string }) => {
  const { ctx, emitir } = useMaquina(getMaquina, {
    estado: "INICIAL",
    presupuestos: listaActivaEntidadesInicial<Presupuesto>(
      undefined,
      criteriaCliente(clienteId)
    ),
  });

  useEffect(() => {
    emitir("recarga_de_presupuestos_solicitada", criteriaCliente(clienteId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clienteId]);

  return (
    <div className="Presupuesto PresupuestosCliente">
      <MaestroDetalle<Presupuesto>
        Maestro={
          <Listado<Presupuesto>
            metaTabla={metaTablaPresupuesto}
            tarjeta={TarjetaMaestroPresupuesto}
            modoInicial="tarjetas"
            modosDisponibles={["tarjetas"]}
            mostrarFiltros={false}
            criteria={ctx.presupuestos.criteria}
            entidades={ctx.presupuestos.lista}
            totalEntidades={ctx.presupuestos.total}
            seleccionada={ctx.presupuestos.activo}
            onSeleccion={(payload) =>
              emitir("presupuesto_seleccionado", payload)
            }
            onCriteriaChanged={(payload) =>
              emitir("criteria_cambiado", payload)
            }
            onSiguientePagina={(payload) => emitir("siguiente_pagina", payload)}
          />
        }
        Detalle={
          <DetallePresupuesto id={ctx.presupuestos.activo} publicar={emitir} />
        }
        seleccionada={ctx.presupuestos.activo}
        modoDisposicion="modal"
        onCerrarDetalle={() => emitir("presupuesto_deseleccionado")}
      />
    </div>
  );
};
