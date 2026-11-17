import { FactoryTpvOlula } from '#/tpv/factory.ts';

export class FactoryTpvNadia extends FactoryTpvOlula {
    // Nadia no cobra con QR: se oculta el botón "P. QR" en ventas del TPV
    static override venta_pagoConQr = false
}
