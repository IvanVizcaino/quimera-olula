import { DefinicionWidget } from "@olula/lib/widgets.ts";
import { WidgetPedidosPendientes } from "./widgets/WidgetPedidosPendientes.tsx";

export const widgetsVentasHome: DefinicionWidget[] = [
    {
        id: "ventas.widget.pedidos_pendientes",
        regla: "ventas.pedido.leer",
        Componente: WidgetPedidosPendientes,
    },
];
