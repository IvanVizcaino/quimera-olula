import { FactoryVentasOlula } from '#/ventas/factory.ts';
import { reglaEditableHastaFirmada } from '#/ventas/factura/dominio.ts';
import { menuVentas } from '#/ventas/menu.ts';
import { widgetsVentasHome } from '#/ventas/widgets.ts';

const { "Ventas": cabecera, "Ventas/Clientes": clientes, "Ventas/Presupuestos": presupuestos, "Ventas/Pedidos": pedidos, "Ventas/Albaranes": albaranes, "Ventas/Facturas": facturas } = menuVentas;

export class FactoryVentasCremaCafe extends FactoryVentasOlula {
    // Con plugin estado_expedicion_factura=firma, la factura emitida se edita hasta firmarse.
    static override factura_reglaEditable = reglaEditableHastaFirmada;

    // T1.1: circuito de ventas a crédito. Se omiten Artículos (se gestionan desde Almacén) y Tarifas.
    static override menu = {
        "Ventas": cabecera,
        "Ventas/Clientes": clientes,
        "Ventas/Presupuestos": presupuestos,
        "Ventas/Pedidos": pedidos,
        "Ventas/Albaranes": albaranes,
        "Ventas/Facturas": facturas,
    };

    static widgets = widgetsVentasHome;
}
