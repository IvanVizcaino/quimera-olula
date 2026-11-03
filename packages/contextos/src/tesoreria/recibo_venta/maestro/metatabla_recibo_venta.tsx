import { MetaTabla, QEtiqueta } from "@olula/componentes/index.js";
import { ReciboVenta } from "../diseño.js";
import { varianteEstadoReciboVenta } from "../dominio.js";

export const metaTablaReciboVenta: MetaTabla<ReciboVenta> = [
    { id: 'codigo', cabecera: 'Código' },
    { id: 'nombreCliente', cabecera: 'Cliente' },
    { id: 'idFiscal', cabecera: 'ID Fiscal' },
    { id: 'fechaEmision', cabecera: 'F. Emisión', tipo: 'fecha' },
    { id: 'fechaVencimiento', cabecera: 'F. Vencimiento', tipo: 'fecha' },
    {
        id: 'estado',
        cabecera: 'Estado',
        render: (recibo: ReciboVenta) => (
            <QEtiqueta variante={varianteEstadoReciboVenta(recibo.estado)}>
                {recibo.estado}
            </QEtiqueta>
        ),
    },
    { id: 'importe', cabecera: 'Importe', tipo: 'moneda' },
];
