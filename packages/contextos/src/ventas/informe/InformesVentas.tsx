import { InformesDocumentos } from "#/comun/informe_documentos/componentes/InformesDocumentos.tsx";
import { PESTAÑAS_VENTAS } from "./pestañas.tsx";

/** Ventas > Informes: Presupuestos, Pedidos, Albaranes y Facturas. */
export const InformesVentas = () => <InformesDocumentos titulo="Ventas" pestañas={PESTAÑAS_VENTAS} />;
