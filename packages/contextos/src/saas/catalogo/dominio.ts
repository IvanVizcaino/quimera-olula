import { MetaModelo } from "@olula/lib/dominio.ts";
import { aImporte, idCatalogoValido, importeValido, MENSAJE_ID_CATALOGO, numeroATexto, textoANumero } from "../comun/dominio.js";
import {
    AlSuperar, CategoriaModulo, ExtraCatalogo, GrupoIvaProducto, FormExtra, FormLimite, FormModulo, LimiteCatalogo, ModuloCatalogo, TipoLimite,
} from "./diseño.js";

const stringNoVacio = (v: string) => v.trim().length > 0;

export const etiquetaTipoLimite: Record<TipoLimite, string> = {
    recuento: "Recuento (puestos)",
    consumo_mensual: "Consumo mensual",
};

export const etiquetaAlSuperar: Record<AlSuperar, string> = {
    bloquear: "Bloquear",
    avisar: "Avisar",
};

const esEnteroNoNegativo = (texto: string): boolean => {
    const n = textoANumero(texto);
    return n !== null && Number.isInteger(n) && n >= 0;
};

// Módulos

export const etiquetaCategoria: Record<CategoriaModulo, string> = {
    contexto: "Módulos",
    plugin: "Plugins",
    servicio: "Servicios",
};

export const modulosDeCategoria = (modulos: ModuloCatalogo[], categoria: CategoriaModulo): ModuloCatalogo[] =>
    modulos.filter((m) => m.categoria === categoria);

export const claveAporta = (limiteId: string): `aporta_${string}` => `aporta_${limiteId}`;

export const moduloAForm = (modulo: ModuloCatalogo, limites: LimiteCatalogo[]): FormModulo => {
    const form: FormModulo = {
        nombre: modulo.nombre,
        descripcion: modulo.descripcion,
        precioMensual: modulo.precio.mensual,
        precioAnual: modulo.precio.anual,
        contratableSuelto: modulo.contratableSuelto,
        publico: modulo.publico,
        variante: modulo.variante ?? "",
    };
    for (const l of limites) {
        form[claveAporta(l.id)] = numeroATexto(modulo.aporta[l.id]);
    }
    return form;
};

/** Solo viajan los límites con una aportación mayor que cero (vacío o 0 = no aporta). */
export const formAModulo = (base: ModuloCatalogo, form: FormModulo, limites: LimiteCatalogo[]): ModuloCatalogo => {
    const aporta: Record<string, number> = {};
    for (const l of limites) {
        const n = textoANumero(form[claveAporta(l.id)] ?? "");
        if (n !== null && n > 0) aporta[l.id] = n;
    }
    return {
        ...base,
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim(),
        precio: { mensual: aImporte(form.precioMensual), anual: aImporte(form.precioAnual) },
        contratableSuelto: form.contratableSuelto,
        publico: form.publico,
        aporta,
        variante: base.plugin ? form.variante : base.variante,
    };
};

export const metaModulo = (limites: LimiteCatalogo[]): MetaModelo<FormModulo> => ({
    campos: {
        nombre: { requerido: true, validacion: (m) => stringNoVacio(m.nombre) },
        descripcion: { requerido: false },
        precioMensual: { requerido: true, validacion: (m) => importeValido(m.precioMensual) || "Importe no válido" },
        precioAnual: { requerido: true, validacion: (m) => importeValido(m.precioAnual) || "Importe no válido" },
        contratableSuelto: { tipo: "checkbox" },
        publico: { tipo: "checkbox" },
        variante: { requerido: false },
        ...Object.fromEntries(limites.map((l) => [
            claveAporta(l.id),
            {
                requerido: false,
                validacion: (m: FormModulo) =>
                    (m[claveAporta(l.id)] ?? "") === "" || esEnteroNoNegativo(m[claveAporta(l.id)] ?? "") || "Número entero",
            },
        ])),
    },
});

// Límites

export const nuevoLimiteVacio: FormLimite = {
    id: "",
    nombre: "",
    unidad: "",
    tipo: "recuento",
    alSuperar: "bloquear",
    umbralAviso: "80",
    orden: "0",
};

export const limiteAForm = (l: LimiteCatalogo): FormLimite => ({
    id: l.id,
    nombre: l.nombre,
    unidad: l.unidad,
    tipo: l.tipo,
    alSuperar: l.alSuperar,
    umbralAviso: String(l.umbralAviso),
    orden: String(l.orden),
});

