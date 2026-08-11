import { EmitirEvento } from "@olula/lib/diseño.js";
import { useCallback, useEffect, useRef } from "react";
import { postVenta } from "../infraestructura.ts";

export const CrearVentaTpv = ({
    publicar,
}: {
    publicar: EmitirEvento;
}): React.JSX.Element | null => {
    const ejecutado = useRef(false);

    const crear = useCallback(async () => {
        try {
            const id = await postVenta();
            publicar("venta_creada", id);
        } catch {
            publicar("alta_de_venta_cancelada");
        }
    }, [publicar]);

    useEffect(() => {
        if (!ejecutado.current) {
            ejecutado.current = true;
            crear();
        }
    }, [crear]);

    return null;
};
