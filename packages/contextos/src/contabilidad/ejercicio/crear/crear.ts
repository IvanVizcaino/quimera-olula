import { MetaModelo } from "@olula/lib/dominio.js";
import { NuevoEjercicio } from "../diseño.ts";

export const metaNuevoEjercicio: MetaModelo<NuevoEjercicio> = {
    campos: {
        id: { requerido: true, maximo: 4 },
        nombre: { requerido: true },
        fechaInicio: { requerido: true, tipo: "fecha" },
        fechaFin: { requerido: true, tipo: "fecha" },
        digitosSubcuenta: { requerido: true, tipo: "numero" },
        ejercicioOrigenPgc: { requerido: false, tipo: "selector" },
        series: { requerido: false },
    },
    validacion: (m) => {
        if (m.fechaInicio > m.fechaFin) {
            return "La fecha de inicio del ejercicio debe ser menor que la de fin";
        }
        const digitos = Number(m.digitosSubcuenta);
        if (!m.ejercicioOrigenPgc && (digitos < 5 || digitos > 15)) {
            return "La longitud de la subcuenta debe estar entre 5 y 15 caracteres";
        }
        return true;
    },
};