export const formALimite = (f: FormLimite): LimiteCatalogo => ({
    id: f.id,
    nombre: f.nombre.trim(),
    unidad: f.unidad.trim(),
    tipo: f.tipo,
    alSuperar: f.alSuperar,
    umbralAviso: textoANumero(f.umbralAviso) ?? 80,
    orden: textoANumero(f.orden) ?? 0,
});

export const metaLimite = (nuevo: boolean, idsExistentes: string[]): MetaModelo<FormLimite> => ({
    campos: {
        id: {
            requerido: true,
            validacion: (m) =>
                !nuevo ? true
                    : !idCatalogoValido(m.id) ? MENSAJE_ID_CATALOGO
                        : idsExistentes.includes(m.id) ? "Ya existe un límite con ese identificador"
                            : true,
        },
        nombre: { requerido: true, validacion: (m) => stringNoVacio(m.nombre) },
        unidad: { requerido: true, validacion: (m) => stringNoVacio(m.unidad) },
        tipo: { requerido: true },
        alSuperar: { requerido: true },
        umbralAviso: {
            requerido: true,
            validacion: (m) => {
                const n = textoANumero(m.umbralAviso);
                return (n !== null && Number.isInteger(n) && n >= 1 && n <= 100) || "Entre 1 y 100";
            },
        },
        orden: { requerido: true, validacion: (m) => textoANumero(m.orden) !== null || "Número" },
    },
});

// Extras

export const nuevoExtraVacio: FormExtra = {
    id: "",
    nombre: "",
    descripcion: "",
    limiteId: "",
    cantidad: "1",
    requiereModulo: "",
    precioMensual: "0.00",
    precioAnual: "0.00",
    recurrente: true,
    publico: true,
    activo: true,
    orden: "0",
};

export const extraAForm = (e: ExtraCatalogo): FormExtra => ({
    id: e.id,
    nombre: e.nombre,
    descripcion: e.descripcion,
    limiteId: e.limiteId ?? "",
    cantidad: String(e.cantidad),
    requiereModulo: e.requiereModulo ?? "",
    precioMensual: e.precio.mensual,
    precioAnual: e.precio.anual,
    recurrente: e.recurrente,
    publico: e.publico,
    activo: e.activo,
    orden: String(e.orden),
});

/** Un extra que no amplía ningún límite (p. ej. el alta asistida) no lleva cantidad. */
export const formAExtra = (f: FormExtra): ExtraCatalogo => ({
    id: f.id,
    nombre: f.nombre.trim(),
    descripcion: f.descripcion.trim(),
    limiteId: f.limiteId === "" ? null : f.limiteId,
    cantidad: f.limiteId === "" ? 0 : (textoANumero(f.cantidad) ?? 0),
    requiereModulo: f.requiereModulo === "" ? null : f.requiereModulo,
    precio: { mensual: aImporte(f.precioMensual), anual: aImporte(f.precioAnual) },
    recurrente: f.recurrente,
    publico: f.publico,
    activo: f.activo,
    orden: textoANumero(f.orden) ?? 0,
});

export const metaExtra = (nuevo: boolean, idsExistentes: string[]): MetaModelo<FormExtra> => ({
    campos: {
        id: {
            requerido: true,
            validacion: (m) =>
                !nuevo ? true
                    : !idCatalogoValido(m.id) ? MENSAJE_ID_CATALOGO
                        : idsExistentes.includes(m.id) ? "Ya existe un extra con ese identificador"
                            : true,
        },
        nombre: { requerido: true, validacion: (m) => stringNoVacio(m.nombre) },
        descripcion: { requerido: false },
        limiteId: { requerido: false },
        cantidad: {
            requerido: false,
            validacion: (m) => m.limiteId === "" || (esEnteroNoNegativo(m.cantidad) && Number(m.cantidad) > 0) || "Entero mayor que 0",
        },
        requiereModulo: { requerido: false },
        precioMensual: { requerido: true, validacion: (m) => importeValido(m.precioMensual) || "Importe no válido" },
        precioAnual: { requerido: true, validacion: (m) => importeValido(m.precioAnual) || "Importe no válido" },
        recurrente: { tipo: "checkbox" },
        publico: { tipo: "checkbox" },
        activo: { tipo: "checkbox" },
        orden: { requerido: true, validacion: (m) => textoANumero(m.orden) !== null || "Número" },
    },
});

/** Texto de una opción del selector de IVA: «General (21 %)». */
export const textoGrupoIva = (g: GrupoIvaProducto): string => {
    const n = Number(g.iva);
    const porcentaje = Number.isFinite(n) ? String(n) : g.iva;
    return `${g.descripcion} (${porcentaje} %)`;
};
