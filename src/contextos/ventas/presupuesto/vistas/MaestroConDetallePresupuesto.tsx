import { useState } from "react";
import { Listado } from "../../../../componentes/maestro/Listado.tsx";
import { Entidad } from "../../../comun/diseño.ts";
import { actualizarEntidadEnLista } from "../../../comun/dominio.ts";
import { Presupuesto } from "../diseño.ts";
import { getPresupuestos } from "../infraestructura.ts";
import "./MaestroConDetallePresupuesto.css";

import { QBoton } from "../../../../componentes/atomos/qboton.tsx";
import { QModal } from "../../../../componentes/moleculas/qmodal.tsx";
import { AltaPresupuesto } from "./AltaPresupuesto.tsx";
import { DetallePresupuesto } from "./DetallePresupuesto.tsx";

const metaTablaPresupuesto = [
  {
    id: "codigo",
    cabecera: "Código",
    render: (entidad: Entidad) => entidad.codigo as string,
  },
  {
    id: "cliente",
    cabecera: "Cliente",
    render: (entidad: Entidad) => entidad.nombre_cliente as string,
  },
  {
    id: "total",
    cabecera: "Total",
    render: (entidad: Entidad) => entidad.total as string,
  },
];

export const MaestroConDetallePresupuesto = () => {
  const [entidades, setEntidades] = useState<Presupuesto[]>([]);
  const [seleccionada, setSeleccionada] = useState<Presupuesto | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  const actualizarEntidad = (entidad: Presupuesto) => {
    setEntidades(actualizarEntidadEnLista<Presupuesto>(entidades, entidad));
  };

  const onCrearPresupuesto = () => {
    setMostrarModal(true);
  };

  const onPresupuestoCreado = (nuevoPresupuesto: Presupuesto) => {
    setEntidades([...entidades, nuevoPresupuesto]);
    setMostrarModal(false);
  };

  const onCancelar = () => {
    setMostrarModal(false);
  };

  return (
    <div className="MaestroConDetalle" style={{ display: "flex", gap: "2rem" }}>
      <div className="Maestro" style={{ flexBasis: "50%", overflow: "auto" }}>
        <h2>Presupuestos</h2>
        <Listado
          metaTabla={metaTablaPresupuesto}
          entidades={entidades}
          setEntidades={setEntidades}
          seleccionada={seleccionada}
          setSeleccionada={setSeleccionada}
          cargar={getPresupuestos}
        />
        <QBoton onClick={onCrearPresupuesto}>Crear Presupuesto</QBoton>
      </div>
      <div className="Detalle" style={{ flexBasis: "50%", overflow: "auto" }}>
        <DetallePresupuesto
          presupuestoInicial={seleccionada}
          onEntidadActualizada={actualizarEntidad}
        />
      </div>

      <QModal nombre="modal" abierto={mostrarModal} onCerrar={onCancelar}>
        <AltaPresupuesto
          onPresupuestoCreado={onPresupuestoCreado}
          onCancelar={onCancelar}
        />
      </QModal>
    </div>
  );
};
