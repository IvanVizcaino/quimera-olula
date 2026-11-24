import { useCallback } from "react";
import { PropsSelectorMaestro, SelectorMaestro } from "../comun/componentes/SelectorMaestro.tsx";
import { comoBooleano, criteriaTodos } from "../comun/dominio.ts";
import { getTiposProceso } from "./infraestructura.ts";

/**
 * Selector de tipo de proceso (necesita `produccion.tipo_proceso` para listarlos). Con
 * `soloFabricacion`, solo los de fabricación (los que puede usar un artículo fabricado).
 */
export const SelectorTipoProceso = (
    { label = "Tipo de proceso", nombre = "tipoProcesoId", soloFabricacion = false, ...props }:
        PropsSelectorMaestro & { soloFabricacion?: boolean }
) => {
    const cargar = useCallback(async () =>
        (await getTiposProceso(criteriaTodos)).datos
            .filter((t) => !soloFabricacion || comoBooleano(t.fabricacion))
            .map((t) => ({ valor: t.id, descripcion: `${t.id} - ${t.descripcion}` })),
    [soloFabricacion]);

    return <SelectorMaestro label={label} nombre={nombre} cargar={cargar} regla="produccion.tipo_proceso" {...props} />;
};
