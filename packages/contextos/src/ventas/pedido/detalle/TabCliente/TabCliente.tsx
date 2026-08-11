import { Cliente } from "#/ventas/comun/componentes/cliente.tsx";
import { DirCliente } from "#/ventas/comun/componentes/dirCliente.tsx";
import { CambioClienteVenta } from "#/ventas/comun/componentes/moleculas/CambioClienteVenta/CambioClienteVenta.tsx";
import { CambioCliente } from "#/ventas/comun/componentes/moleculas/CambioClienteVenta/diseño.ts";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { HookModelo } from "@olula/lib/useModelo.ts";
import { Pedido } from "../../diseño.ts";
import { EstadoPedido } from "../diseño.ts";
import { editable } from "../detalle.ts";
import "./TabCliente.css";

interface TabClienteProps {
  pedido: HookModelo<Pedido>;
  estado: EstadoPedido;
  publicar?: (evento: string, payload?: unknown) => void;
}

export const TabCliente = ({
  pedido,
  estado,
  publicar = async () => {},
}: TabClienteProps) => {
  const { modelo } = pedido;
  const clienteEditable = editable(modelo);

  const onGuardarCambioCliente = async (cambios: CambioCliente) => {
    publicar("cambio_cliente_listo", cambios);
  };

  return (
    <div className="TabCliente">
      <quimera-formulario>
        <Cliente
          nombre="cliente_id"
          valor={modelo.cliente.cliente_id ?? ""}
          descripcion={modelo.cliente.nombre_cliente}
          deshabilitado={true}
        />
        <QInput
          nombre="id_fiscal"
          label="ID Fiscal"
          valor={modelo.cliente.id_fiscal}
          deshabilitado={true}
        />

        {clienteEditable && (
          <div className="TabCliente-accion">
            <QBoton onClick={() => publicar("cambio_cliente_solicitado")}>
              Cambiar Cliente
            </QBoton>
          </div>
        )}

        {modelo.cliente.cliente_id !== null ? (
          <DirCliente
            clienteId={modelo.cliente.cliente_id ?? undefined}
            nombre="direccion_id"
            valor={modelo.cliente.direccion_id ?? ""}
            deshabilitado={!clienteEditable}
            onChange={() => {}}
          />
        ) : (
          <QInput
            deshabilitado={true}
            label="Direccion"
            nombre="direccion_cliente"
            valor={`${modelo.cliente.direccion.tipo_via} ${modelo.cliente.direccion.nombre_via}, ${modelo.cliente.direccion.ciudad}`}
          />
        )}
      </quimera-formulario>

      {clienteEditable && estado === "CAMBIANDO_CLIENTE" && (
        <CambioClienteVenta
          venta={pedido}
          inicializarDesdeVenta={true}
          onGuardar={onGuardarCambioCliente}
          onCancelar={() => publicar("cambio_cliente_cancelado")}
        />
      )}
    </div>
  );
};
