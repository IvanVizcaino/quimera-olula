import {
  CabeceraBase,
  CabeceraProps,
} from "@olula/componentes/plantilla/Cabecera.tsx";
import "./CabeceraCabrera.css";

/**
 * Cabecera personalizada para Cabrera
 * - Logo diferente (Cabrera)
 * - Acción navegación a Dashboard SmartSales
 * - Estructuración específica de la app
 */
export const CabeceraCabrera = (props: CabeceraProps) => {
  return (
    <CabeceraBase
      {...props}
      logoSrc="/logo.png"
      logoAlt="Cabrera"
      Logo={null}
    />
  );
};
