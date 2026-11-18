import { useDescripcionGrupoIvaNegocio } from "#/comun/componentes/useOpcionesGrupoIvaNegocio.ts";
import { useCallback } from "react";
import { datosClaveDocumentoVenta, DocumentoDatosClave } from "../dominio.ts";

/**
 * `obtenerDatosClave` de los detalles de documentos de venta: la franja común
 * con la descripción del grupo de IVA de negocio (la misma lista que el selector
 * de la pestaña Datos).
 */
export const useDatosClaveDocumentoVenta = () => {
    const descripcionGrupoIva = useDescripcionGrupoIvaNegocio();

    return useCallback(
        (documento: DocumentoDatosClave) =>
            datosClaveDocumentoVenta(documento, descripcionGrupoIva),
        [descripcionGrupoIva]
    );
};
