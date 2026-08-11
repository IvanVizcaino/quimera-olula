import {
  CabeceraBase,
  CabeceraProps,
} from "@olula/componentes/plantilla/Cabecera.tsx";
import { useNombrePagina } from "@olula/lib/nombrePagina.ts";
import "./CabeceraSanhigia.css";

/**
 * Cabecera personalizada para Sanhigia
 * - Logo diferente (Sanhigia)
 * - Muestra el nombre de página actual (setNombrePaginaActual del legacy)
 * - Acción navegación a Dashboard SmartSales
 */
export const CabeceraSanhigia = (props: CabeceraProps) => {
  const nombrePagina = useNombrePagina();

  return (
    <CabeceraBase
      {...props}
      logoSrc="/logo.png"
      logoAlt="Sanhigia"
      Logo={null}
      Titulo={
        nombrePagina
          ? () => <span className="cabecera-nombre-pagina">{nombrePagina}</span>
          : undefined
      }
    />
  );
};
