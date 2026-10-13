import { FactoryTesoreriaOlula } from '#/tesoreria/factory.ts';
import { menuTesoreria } from '#/tesoreria/menu.ts';
import { widgetsTesoreriaHome } from '#/tesoreria/widgets.ts';

export class FactoryTesoreriaCremaCafe extends FactoryTesoreriaOlula {
    // T1.1 recibos; T4.5 remesas de pago (requiere extensión Eneboo remesas_prov).
    static override menu = {
        "Tesorería": menuTesoreria["Tesorería"],
        "Tesorería/Recibos de cobro": menuTesoreria["Tesorería/Recibos de cobro"],
        "Tesorería/Recibos de pago": menuTesoreria["Tesorería/Recibos de pago"],
        "Tesorería/Remesas de pago": menuTesoreria["Tesorería/Remesas de pago"],
    } as typeof FactoryTesoreriaOlula.menu;

    static widgets = widgetsTesoreriaHome;
}
