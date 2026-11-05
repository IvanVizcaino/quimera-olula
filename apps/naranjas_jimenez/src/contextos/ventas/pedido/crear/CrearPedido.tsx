import { getPedido } from "#/ventas/pedido/infraestructura.ts";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { Cliente } from "../../comun/componentes/Cliente.tsx";

import { DirCliente } from "#/ventas/comun/componentes/dirCliente.tsx";
import { QCheckbox } from "@olula/componentes/index.js";
import { ContextoError } from "@olula/lib/contexto.js";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useFocus } from "@olula/lib/useFocus.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useContext } from "react";
import { Transportista } from "../../comun/componentes/Transportista.tsx";
import "./CrearPedido.css";
import { metaNuevoPedidoNrj, nuevoPedidoNrjVacio, postPedidoNrj } from "./crear_pedido_nrj.ts";

export const CrearPedidoNrj = ({
  publicar = async () => {},
}: {
  publicar?: EmitirEvento;
}) => {
  const nuevoPedido = useModelo(metaNuevoPedidoNrj, nuevoPedidoNrjVacio);
  const { intentar } = useContext(ContextoError);
  const focus = useFocus();

  // Helper para convertir valores a boolean
  const toBool = (valor: boolean | string): boolean => {
    return valor === true || valor === "true";
  };

  const guardar = async () => {
    const id = await intentar(() => postPedidoNrj(nuevoPedido.modelo));
    const pedidoCreado = await getPedido(id);
    publicar("pedido_creado", pedidoCreado);
  };

  const cancelar = () => {
    publicar("creacion_pedido_cancelada");
    nuevoPedido.init();
  };

  return (
    <div className="CrearPedido">
      <quimera-formulario>
        <Cliente
          {...nuevoPedido.uiProps("cliente_id", "nombre")}
          nombre="ClientePedido"
          ref={focus}
        />
        <DirCliente
          clienteId={nuevoPedido.modelo.cliente_id}
          valorDefecto="facturacion"
          label="Direccion envio"
          {...nuevoPedido.uiProps("direccion_id")}
          // nombre="alta_pedido_direccion_id"
        />
        <Transportista
          label="Transportista"
          {...nuevoPedido.uiProps("transportista_id", "Transportista")}
        />
        <QCheckbox
          label="Portes gestionados por cliente"
          {...nuevoPedido.uiProps("portes_cliente")}
          valor={toBool(nuevoPedido.modelo.portes_cliente)}
        />
        {/* <QInput label="Empresa" {...nuevoPedido.uiProps("empresa_id")} /> */}
      </quimera-formulario>
      <div className="botones">
        <QBoton onClick={guardar} deshabilitado={!nuevoPedido.valido}>
          Guardar
        </QBoton>
        <QBoton onClick={cancelar} variante="texto">
          Cancelar
        </QBoton>
      </div>
    </div>
  );
};
