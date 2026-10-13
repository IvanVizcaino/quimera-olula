import { MetaModelo, stringNoVacio } from "@olula/lib/dominio.ts";
import { NuevoAgenteTpv } from "./diseño.ts";

export const metaNuevoAgenteTpv: MetaModelo<NuevoAgenteTpv> = {
    campos: {
        nombre: {
            requerido: true,
            validacion: (m) => stringNoVacio(m.nombre),
        },
    },
};

export const agenteVacio = (): NuevoAgenteTpv => ({
    nombre: "",
});
