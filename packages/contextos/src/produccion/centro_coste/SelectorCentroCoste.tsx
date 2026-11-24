import { PropsSelectorMaestro, SelectorMaestro } from "../comun/componentes/SelectorMaestro.tsx";
import { criteriaTodos } from "../comun/dominio.ts";
import { getCentrosCoste } from "./infraestructura.ts";

const cargar = async () =>
    (await getCentrosCoste(criteriaTodos)).datos.map((c) => ({ valor: c.id, descripcion: `${c.id} - ${c.descripcion}` }));

/** Selector de centro de coste (necesita `produccion.centro_coste` para listarlos). */
export const SelectorCentroCoste = ({ label = "Centro de coste", nombre = "centroId", ...props }: PropsSelectorMaestro) => (
    <SelectorMaestro label={label} nombre={nombre} cargar={cargar} regla="produccion.centro_coste" {...props} />
);
