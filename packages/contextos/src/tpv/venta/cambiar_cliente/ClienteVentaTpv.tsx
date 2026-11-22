import { VentaTpv } from "#/tpv/venta/diseño.ts";
import {
  ModeloClienteFacturaRegistrado,
  clienteRegistradoDesdeFactura,
  metaModeloClienteFacturaRegistrado,
} from "#/ventas/factura/cliente_factura/cliente_factura.ts";
import { ClienteFacturaRegistrado } from "#/ventas/factura/cliente_factura/ClienteFacturaRegistrado.tsx";
import { QAviso } from "@olula/componentes/atomos/qaviso.tsx";
import { QBoton, QModal } from "@olula/componentes/index.js";
import { useModelo } from "@olula/lib/useModelo.js";
import { useEffect, useMemo, useState } from "react";
import { avisoClienteSinDireccion, clienteTieneDireccionFacturacion } from "./cambiar_cliente.ts";

export const ClienteVentaTpv = ({
  venta,
  guardar,
  cancelar,
}: {
  venta: VentaTpv;
  guardar: (cambioCliente: ModeloClienteFacturaRegistrado | null) => void;
  cancelar: () => void;
}) => {
  const clienteRegistradoInicial = useMemo(
    () => clienteRegistradoDesdeFactura(venta),
    [venta]
  );

  // const clienteNoRegistradoInicial = useMemo(
  //     () => clienteNoRegistradoDesdeVenta(venta),
  //     [venta]
  // );

  const registrado = useModelo(
    metaModeloClienteFacturaRegistrado,
    clienteRegistradoInicial
  );

  // const noRegistrado = useModelo(
  //     metaModeloClienteVentaNoRegistrado,
  //     clienteNoRegistradoInicial
  // );

  const [tipoCliente, setTipoCliente] = useState<"registrado" | "simplificada">(
    venta.cliente?.id ? "registrado" : "simplificada"
  );

  const esRegistrado = tipoCliente === "registrado";

  const toggleTipo = () => {
    setTipoCliente(esRegistrado ? "simplificada" : "registrado");
  };

  const idCliente = registrado.modelo.idCliente;

  // null: sin cliente o comprobación en curso
  const [conDireccion, setConDireccion] = useState<boolean | null>(null);

  useEffect(() => {
    setConDireccion(null);
    if (!idCliente) return;

    let vigente = true;
    clienteTieneDireccionFacturacion(idCliente)
      .then((tiene) => vigente && setConDireccion(tiene))
      // Si no se puede comprobar, no bloqueamos: el servidor valida al guardar
      .catch(() => vigente && setConDireccion(true));

    return () => {
      vigente = false;
    };
  }, [idCliente]);

  const sinDireccion = esRegistrado && conDireccion === false;

  const valido = esRegistrado ? registrado.valido && conDireccion === true : true;

  return (
    <QModal
      abierto={true}
      nombre="mostrar"
      titulo="Cambiar cliente"
      onCerrar={cancelar}
    >
      <QBoton
        tamaño="pequeño"
        texto={esRegistrado ? "Fra. Simplificada" : "Registrado"}
        onClick={toggleTipo}
      />

      <quimera-formulario>
        {esRegistrado ? (
          <ClienteFacturaRegistrado cliente={registrado} />
        ) : (
          "Factura simplificada"
        )}
      </quimera-formulario>

      {sinDireccion && (
        <QAviso variante="advertencia">{avisoClienteSinDireccion}</QAviso>
      )}

      <div className="botones maestro-botones ">
        <QBoton texto="Cancelar" onClick={cancelar} />
        <QBoton
          texto="Guardar"
          onClick={() =>
            guardar(tipoCliente === "registrado" ? registrado.modelo : null)
          }
          deshabilitado={!valido}
        />
      </div>
    </QModal>
  );
};
