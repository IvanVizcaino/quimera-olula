import { createContext, useContext } from "react";

type ContextoMaestroValor = {
  /** El componente está en el maestro principal de la pantalla. */
  enMaestroPrincipal: boolean;
  /** Ya hay un MaestroDetalle por encima (maestros anidados en un detalle). */
  anidado: boolean;
};

export const ContextoMaestro = createContext<ContextoMaestroValor>({
  enMaestroPrincipal: false,
  anidado: false,
});

/**
 * Solo el listado del maestro principal resuelve los widgets automáticos por la
 * ruta de la pantalla: los de un detalle o de un maestro anidado comparten ruta
 * pero muestran otra entidad.
 */
export const useEnMaestroPrincipal = () =>
  useContext(ContextoMaestro).enMaestroPrincipal;

/** El componente se pinta dentro de un Detalle (pestañas, líneas…). */
export const ContextoDetalle = createContext(false);

/**
 * Listados dentro de un detalle en móvil: siempre tarjetas compactas, aunque la
 * pantalla fije la tabla (no cabe y el detalle ya va apretado).
 */
export const useListadoMovilEnDetalle = (esMovil: boolean) => {
  const enDetalle = useContext(ContextoDetalle);
  return esMovil && enDetalle;
};
