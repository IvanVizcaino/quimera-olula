import { MetaModelo } from "@olula/lib/dominio.ts";
import { idCatalogoValido, MENSAJE_ID_CATALOGO } from "../../comun/dominio.js";
import { NuevoPlan } from "../diseño.js";

const stringNoVacio = (v: string) => v.trim().length > 0;

export const nuevoPlanVacio: NuevoPlan = { id: "", nombre: "" };

/** `existentes`: ids ya en uso (el PUT sustituiría el plan sin avisar). */
export const metaNuevoPlan = (existentes: string[]): MetaModelo<NuevoPlan> => ({
    campos: {
        id: {
            requerido: true,
            validacion: (m) =>
                !idCatalogoValido(m.id) ? MENSAJE_ID_CATALOGO
                    : existentes.includes(m.id) ? "Ya existe un plan con ese identificador"
                        : true,
        },
        nombre: { requerido: true, validacion: (m) => stringNoVacio(m.nombre) },
    },
});
