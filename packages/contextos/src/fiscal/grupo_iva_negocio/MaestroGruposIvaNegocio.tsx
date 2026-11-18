import { MaestroFiscal } from "../comun/maestro/MaestroFiscal.tsx";
import { configGrupoIvaNegocio } from "./dominio.ts";

/** Fiscalidad > Grupos contables Veri*Factu (gruposcontablesivaneg). */
export const MaestroGruposIvaNegocio = () => <MaestroFiscal config={configGrupoIvaNegocio} />;
