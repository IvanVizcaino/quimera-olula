import { VentaTpv } from "#/tpv/venta/diseño.ts";
import {
  clienteNoRegistradoDesdeVenta,
  metaModeloClienteVentaNoRegistrado,
  ModeloClienteVentaNoRegistrado,
} from "#/ventas/comun/componentes/moleculas/ClienteVenta/cliente_venta.ts";
import { ClienteVentaNoRegistrado } from "#/ventas/comun/componentes/moleculas/ClienteVenta/ClienteVentaNoRegistrado.tsx";
import { QBoton, QModal } from "@olula/componentes/index.js";
import { useModelo } from "@olula/lib/useModelo.js";
import { useMemo, useState } from "react";
import {
  clienteRegistradoDesdeFactura,
  metaModeloClienteFacturaRegistrado,
  ModeloClienteFacturaRegistrado,
} from "./cliente_factura.ts";
import { ClienteFacturaRegistrado } from "./ClienteFacturaRegistrado.tsx";

export const ClienteFactura = ({
  venta,
  guardar,
  cancelar,
}: {
  venta: VentaTpv;
  guardar: (
    cambioCliente:
      | ModeloClienteVentaNoRegistrado
      | ModeloClienteFacturaRegistrado
  ) => void;
  cancelar: () => void;
}) => {
  const clienteRegistradoInicial = useMemo(
    () => clienteRegistradoDesdeFactura(venta),
    [venta]
  );

  const clienteNoRegistradoInicial = useMemo(
    () => clienteNoRegistradoDesdeVenta(venta),
    [venta]
  );

  const registrado = useModelo(
    metaModeloClienteFacturaRegistrado,
    clienteRegistradoInicial
  );

  const noRegistrado = useModelo(
    metaModeloClienteVentaNoRegistrado,
    clienteNoRegistradoInicial
  );

  const [tipoCliente, setTipoCliente] = useState<
    "registrado" | "no-registrado"
  >(venta.cliente_id ? "registrado" : "no-registrado");

  const esRegistrado = tipoCliente === "registrado";

  const toggleTipo = () => {
    setTipoCliente(esRegistrado ? "no-registrado" : "registrado");
  };

  const valido = esRegistrado ? registrado.valido : noRegistrado.valido;

  return (
    <QModal
      abierto={true}
      nombre="cambiar_cliente_factura"
      titulo="Cambiar cliente"
      onCerrar={cancelar}
    >
      <QBoton
        texto={esRegistrado ? "No registrado" : "Registrado"}
        onClick={toggleTipo}
      />

      <quimera-formulario>
        {esRegistrado ? (
          <ClienteFacturaRegistrado cliente={registrado} />
        ) : (
          <ClienteVentaNoRegistrado cliente={noRegistrado} />
        )}
      </quimera-formulario>

      <div className="botones maestro-botones ">
        <QBoton texto="Cancelar" onClick={cancelar} />
        <QBoton
          texto="Guardar"
          onClick={() =>
            guardar(
              tipoCliente === "registrado"
                ? registrado.modelo
                : noRegistrado.modelo
            )
          }
          deshabilitado={!valido}
        />
      </div>
    </QModal>
  );
};
