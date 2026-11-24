import { PropsSelectorMaestro, SelectorMaestro } from "../comun/componentes/SelectorMaestro.tsx";
import { comoBooleano, criteriaTodos } from "../comun/dominio.ts";
import { getTrabajadores } from "./infraestructura.ts";

/** Los trabajadores que no están de baja. */
const cargar = async () =>
    (await getTrabajadores(criteriaTodos)).datos
        .filter((t) => !comoBooleano(t.deBaja))
        .map((t) => ({ valor: t.id, descripcion: `${t.id} - ${t.nombre}` }));

/** Selector de trabajador de producción (necesita `produccion.trabajador` para listarlos). */
export const SelectorTrabajador = ({ label = "Trabajador", nombre = "trabajadorId", ...props }: PropsSelectorMaestro) => (
    <SelectorMaestro label={label} nombre={nombre} cargar={cargar} regla="produccion.trabajador" {...props} />
);
