import { DefinicionWidget } from "@olula/lib/widgets.ts";
import { WidgetAccionesHoy } from "./accion/widgets/WidgetAccionesHoy.tsx";
import { WidgetUltimasTarjetas } from "./lead/widgets/WidgetUltimasTarjetas.tsx";
import { WidgetPrevisionOportunidades } from "./oportunidadventa/widgets/WidgetPrevisionOportunidades.tsx";
import { WidgetUltimasOportunidades } from "./oportunidadventa/widgets/WidgetUltimasOportunidades.tsx";

export const widgetsCrm: DefinicionWidget[] = [
    {
        id: "crm.widget.acciones_hoy",
        regla: "crm.accion.leer",
        Componente: WidgetAccionesHoy,
    },
    {
        id: "crm.widget.prevision_oportunidades",
        regla: "crm.oportunidad_venta.leer",
        Componente: WidgetPrevisionOportunidades,
    },
    {
        id: "crm.widget.ultimas_oportunidades",
        regla: "crm.oportunidad_venta.leer",
        Componente: WidgetUltimasOportunidades,
    },
    {
        id: "crm.widget.ultimas_tarjetas",
        regla: "crm.lead.leer",
        Componente: WidgetUltimasTarjetas,
    },
];