import {
  LineaADevolver,
  VentaTpv,
  VentaTpvADevolver,
} from "#/tpv/venta/diseño.ts";
import {
  getVentaADevolver,
  patchDevolverVenta,
} from "#/tpv/venta/infraestructura.ts";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { MetaTabla, QModal } from "@olula/componentes/index.js";
import { ListadoSemiControlado } from "@olula/componentes/maestro/ListadoSemiControlado.tsx";
import { ContextoError } from "@olula/lib/contexto.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { useFocus } from "@olula/lib/useFocus.js";
import { useCallback, useContext, useState } from "react";
import { CantidadADevolver } from "./CantidadADevolver.tsx";
import "./DevolverVentaTpv.css";

export const DevolverVentaTpv = ({
  publicar,
  venta,
}: {
  publicar: EmitirEvento;
  venta: VentaTpv;
}) => {
  const { intentar } = useContext(ContextoError);

  const [ventaADevolver, setVentaADevolver] =
    useState<VentaTpvADevolver | null>(null);
  const [devolviendo, setDevolviendo] = useState(false);

  const buscarVenta = async (codVenta: string) => {
    const v = await intentar(() => getVentaADevolver(codVenta));
    setVentaADevolver(v);
  };

  const devolver = useCallback(
    async () => {
      if (!ventaADevolver) return;

      setDevolviendo(true);
      await intentar(() => patchDevolverVenta(venta.id, ventaADevolver));
      publicar("devolucion_hecha", ventaADevolver);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ventaADevolver, venta, publicar]
  );

  const cancelar = useCallback(() => {
    if (!devolviendo) publicar("devolucion_cancelada");
  }, [devolviendo, publicar]);

  const cambiarCantidadADevolver = (
    linea: LineaADevolver,
    aDevolver: number
  ) => {
    if (ventaADevolver) {
      setVentaADevolver({
        ...ventaADevolver,
        lineas: ventaADevolver.lineas.map((l) =>
          l.id === linea.id ? { ...l, aDevolver } : l
        ),
      });
    }
  };

  const limpiar = () => {
    setVentaADevolver(null);
  };

  const focus = useFocus();

  const puedoDevolver =
    ventaADevolver && ventaADevolver.lineas.some((l) => l.aDevolver > 0);

  return (
    <QModal
      abierto={true}
      nombre="mostrar"
      titulo={`Devolver venta ${ventaADevolver?.codigo || ""}`}
      onCerrar={cancelar}
    >
      <div className="DevolverVentaTpv">
        {!ventaADevolver && (
          <quimera-formulario>
            <div className="pista">
              Lee el código de la venta o tecléalo y pulsa Intro
            </div>
            <QInput
              label="Venta"
              nombre="venta"
              onEnterKeyUp={buscarVenta}
              ref={focus}
              autoFocus
            />
          </quimera-formulario>
        )}

        {ventaADevolver && (
          <ListadoSemiControlado
            metaTabla={getMetaTablaLineas(cambiarCantidadADevolver)}
            entidades={ventaADevolver.lineas}
            totalEntidades={ventaADevolver.lineas.length}
            cargando={false}
            seleccionada={null}
            onSeleccion={() => null}
            criteriaInicial={criteriaDefecto}
            onCriteriaChanged={() => null}
            modo="tabla"
          />
        )}

        <div className="botones maestro-botones ">
          <QBoton
            texto="Limpiar"
            onClick={limpiar}
            deshabilitado={!ventaADevolver}
          />
          <QBoton
            texto="Devolver"
            deshabilitado={!puedoDevolver}
            onClick={devolver}
          />
        </div>
      </div>
    </QModal>
  );
};

const getMetaTablaLineas = (
  cambiarCantidadADevolver: (linea: LineaADevolver, cantidad: number) => void
): MetaTabla<LineaADevolver> => {
  return [
    {
      id: "linea",
      cabecera: "Línea",
      render: (linea: LineaADevolver) =>
        `${linea.referencia}: ${linea.descripcion}`,
    },
    {
      id: "cantidad",
      cabecera: "Cantidad",
      tipo: "numero",
    },
    {
      id: "aDevolver",
      tipo: "numero",
      cabecera: "A Devolver",
      render: (linea: LineaADevolver) => (
        <CantidadADevolver
          linea={linea}
          onCantidadEditada={cambiarCantidadADevolver}
        />
      ),
    },
    { id: "pvp_unitario", cabecera: "Precio", tipo: "moneda" },
    {
      id: "dto_porcentual",
      cabecera: "% Dto.",
      tipo: "numero",
      render: (linea: LineaADevolver) =>
        linea.dto_porcentual ? `${linea.dto_porcentual}%` : "",
    },
    { id: "pvp_total", cabecera: "Total", tipo: "moneda" },
  ];
};
