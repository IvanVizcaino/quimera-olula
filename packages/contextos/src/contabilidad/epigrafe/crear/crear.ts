import { MetaModelo } from "@olula/lib/dominio.js";
import { NuevoEpigrafe } from "../diseño.ts";

export const metaNuevoEpigrafe: MetaModelo<NuevoEpigrafe> = {
    campos: {
        codigo: { requerido: true, maximo: 6 },
        descripcion: { requerido: true },
        ejercicioId: { requerido: true },
        grupoId: { requerido: false },
    },
};

export const nuevoEpigrafeInicial = (ejercicioId: string): NuevoEpigrafe => ({
    codigo: "",
    descripcion: "",
    ejercicioId,
    grupoId: "",
});
