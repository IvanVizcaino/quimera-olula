import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useEffect, useState } from "react";
import { FabricacionArticulo } from "../diseño.ts";
import { metaFabricacion } from "../dominio.ts";
import { getFabricacionArticulo, patchFabricacionArticulo } from "../infraestructura.ts";
import { CamposFabricacion } from "./CamposFabricacion.tsx";

const FormFabricacion = ({
    entidad,
    recargar,
}: {
    entidad: FabricacionArticulo;
    recargar: () => Promise<void>;
}) => {
    const guardar = useCallback(async (a: FabricacionArticulo) => {
        await patchFabricacionArticulo(a.id, { fabricado: a.fabricado, tipoProcesoId: a.tipoProcesoId });
        await recargar();
    }, [recargar]);

    const modelo = useModelo(metaFabricacion, entidad, guardar);

    return <CamposFabricacion modelo={modelo} entidad={entidad} recargar={recargar} />;
};

/**
 * Pestaña «Fabricación» de la ficha del artículo de almacén (con la regla `produccion.articulo` y
 * el plugin `produccion`): lo mismo que el detalle de Producción > Fabricación de artículos.
 */
export const TabFabricacionArticulo = ({ articuloId }: { articuloId: string }) => {
    const [entidad, setEntidad] = useState<FabricacionArticulo | null>(null);

    const recargar = useCallback(async () => {
        setEntidad(await getFabricacionArticulo(articuloId));
    }, [articuloId]);

    useEffect(() => {
        recargar();
    }, [recargar]);

    if (!entidad || entidad.id !== articuloId) return null;
    return <FormFabricacion entidad={entidad} recargar={recargar} />;
};
