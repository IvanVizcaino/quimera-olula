import { DefinicionWidget } from "@olula/lib/widgets.ts";
import { WidgetArqueoCaja } from "./widgets/WidgetArqueoCaja.tsx";

export const widgetsTpvHome: DefinicionWidget[] = [
    {
        id: "tpv.widget.arqueo_caja",
        regla: "tpv.arqueo.leer",
        Componente: WidgetArqueoCaja,
    },
];
