import { Historia, MetaHistorias } from "../../historias/diseño.ts";
import { QTextoEnriquecido } from "./qtexto_enriquecido.tsx";

export default {
    grupo: "moleculas",
    titulo: "qtexto_enriquecido",
    attrs: {
        texto: "Se te ha asignado el [b]cliente[/b] [@ventas.cliente:id,123|Juan Perez].",
    },
    Componente: QTextoEnriquecido,
} as unknown as MetaHistorias;

export const Base: Historia = {};
