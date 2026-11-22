import { InformesDocumentos } from "#/comun/informe_documentos/componentes/InformesDocumentos.tsx";
import { PESTAÑAS_COMPRAS } from "./pestañas.tsx";

/** Compras > Informes: Pedidos, Albaranes y Facturas. */
export const InformesCompras = () => <InformesDocumentos titulo="Compras" pestañas={PESTAÑAS_COMPRAS} />;
