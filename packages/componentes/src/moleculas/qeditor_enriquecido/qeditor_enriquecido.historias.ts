import { Historia, MetaHistorias } from "../../historias/diseño.ts";
import { QEditorEnriquecido } from "./qeditor_enriquecido.tsx";

export default {
    grupo: "moleculas",
    titulo: "qeditor_enriquecido",
    attrs: {
        mostrarBarra: true,
    },
    Componente: QEditorEnriquecido,
} as unknown as MetaHistorias;

export const Base: Historia = {};
