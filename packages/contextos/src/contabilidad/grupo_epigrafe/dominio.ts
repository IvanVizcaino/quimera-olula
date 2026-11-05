import { GrupoEpigrafe } from "./diseño.ts";

export const etiquetaGrupoEpigrafe = (
    g: Pick<GrupoEpigrafe, "codigo" | "descripcion">
): string => (g.descripcion ? `${g.codigo} — ${g.descripcion}` : g.codigo);

export const grupoEpigrafeVacio = (): GrupoEpigrafe => ({
    id: "",
    codigo: "",
    descripcion: "",
    ejercicioId: "",
});
