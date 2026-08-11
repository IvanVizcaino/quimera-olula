import "@olula/componentes/plantilla/Cabecera.css";
import {
  CabeceraBase,
  CabeceraProps,
} from "@olula/componentes/plantilla/Cabecera.tsx";
import "./Cabecera.scss";

export const CabeceraGanso = (props: CabeceraProps) => {
  return (
    <CabeceraBase
      {...props}
      logoSrc="/logo_ganso.png"
      logoAlt="ElGanso | Inicio"
      Logo={null}
    />
  );
};
