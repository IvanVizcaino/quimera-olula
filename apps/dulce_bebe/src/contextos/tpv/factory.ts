import { FactoryTpvOlula } from '#/tpv/factory.ts';
import { CrearVentaDulceBebe } from './venta/crear_venta/CrearVenta.tsx';

export class FactoryTpvDulceBebe extends FactoryTpvOlula {
    static override venta_CrearVenta = CrearVentaDulceBebe
}
