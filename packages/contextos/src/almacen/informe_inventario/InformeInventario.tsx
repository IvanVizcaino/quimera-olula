import { MaestroInforme } from "#/comun/informe_documentos/componentes/MaestroInforme.tsx";
import "#/comun/informe_documentos/componentes/InformesDocumentos.css";
import "./InformeInventario.css";
import { INFORME_INVENTARIO } from "./pestañas.ts";

/** Almacén > Informe inventario: fichas de criterios y stock por almacén. */
export const InformeInventario = () => (
    <div className="InformesDocumentos InformeInventario">
        <h2>Informe inventario</h2>
        <MaestroInforme pestaña={INFORME_INVENTARIO} />
    </div>
);
