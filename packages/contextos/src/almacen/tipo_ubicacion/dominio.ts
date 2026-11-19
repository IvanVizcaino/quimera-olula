import { MetaModelo } from "@olula/lib/dominio.ts";
import { FormatoUbicacion, NuevoTipoUbicacion, TipoUbicacion } from "./diseño.ts";
import { sinTexto } from "#/almacen/comun/dominio.ts";

export const formatosUbicacion: { valor: FormatoUbicacion; descripcion: string }[] = [
    { valor: "HUECO_PALET", descripcion: "Hueco de palé" },
    { valor: "ESTANTE", descripcion: "Estante" },
    { valor: "SUELO", descripcion: "Suelo" },
    { valor: "PLAYA", descripcion: "Playa" },
];

export const descripcionFormatoUbicacion = (formato: string): string =>
    formatosUbicacion.find((f) => f.valor === formato)?.descripcion ?? formato;

/** Un valor opcional es válido si falta o es un número finito >= 0. */
export const numeroNoNegativoONulo = (valor: number | null | undefined): boolean =>
    valor === null || valor === undefined || (Number.isFinite(valor) && valor >= 0);

/** Un valor opcional es válido si falta o es un entero >= 0. */
export const enteroNoNegativoONulo = (valor: number | null | undefined): boolean =>
    numeroNoNegativoONulo(valor) && (valor === null || valor === undefined || Number.isInteger(valor));

type CamposTipoUbicacion = Pick<
    NuevoTipoUbicacion,
    "codigo" | "descripcion" | "formato" | "capacidadPalets" | "pesoMax" | "alturaMax"
>;

/** Devuelve `true` si es válido o el mensaje del primer error. */
export const validarTipoUbicacion = (m: CamposTipoUbicacion): string | true => {
    if (sinTexto(m.codigo)) return "El código es obligatorio";
    if (m.codigo.length > 10) return "El código admite como máximo 10 caracteres";
    if (sinTexto(m.descripcion)) return "La descripción es obligatoria";
    if (sinTexto(m.formato)) return "El formato es obligatorio";
    if (!enteroNoNegativoONulo(m.capacidadPalets)) return "La capacidad de palés debe ser un entero mayor o igual que 0";
    if (!numeroNoNegativoONulo(m.pesoMax)) return "El peso máximo debe ser mayor o igual que 0";
    if (!numeroNoNegativoONulo(m.alturaMax)) return "La altura máxima debe ser mayor o igual que 0";
    return true;
};

const camposTipoUbicacion = {
    codigo: { requerido: true },
    descripcion: { requerido: true },
    formato: { requerido: true },
    capacidadPalets: { requerido: false, tipo: "entero" as const },
    pesoMax: { requerido: false, tipo: "decimal" as const },
    alturaMax: { requerido: false, tipo: "decimal" as const },
    multiReferencia: { tipo: "checkbox" as const },
    multiLote: { tipo: "checkbox" as const },
};

export const tipoUbicacionVacio = (): TipoUbicacion => ({
    id: "",
    codigo: "",
    descripcion: "",
    formato: "HUECO_PALET",
    capacidadPalets: null,
    pesoMax: null,
    alturaMax: null,
    multiReferencia: false,
    multiLote: true,
});

/** Constante estable (no función) para el formulario de alta. */
export const nuevoTipoUbicacionVacio: NuevoTipoUbicacion = {
    codigo: "",
    descripcion: "",
    formato: "HUECO_PALET",
    capacidadPalets: null,
    pesoMax: null,
    alturaMax: null,
    multiReferencia: false,
    multiLote: true,
};

export const metaTipoUbicacion: MetaModelo<TipoUbicacion> = {
    campos: camposTipoUbicacion,
    validacion: validarTipoUbicacion,
};

export const metaNuevoTipoUbicacion: MetaModelo<NuevoTipoUbicacion> = {
    campos: camposTipoUbicacion,
    validacion: validarTipoUbicacion,
};
