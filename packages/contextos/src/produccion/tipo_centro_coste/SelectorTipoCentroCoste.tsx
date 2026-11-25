import { PropsSelectorMaestro, SelectorMaestro } from "../comun/componentes/SelectorMaestro.tsx";
import { criteriaTodos } from "../comun/dominio.ts";
import { getTiposCentroCoste } from "./infraestructura.ts";

const cargar = async () =>
    (await getTiposCentroCoste(criteriaTodos)).datos.map((t) => ({ valor: t.id, descripcion: `${t.id} - ${t.descripcion}` }));

/** Selector de tipo de centro de coste (necesita `produccion.tipo_centro_coste` para listarlos). */
export const SelectorTipoCentroCoste = (
    { label = "Tipo de centro", nombre = "tipoCentroId", ...props }: PropsSelectorMaestro
) => (
    <SelectorMaestro label={label} nombre={nombre} cargar={cargar} regla="produccion.tipo_centro_coste" {...props} />
);
