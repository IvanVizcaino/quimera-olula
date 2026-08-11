import { Cliente } from "#/ventas/comun/componentes/cliente.tsx";
import { DirCliente } from "#/ventas/comun/componentes/dirCliente.tsx";
import { CambioClienteNrj } from "./CambioClienteNrj.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { HookModelo } from "@olula/lib/useModelo.ts";

import { EstadoPedido } from "#/ventas/pedido/detalle/diseño.ts";
import { editable } from "#/ventas/pedido/detalle/detalle.ts";
import { QCheckbox } from "@olula/componentes/index.js";
import { Transportista } from "../../../comun/componentes/Transportista.tsx";
import { PedidoNrj } from "../../diseño.ts";
import "./TabCliente.css";

interface TabClienteProps {
  pedido: HookModelo<PedidoNrj>;
  estado: EstadoPedido;
  publicar?: (evento: string, payload?: unknown) => void;
}

export const TabClienteNrj = ({
  pedido,
  estado,
  publicar = async () => {},
}: TabClienteProps) => {
  const { modelo, uiProps } = pedido;

  // Helper para convertir valores a boolean
  const toBool = (valor: boolean | string): boolean => {
    return valor === true || valor === "true";
  };

  const onGuardarCambioCliente = async (cambios: Partial<PedidoNrj>) => {
    publicar("cambio_cliente_listo", cambios);
  };

  return (
    <div className="TabCliente">
      <quimera-formulario>
        <Cliente {...uiProps("cliente_id", "nombre_cliente")} />
        <QInput {...uiProps("id_fiscal")} label="ID Fiscal" />

        <div className="botones maestro-botones">
          <QBoton
            deshabilitado={!editable(modelo)}
            onClick={() => publicar("cambio_cliente_solicitado")}
          >
            Cambiar Cliente
          </QBoton>
        </div>

        {modelo.cliente?.cliente_id !== "None" ? (
          <DirCliente
            clienteId={modelo.cliente?.cliente_id ?? undefined}
            {...uiProps("direccion_id")}
          />
        ) : (
          <QInput
            deshabilitado={true}
            label="Direccion envio"
            nombre="direccion_cliente"
            valor={`${modelo.tipo_via} ${modelo.nombre_via}, ${modelo.ciudad}`}
          />
        )}

        <Transportista
          label="Transportista"
          {...uiProps("transportista_id", "Transportista")}
        />
        <QCheckbox
          label="Portes gestionados por cliente"
          {...uiProps("portes_cliente")}
          valor={toBool(modelo.portes_cliente)}
        />
      </quimera-formulario>

      {estado === "CAMBIANDO_CLIENTE" && (
        <CambioClienteNrj
          onGuardar={onGuardarCambioCliente}
          onCancelar={() => publicar("cambio_cliente_cancelado")}
        />
      )}
    </div>
  );
};
