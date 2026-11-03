import { MetaModelo } from "@olula/lib/dominio.js";
import { NuevoTipoCaja } from "../../diseño.js";

export const metaNuevoTipoCaja: MetaModelo<NuevoTipoCaja> = {
    campos: {
        descripcion: { requerido: true },
        sku: { requerido: false },
        capacidad: { requerido: false, tipo: "decimal" },
        prefijo: { requerido: false },
    },
    onChange: (modelo, campo) => {
        if (campo === "sku" && (modelo.sku === null || modelo.sku === "")) {
            return { ...modelo, sku: null, capacidad: null };
        }
        return modelo;
    },
    validacion: (modelo: NuevoTipoCaja) => {
        if (modelo.sku && !modelo.capacidad) {
            return "La capacidad es requerida";
        }
        return true;
    }
};
