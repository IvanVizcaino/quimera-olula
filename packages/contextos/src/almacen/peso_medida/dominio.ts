import { sinTexto } from "#/almacen/comun/dominio.ts";
import { MetaModelo } from "@olula/lib/dominio.ts";
import { NuevoPesoMedida, PesoMedida } from "./diseño.ts";

type CamposPesoMedida = Pick<NuevoPesoMedida, "id" | "descripcion" | "factorConversion">;

/** Devuelve `true` si es válido o el mensaje del primer error (longitudes de pesosmedidas.mtd). */
export const validarPesoMedida = (m: CamposPesoMedida): string | true => {
    if (sinTexto(m.id)) return "La abreviatura es obligatoria";
    if (m.id.trim().length > 10) return "La abreviatura admite como máximo 10 caracteres";
    if (sinTexto(m.descripcion)) return "La descripción es obligatoria";
    if (m.descripcion.length > 100) return "La descripción admite como máximo 100 caracteres";
    const factor = Number(m.factorConversion);
    if (!Number.isFinite(factor) || factor < 0) return "El factor de conversión no puede ser negativo";
    return true;
};

const camposPesoMedida = {
    id: { requerido: true },
    descripcion: { requerido: true },
    magnitud: { requerido: false },
    factorConversion: { requerido: false, tipo: "numero" as const },
};

export const pesoMedidaVacio = (): PesoMedida => ({
    id: "",
    descripcion: "",
    magnitud: "Unidades",
    factorConversion: 0,
});

/** Constante estable (no función) para el formulario de alta. */
export const nuevoPesoMedidaVacio: NuevoPesoMedida = {
    id: "",
    descripcion: "",
    magnitud: "Unidades",
    factorConversion: 0,
};

export const metaPesoMedida: MetaModelo<PesoMedida> = {
    campos: camposPesoMedida,
    validacion: validarPesoMedida,
};

export const metaNuevoPesoMedida: MetaModelo<NuevoPesoMedida> = {
    campos: camposPesoMedida,
    validacion: validarPesoMedida,
};
