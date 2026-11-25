import { PropsSelectorMaestro, SelectorMaestro } from "../comun/componentes/SelectorMaestro.tsx";
import { criteriaTodos } from "../comun/dominio.ts";
import { getSecciones } from "./infraestructura.ts";

const cargar = async () =>
    (await getSecciones(criteriaTodos)).datos.map((s) => ({ valor: s.id, descripcion: `${s.id} - ${s.descripcion}` }));

/** Selector de sección de producción (necesita `produccion.seccion` para listarlas). */
export const SelectorSeccion = ({ label = "Sección", nombre = "seccionId", ...props }: PropsSelectorMaestro) => (
    <SelectorMaestro label={label} nombre={nombre} cargar={cargar} regla="produccion.seccion" {...props} />
);
