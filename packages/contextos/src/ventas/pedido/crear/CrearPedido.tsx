import { Cliente } from "#/ventas/comun/componentes/cliente.tsx";
import { DirCliente } from "#/ventas/comun/componentes/dirCliente.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useFocus } from "@olula/lib/useFocus.js";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback } from "react";
import { getPedido, postPedido } from "../infraestructura.ts";
import "./CrearPedido.css";
import { metaNuevoPedido, nuevoPedidoVacio } from "./crear.ts";

export const CrearPedido = ({
  publicar = async () => {},
}: {
  publicar?: EmitirEvento;
}) => {
  const nuevoPedido = useModelo(metaNuevoPedido, nuevoPedidoVacio);
  const focus = useFocus();

  const guardar_ = useCallback(async () => {
    const id = await postPedido(nuevoPedido.modelo);
    const pedidoCreado = await getPedido(id);
    publicar("pedido_creado", pedidoCreado);
  }, [nuevoPedido.modelo, publicar]);

  const cancelar_ = useCallback(() => {
    publicar("creacion_pedido_cancelada");
    nuevoPedido.init();
  }, [publicar, nuevoPedido]);

  const [guardar, cancelar] = useForm(guardar_, cancelar_);

  return (
    <div className="CrearPedido">
      <h2>Nuevo Pedido</h2>
      <quimera-formulario>
        <Cliente
          {...nuevoPedido.uiProps("cliente_id", "nombre")}
          nombre="ClientePedido"
          ref={focus}
        />
        <DirCliente
          clienteId={nuevoPedido.modelo.cliente_id}
          {...nuevoPedido.uiProps("direccion_id")}
        />
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
