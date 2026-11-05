import { Epigrafe } from "./diseño.ts";

export const etiquetaEpigrafe = (
    e: Pick<Epigrafe, "codigo" | "descripcion">
): string => (e.descripcion ? `${e.codigo} — ${e.descripcion}` : e.codigo);

export const epigrafeVacio = (): Epigrafe => ({
    id: "",
    codigo: "",
    descripcion: "",
    ejercicioId: "",
    grupoId: "",
    codigoGrupo: "",
    padreId: "",
});
