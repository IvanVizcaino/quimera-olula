import { aImporte, importeValido, textoANumero } from "../comun/dominio.js";
import { Catalogo, ModuloCatalogo } from "../catalogo/diseño.js";
import { ModoMcp, ModoModulo, MODULO_MCP, Plan, PlanLimite, PlanModulo, Precio } from "./diseño.js";

export const etiquetaModo: Record<ModoModulo, string> = {
    incluido: "Incluido",
    extra: "Extra",
    no_disponible: "No disponible",
};

export const etiquetaModoMcp: Record<ModoMcp, string> = {
    lectura: "Lectura",
    escritura: "Lectura y escritura",
};

export const planVacioBase: Plan = {
    id: "",
    nombre: "",
    descripcion: "",
    precio: { mensual: "0.00", anual: "0.00" },
    diasPrueba: 0,
    publico: false,
    activo: true,
    destacado: false,
    orden: 0,
    modulos: [],
    limites: [],
    avisos: [],
};

const moduloNoDisponible = (moduloId: string): PlanModulo => ({
    moduloId, modo: "no_disponible", precio: null, opciones: {},
});

const limiteVacio = (limiteId: string): PlanLimite => ({ limiteId, valor: 0, ampliable: false });

/**
 * Deja el plan con exactamente una fila por módulo y por límite del catálogo, en el orden
 * del catálogo: lo que falte se añade (módulo no disponible, límite 0) y lo que ya no exista se quita.
 */
export const completarPlan = (plan: Plan, catalogo: Pick<Catalogo, "modulos" | "limites">): Plan => ({
    ...plan,
    modulos: catalogo.modulos.map(
        (m) => plan.modulos.find((pm) => pm.moduloId === m.id) ?? moduloNoDisponible(m.id)
    ),
    limites: catalogo.limites.map(
        (l) => plan.limites.find((pl) => pl.limiteId === l.id) ?? limiteVacio(l.id)
    ),
});

/** Plan nuevo: parte de un plan vacío, con todos los módulos y límites del catálogo. */
export const planNuevo = (
    id: string, nombre: string, catalogo: Pick<Catalogo, "modulos" | "limites">
): Plan => completarPlan({ ...planVacioBase, id, nombre: nombre.trim() }, catalogo);

/** Copia del plan con otro id y nombre. La copia no sale pública ni destacada hasta que se decida. */
export const duplicarPlan = (plan: Plan, id: string, nombre: string): Plan => ({
    ...plan,
    id,
    nombre: nombre.trim(),
    publico: false,
    destacado: false,
    activo: true,
    avisos: [],
    precio: { ...plan.precio },
    modulos: plan.modulos.map((m) => ({ ...m, precio: m.precio ? { ...m.precio } : null, opciones: { ...m.opciones } })),
    limites: plan.limites.map((l) => ({ ...l })),
});

/** Un módulo no contratable suelto solo puede ir incluido o no disponible. */
export const modosPermitidos = (modulo: ModuloCatalogo): ModoModulo[] =>
    modulo.contratableSuelto ? ["incluido", "extra", "no_disponible"] : ["incluido", "no_disponible"];

export const cambiarModoModulo = (
    plan: Plan, moduloId: string, modo: ModoModulo, modulos: ModuloCatalogo[]
): Plan => {
    const catalogo = modulos.find((m) => m.id === moduloId);
    if (!catalogo || !modosPermitidos(catalogo).includes(modo)) return plan;
    return {
        ...plan,
        modulos: plan.modulos.map((pm) => {
            if (pm.moduloId !== moduloId) return pm;
            const opciones = moduloId === MODULO_MCP && modo !== "no_disponible"
                ? { mcpModo: pm.opciones.mcpModo ?? "lectura" as ModoMcp }
                : {};
            return { ...pm, modo, precio: modo === "extra" ? pm.precio : null, opciones };
        }),
    };
};

export const cambiarModoMcp = (plan: Plan, modo: ModoMcp): Plan => ({
    ...plan,
    modulos: plan.modulos.map((pm) =>
        pm.moduloId === MODULO_MCP ? { ...pm, opciones: { ...pm.opciones, mcpModo: modo } } : pm
    ),
});

