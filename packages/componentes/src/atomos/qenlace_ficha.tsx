import { MouseEvent, ReactNode } from "react";
import { Link, useInRouterContext } from "react-router";
import "./qenlace_ficha.css";
import { QIcono } from "./qicono.tsx";


export type EnlaceFichaProps = {
  href: string;
  /** Texto para lectores de pantalla, p. ej. «Abrir artículo 90197». */
  etiqueta: string;
  /** Clase extra para colocarlo (el estilo es siempre el de `enlace-ficha`). */
  className?: string;
  tabIndex?: number;
};

/**
 * Enlace a la ficha de otra entidad: el icono ↗. Navega en la misma pestaña (Ctrl o el botón
 * central abren otra, como cualquier enlace) y no propaga el clic: dentro de una fila de tabla no
 * la selecciona.
 */
export const EnlaceFicha = ({ href, etiqueta, className, tabIndex }: EnlaceFichaProps) => {
  const enRouter = useInRouterContext();
  const clase = ["enlace-ficha", className].filter(Boolean).join(" ");
  const contenido = <QIcono nombre="arriba_derecha" tamaño="sm" />;
  const sinPropagar = (e: MouseEvent) => e.stopPropagation();

  return enRouter ? (
    <Link to={href} className={clase} aria-label={etiqueta} title={etiqueta} tabIndex={tabIndex} onClick={sinPropagar}>
      {contenido}
    </Link>
  ) : (
    <a href={href} className={clase} aria-label={etiqueta} title={etiqueta} tabIndex={tabIndex} onClick={sinPropagar}>
      {contenido}
    </a>
  );
};

/** Un valor y, si hay `href`, su enlace a ficha detrás. Para textos de paneles y listas. */
export const ValorConEnlace = ({ children, href, etiqueta }: {
  children: ReactNode;
  href: string | null | undefined;
  etiqueta: string;
}) => (
  <span className="valor-con-enlace">
    {children}
    {href && <EnlaceFicha href={href} etiqueta={etiqueta} />}
  </span>
);

/** El contenido de una celda o campo y, si hay destino, su `EnlaceFicha`. Lo usan las tablas. */
export const ContenidoConEnlace = ({ children, href, etiqueta }: {
  children: ReactNode;
  href: string | null | undefined;
  etiqueta: string;
}) => (href
  ? (
    // Si la celda recorta el texto («…»), se recorta el valor y la flecha queda siempre visible.
    <span className="contenido-con-enlace">
      <span className="contenido-con-enlace-valor">{children}</span>
      <EnlaceFicha href={href} etiqueta={etiqueta} />
    </span>
  )
  : <>{children}</>);
