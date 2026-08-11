import { QAvatar, QTarjetaGenerica } from "@olula/componentes/index.js";
import { Cliente } from "../diseño.ts";

export const TarjetaCliente = (cliente: Cliente) => {
  return (
    <QTarjetaGenerica
      avatar={<QAvatar nombre={cliente.nombre} />}
      arribaIzquierda={cliente.nombre}
      abajoIzquierda={cliente.email}
      abajoDerecha={cliente.telefono1}
    />
  );
};