/**
 * Precio especial del extra. Los dos campos vacíos = sin precio especial (se usa el suelto del módulo).
 * Si solo se rellena uno, el otro queda vacío hasta que se complete (se valida con `precioExtraIncompleto`).
 */
export const cambiarPrecioExtra = (
    plan: Plan, moduloId: string, campo: keyof Precio, valor: string
): Plan => ({
    ...plan,
    modulos: plan.modulos.map((pm) => {
        if (pm.moduloId !== moduloId) return pm;
        const actual = pm.precio ?? { mensual: "", anual: "" };
        const nuevo = { ...actual, [campo]: valor };
        const vacio = nuevo.mensual.trim() === "" && nuevo.anual.trim() === "";
        return { ...pm, precio: vacio ? null : nuevo };
    }),
});

export const precioExtraIncompleto = (pm: PlanModulo): boolean =>
    pm.modo === "extra" && pm.precio !== null && !(importeValido(pm.precio.mensual) && importeValido(pm.precio.anual));

export const cambiarLimite = (plan: Plan, limiteId: string, cambios: Partial<PlanLimite>): Plan => ({
    ...plan,
    limites: plan.limites.map((l) => (l.limiteId === limiteId ? { ...l, ...cambios } : l)),
});

/** Valor del límite desde el texto del input: vacío = ilimitado (null). */
export const valorLimiteDesdeTexto = (texto: string): number | null => {
    const n = textoANumero(texto);
    return n === null ? null : Math.max(0, Math.trunc(n));
};

/** Problemas que impiden guardar (los del backend se muestran tal cual al guardar). */
export const problemasPlan = (plan: Plan): string[] => {
    const problemas: string[] = [];
    if (plan.nombre.trim() === "") problemas.push("El nombre es obligatorio");
    if (!importeValido(plan.precio.mensual) || !importeValido(plan.precio.anual)) {
        problemas.push("Los precios mensual y anual deben ser importes válidos");
    }
    if (plan.modulos.some(precioExtraIncompleto)) {
        problemas.push("El precio especial de un extra necesita mensual y anual (o déjalos los dos vacíos)");
    }
    return problemas;
};

/** Plan listo para el PUT: importes normalizados a dos decimales. */
export const planParaGuardar = (plan: Plan): Plan => ({
    ...plan,
    nombre: plan.nombre.trim(),
    precio: { mensual: aImporte(plan.precio.mensual), anual: aImporte(plan.precio.anual) },
    modulos: plan.modulos.map((m) => ({
        ...m,
        precio: m.modo === "extra" && m.precio
            ? { mensual: aImporte(m.precio.mensual), anual: aImporte(m.precio.anual) }
            : null,
    })),
});

export const planModificado = (a: Plan, b: Plan): boolean =>
    JSON.stringify({ ...a, avisos: [] }) !== JSON.stringify({ ...b, avisos: [] });

export const moduloDePlan = (plan: Plan, moduloId: string): PlanModulo | undefined =>
    plan.modulos.find((m) => m.moduloId === moduloId);

export const modulosIncluidos = (plan: Plan): PlanModulo[] => plan.modulos.filter((m) => m.modo === "incluido");
export const modulosExtra = (plan: Plan): PlanModulo[] => plan.modulos.filter((m) => m.modo === "extra");

/** Precio con el que se vende un módulo extra en el plan: el especial o el suelto. */
export const precioExtraEfectivo = (pm: PlanModulo, modulo: ModuloCatalogo | undefined): Precio | null =>
    pm.precio ?? modulo?.precio ?? null;

/** Sustituye (o añade) un plan en la lista, manteniendo el orden por `orden` y luego nombre. */
export const ordenarPlanes = (planes: Plan[]): Plan[] =>
    [...planes].sort((a, b) => a.orden - b.orden || a.nombre.localeCompare(b.nombre));

export const sustituirPlan = (planes: Plan[], plan: Plan): Plan[] =>
    ordenarPlanes(planes.some((p) => p.id === plan.id)
        ? planes.map((p) => (p.id === plan.id ? plan : p))
        : [...planes, plan]);
