import { QAvatar, QTarjetaGenerica } from "@olula/componentes/index.js";
import { Contacto } from "../diseño.ts";

export const TarjetaContacto = (contacto: Contacto) => {
  return (
    <QTarjetaGenerica
      avatar={<QAvatar nombre={contacto.nombre} />}
      arribaIzquierda={contacto.nombre}
      abajoIzquierda={contacto.email}
      abajoDerecha={contacto.telefono1}
    />
  );
};
