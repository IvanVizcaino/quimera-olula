import { QAvatar, QTarjetaGenerica } from "@olula/componentes/index.js";
import { CrmContacto } from "../../diseño.ts";

export const TarjetaCrmContacto = (contacto: CrmContacto) => {
  return (
    <QTarjetaGenerica
      avatar={<QAvatar nombre={contacto.nombre} />}
      arribaIzquierda={contacto.nombre}
      abajoIzquierda={contacto.email}
    />
  );
};
