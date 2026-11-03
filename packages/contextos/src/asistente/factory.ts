import { PanelAsistenteBase } from "#/asistente/vistas/PanelAsistente.tsx";
import { AsistenteVozBase } from "#/asistente/vistas/modo_voz/AsistenteVoz.tsx";

export class FactoryAsistenteOlula {
    static asistente_PanelAsistente = PanelAsistenteBase;
    static asistente_AsistenteVoz = AsistenteVozBase;
}
