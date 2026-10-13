import { DefinicionWidget } from "@olula/lib/widgets.ts";
import { WidgetRecibosCobro } from "./widgets/WidgetRecibosCobro.tsx";

export const widgetsTesoreriaHome: DefinicionWidget[] = [
    {
        id: "tesoreria.widget.recibos_cobro",
        regla: "tesoreria.recibo_venta",
        Componente: WidgetRecibosCobro,
    },
];
