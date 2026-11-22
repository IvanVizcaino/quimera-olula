import { FactoryTpvOlula } from '#/tpv/factory.ts';
import { menuTPV } from '#/tpv/menu.ts';
import { Layout } from '@olula/lib/useLayout.js';

// Nadia no usa el visor de cliente: se quita la opción del menú de TPV
const { "TPV/Visor de cliente": _visorCliente, ...menuTpvNadia } = menuTPV;

export class FactoryTpvNadia extends FactoryTpvOlula {
    static override menu = menuTpvNadia as typeof menuTPV
    // Nadia no cobra con QR: se oculta el botón "P. QR" en ventas del TPV
    static override venta_pagoConQr = false
    // Listado de ventas del TPV en vista tabla por defecto
    static override venta_layoutInicial: Layout = "TABLA"
}
