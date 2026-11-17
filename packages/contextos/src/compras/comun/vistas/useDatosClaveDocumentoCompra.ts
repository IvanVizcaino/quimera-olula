import { useDescripcionGrupoIvaNegocio } from "#/comun/componentes/useOpcionesGrupoIvaNegocio.ts";
import { useCallback } from "react";
import { datosClaveDocumentoCompra, DocumentoCompraDatosClave } from "../dominio.ts";

/**
 * `obtenerDatosClave` de los detalles de documentos de compra: la franja común
 * con la descripción del grupo de IVA de negocio (la misma lista que el selector
 * de la pestaña Datos).
 */
export const useDatosClaveDocumentoCompra = () => {
    const descripcionGrupoIva = useDescripcionGrupoIvaNegocio();

    return useCallback(
        (documento: DocumentoCompraDatosClave) =>
            datosClaveDocumentoCompra(documento, descripcionGrupoIva),
        [descripcionGrupoIva]
    );
};
