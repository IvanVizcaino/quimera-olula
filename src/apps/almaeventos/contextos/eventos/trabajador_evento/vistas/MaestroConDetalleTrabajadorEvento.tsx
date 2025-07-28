import { useContext, useState } from "react";

import { QBoton } from "../../../../../../componentes/atomos/qboton.tsx";
import { QIcono } from "../../../../../../componentes/atomos/qicono.tsx";
import { MetaTabla } from "../../../../../../componentes/atomos/qtabla.tsx";
import { Listado } from "../../../../../../componentes/maestro/Listado.tsx";
import { MaestroDetalleResponsive } from "../../../../../../componentes/maestro/MaestroDetalleResponsive.tsx";
import { ContextoError } from "../../../../../../contextos/comun/contexto.ts";
import { useLista } from "../../../../../../contextos/comun/useLista.ts";
import { Maquina, useMaquina } from "../../../../../../contextos/comun/useMaquina.ts";
import { TrabajadorEvento } from "../diseño.ts";
import {
  getTrabajadoresEvento,
  patchTrabajadorEvento
} from "../infraestructura.ts";
import { DetalleTrabajadorEvento } from "./DetalleTrabajadorEvento/DetalleTrabajadorEvento.tsx";
import "./MaestroConDetalleTrabajadorEvento.css";
import { TextoConTooltip } from "../../../comun/componentes/TextoConTooltip";

type Estado = "lista" | "alta";

export const MaestroConDetalleTrabajadorEvento = () => {
  const [estado, setEstado] = useState<Estado>("lista");
  const trabajadoresEvento = useLista<TrabajadorEvento>([]);
  const { intentar } = useContext(ContextoError);
  
  const maquina: Maquina<Estado> = {
    alta: {
      TRABAJADOR_EVENTO_CREADO: (payload: unknown) => {
        const trabajadorEvento = payload as TrabajadorEvento;
        trabajadoresEvento.añadir(trabajadorEvento);
        return "lista";
      },
      ALTA_CANCELADA: "lista",
    },
    lista: {
      ALTA_INICIADA: "alta",
      TRABAJADOR_EVENTO_CAMBIADO: (payload: unknown) => {        
        const trabajadorEvento = payload as TrabajadorEvento;
        trabajadoresEvento.modificar(trabajadorEvento);
      },
      TRABAJADOR_EVENTO_BORRADO: (payload: unknown) => {
        const trabajadorEvento = payload as TrabajadorEvento;
        trabajadoresEvento.eliminar(trabajadorEvento);
      },
      CANCELAR_SELECCION: () => {
        trabajadoresEvento.limpiarSeleccion();
      },
    },
  };

  const emitir = useMaquina(maquina, estado, setEstado);

  // Función para cambiar el estado de liquidado
  const cambiarEstadoLiquidado = async (trabajadorEvento: TrabajadorEvento) => {
    const nuevoValor = !trabajadorEvento.liquidado;
    await intentar(() => patchTrabajadorEvento(trabajadorEvento.id, { liquidado: nuevoValor }));
    // Actualizar la UI
    emitir("TRABAJADOR_EVENTO_CAMBIADO", {...trabajadorEvento, liquidado: nuevoValor});

  };

  const metaTablaTrabajadorEvento: MetaTabla<TrabajadorEvento> = [
    // { id: "id", cabecera: "Código" },
    { id: "nombre", cabecera: "Nombre", render: (t) => <TextoConTooltip texto={t.nombre} /> },
    { id: "descripcion", cabecera: "Evento", render: (t) => <TextoConTooltip texto={t.descripcion} /> },
    { id: "fecha", cabecera: "Fecha" },
    { id: "coste", cabecera: "Coste/Hora" },
    { 
      id: "liquidado", 
      cabecera: "Liquidado",
      tipo: "booleano",
      render: (trabajadorEvento) => (
        <div 
          className="accion-celda"
          onClick={() => {cambiarEstadoLiquidado(trabajadorEvento)}}
        >
          {trabajadorEvento.liquidado ? 
            <QIcono nombre="verdadero" color="green" /> : 
            <QIcono nombre="falso" color="red" />}
        </div>
      )
    }
  ];

  return (
    <div className="TrabajadorEvento">
      <MaestroDetalleResponsive<TrabajadorEvento>
        seleccionada={trabajadoresEvento.seleccionada}
        Maestro={
          <>
            <h2>Trabajadores por evento</h2>
            <div className="maestro-botones">
              <QBoton onClick={() => emitir("ALTA_INICIADA")}>Nuevo</QBoton>
            </div>
            <Listado
              metaTabla={metaTablaTrabajadorEvento}
              entidades={trabajadoresEvento.lista}
              setEntidades={trabajadoresEvento.setLista}
              seleccionada={trabajadoresEvento.seleccionada}
              setSeleccionada={trabajadoresEvento.seleccionar}
              cargar={getTrabajadoresEvento}
            />
          </>
        }
        Detalle={
          <DetalleTrabajadorEvento
            trabajadorEventoInicial={trabajadoresEvento.seleccionada}
            emitir={emitir}
          />
        }
      />
    </div>
  );
};