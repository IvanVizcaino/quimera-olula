import { PropsSelectorMaestro, SelectorMaestro } from "../comun/componentes/SelectorMaestro.tsx";
import { criteriaTodos } from "../comun/dominio.ts";
import { getTiposTarea } from "./infraestructura.ts";

const cargar = async () =>
    (await getTiposTarea(criteriaTodos)).datos.map((t) => ({ valor: t.id, descripcion: `${t.id} - ${t.descripcion}` }));

/** Selector de tipo de tarea (necesita `produccion.tipo_tarea` para listarlos). */
export const SelectorTipoTarea = (
    { label = "Tipo de tarea", nombre = "tipoTareaId", ...props }: PropsSelectorMaestro
) => (
    <SelectorMaestro label={label} nombre={nombre} cargar={cargar} regla="produccion.tipo_tarea" {...props} />
);
