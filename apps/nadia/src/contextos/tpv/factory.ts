import { FactoryTpvOlula } from '#/tpv/factory.ts';
import { Layout } from '@olula/lib/useLayout.js';

export class FactoryTpvNadia extends FactoryTpvOlula {
    // Nadia no cobra con QR: se oculta el botón "P. QR" en ventas del TPV
    static override venta_pagoConQr = false
    // Listado de ventas del TPV en vista tabla por defecto
    static override venta_layoutInicial: Layout = "TABLA"
}
