import { PropsSelectorMaestro, SelectorMaestro } from "../comun/componentes/SelectorMaestro.tsx";
import { criteriaTodos } from "../comun/dominio.ts";
import { getHorarios } from "./infraestructura.ts";

const cargar = async () =>
    (await getHorarios(criteriaTodos)).datos.map((h) => ({ valor: h.id, descripcion: `${h.id} - ${h.descripcion}` }));

/** Selector de horario de producción (necesita `produccion.horario` para listarlos). */
export const SelectorHorario = ({ label = "Horario", nombre = "horarioId", ...props }: PropsSelectorMaestro) => (
    <SelectorMaestro label={label} nombre={nombre} cargar={cargar} regla="produccion.horario" {...props} />
);
