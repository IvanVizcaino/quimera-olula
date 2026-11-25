import { MetaModelo } from "@olula/lib/dominio.ts";
import { motivoTextoNoValido, primerError, sinTexto } from "../comun/dominio.ts";
import { CentroCoste, NuevoCentroCoste } from "./diseño.ts";

/** Longitudes de pr_centroscoste.mtd. */
export const LONGITUD_CODIGO_CENTRO = 25;
export const LONGITUD_DESCRIPCION_CENTRO = 100;

export const validarCentroCoste = (c: Pick<NuevoCentroCoste, "id" | "descripcion" | "tipoCentroId">): string | true =>
    primerError(
        motivoTextoNoValido(c.id, "El código", LONGITUD_CODIGO_CENTRO),
        motivoTextoNoValido(c.descripcion, "La descripción", LONGITUD_DESCRIPCION_CENTRO),
        sinTexto(c.tipoCentroId) ? "El tipo de centro es obligatorio" : null,
    );

const campos = {
    id: { requerido: true },
    descripcion: { requerido: true },
    tipoCentroId: { requerido: true },
};

export const centroCosteVacio = (): CentroCoste => ({ id: "", descripcion: "", tipoCentroId: "", tipoCentro: "" });

/** Constante estable (no función) para el formulario de alta. */
export const nuevoCentroCosteVacio: NuevoCentroCoste = { id: "", descripcion: "", tipoCentroId: "" };

export const metaCentroCoste: MetaModelo<CentroCoste> = { campos, validacion: validarCentroCoste };
export const metaNuevoCentroCoste: MetaModelo<NuevoCentroCoste> = { campos, validacion: validarCentroCoste };
