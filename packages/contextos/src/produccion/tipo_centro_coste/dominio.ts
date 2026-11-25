import { MetaModelo } from "@olula/lib/dominio.ts";
import { motivoTextoNoValido, primerError } from "../comun/dominio.ts";
import { NuevoTipoCentroCoste, TipoCentroCoste } from "./diseño.ts";

/** Longitudes de pr_tiposcentrocoste.mtd. */
export const LONGITUD_CODIGO_TIPO_CENTRO = 25;
export const LONGITUD_DESCRIPCION_TIPO_CENTRO = 100;

export const validarTipoCentroCoste = (s: Pick<NuevoTipoCentroCoste, "id" | "descripcion">): string | true =>
    primerError(
        motivoTextoNoValido(s.id, "El código", LONGITUD_CODIGO_TIPO_CENTRO),
        motivoTextoNoValido(s.descripcion, "La descripción", LONGITUD_DESCRIPCION_TIPO_CENTRO),
    );

const campos = {
    id: { requerido: true },
    descripcion: { requerido: true },
};

export const tipoCentroCosteVacio = (): TipoCentroCoste => ({ id: "", descripcion: "" });

/** Constante estable (no función) para el formulario de alta. */
export const nuevoTipoCentroCosteVacio: NuevoTipoCentroCoste = { id: "", descripcion: "" };

export const metaTipoCentroCoste: MetaModelo<TipoCentroCoste> = { campos, validacion: validarTipoCentroCoste };
export const metaNuevoTipoCentroCoste: MetaModelo<NuevoTipoCentroCoste> = { campos, validacion: validarTipoCentroCoste };
