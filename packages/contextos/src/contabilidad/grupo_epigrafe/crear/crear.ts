import { MetaModelo } from "@olula/lib/dominio.js";
import { NuevoGrupoEpigrafe } from "../diseño.ts";

export const metaNuevoGrupoEpigrafe: MetaModelo<NuevoGrupoEpigrafe> = {
    campos: {
        codigo: { requerido: true, maximo: 6 },
        descripcion: { requerido: true },
        ejercicioId: { requerido: true },
    },
};

export const nuevoGrupoEpigrafeInicial = (
    ejercicioId: string
): NuevoGrupoEpigrafe => ({
    codigo: "",
    descripcion: "",
    ejercicioId,
});
