import { getInformeLibroFacturasRecibidas } from "../../infraestructura.ts";
import { InformeLibroFacturasIva } from "./InformeLibroFacturasIva.tsx";

export const InformeLibroFacturasRecibidas = () => (
    <InformeLibroFacturasIva
        titulo="Libro IVA facturas recibidas"
        tipoPdf="libro_facturas_recibidas"
        consultar={getInformeLibroFacturasRecibidas}
        className="InformeLibroFacturasRecibidas"
    />
);
