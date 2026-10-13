import { getInformeLibroFacturasEmitidas } from "../../infraestructura.ts";
import { InformeLibroFacturasIva } from "./InformeLibroFacturasIva.tsx";

export const InformeLibroFacturasEmitidas = () => (
    <InformeLibroFacturasIva
        titulo="Libro IVA facturas emitidas"
        tipoPdf="libro_facturas_emitidas"
        consultar={getInformeLibroFacturasEmitidas}
        className="InformeLibroFacturasEmitidas"
    />
);
