import { ERR_IBAN_NO_VALIDO, ibanValido } from "@olula/lib/iban.ts";
import { formatearMoneda, formatearNumero, MetaModelo } from "@olula/lib/dominio.ts";
import { AccionError, ErrorLimite } from "@olula/lib/errores_limite.ts";
import {
    AvisoSuscripcion, Catalogo, Cuota, DerechoLimite, EstadoSuscripcionSaas, ExtraCatalogo, Factura,
    ModuloCatalogo, NuevoMandato, Objetivo, Periodicidad, PlanCatalogo, PrecioPeriodo, Presupuesto,
    Suscripcion, SuscripcionWhoami, Exceso, LimitePlan,
} from "./diseño.ts";

export const PLAN_LEGADO = "legado";
export const RUTA_SUSCRIPCION = "/ajustes/suscripcion";
export const REGLA_SUSCRIPCION = "saas.suscripcion";
export const PLAN_POR_DEFECTO = "pro";
export const MAX_UNIDADES_EXTRA = 99;
/** A partir de este porcentaje de uso la barra avisa de que se está llegando al límite. */
export const UMBRAL_USO_ALTO = 80;

// ---------------------------------------------------------------- formato

/** "2026-12-11" -> "11/12/2026" (sin pasar por Date, para no depender de la zona horaria). */
export const fechaCorta = (iso?: string | null): string => {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso ?? "");
    return m ? `${m[3]}/${m[2]}/${m[1]}` : (iso ?? "");
};

export const importeEuros = (importe: string | number): string => formatearMoneda(importe, "EUR");

export const textoPeriodicidad = (p: Periodicidad): string => (p === "mensual" ? "mes" : "año");

/** "99,00 €/mes" */
export const textoImportePeriodo = (importe: string | number, p: Periodicidad): string =>
    `${importeEuros(importe)}/${textoPeriodicidad(p)}`;

export const textoCuota = (cuota: Cuota): string => textoImportePeriodo(cuota.total, cuota.periodicidad);

/** Ahorro anual frente a pagar doce meses, en euros; 0 si no compensa. */
export const ahorroAnual = (precio: PrecioPeriodo): number => {
    const ahorro = Number(precio.mensual) * 12 - Number(precio.anual);
    return ahorro > 0.005 ? Math.round(ahorro * 100) / 100 : 0;
};

// ---------------------------------------------------------------- estado

export type VarianteEtiqueta = "exito" | "error" | "advertencia" | "primario" | "neutro" | "gris";

export const estadoVisible = (s: Suscripcion): { texto: string; variante: VarianteEtiqueta } => {
    if (s.estado === "finalizada") return { texto: "Finalizada", variante: "gris" };
    if (s.estado === "impagada") return { texto: "Pago pendiente", variante: "error" };
    if (s.estado === "solo_lectura") return { texto: "Solo lectura", variante: "error" };
    if (s.cancelarAlFin) return { texto: `Cancelada: activa hasta el ${fechaCorta(s.finPeriodo)}`, variante: "advertencia" };
    if (s.estado === "prueba") {
        return { texto: s.finPrueba ? `En prueba hasta el ${fechaCorta(s.finPrueba)}` : "En prueba", variante: "primario" };
    }
    return { texto: "Activa", variante: "exito" };
};

export const esLegado = (s: Suscripcion): boolean => s.planId === PLAN_LEGADO;

const ESTADOS_VIVOS: EstadoSuscripcionSaas[] = ["prueba", "activa", "impagada", "solo_lectura"];

export const puedeCancelar = (s: Suscripcion): boolean =>
    !esLegado(s) && !s.cancelarAlFin && ESTADOS_VIVOS.includes(s.estado);

export const puedeReanudar = (s: Suscripcion): boolean =>
    s.cancelarAlFin && ESTADOS_VIVOS.includes(s.estado);

export const necesitaMetodoPago = (s: Suscripcion): boolean =>
    !s.tieneMetodoPago && s.estado !== "finalizada";

export const textoCambioProgramado = (s: Suscripcion, catalogo: Catalogo | null): string | null => {
    if (!s.cambioProgramado) return null;
    const plan = catalogo?.planes.find((p) => p.id === s.cambioProgramado!.planId);
    const nombre = plan?.nombre ?? s.cambioProgramado.planId;
    return `El ${fechaCorta(s.finPeriodo)} pasarás al plan ${nombre} (${s.cambioProgramado.periodicidad}).`;
};

// ---------------------------------------------------------------- uso de límites

export type NivelUso = "normal" | "alto" | "excedido";

export interface UsoLimite {
    id: string;
    nombre: string;
    /** 0-100 (acotado); null si el límite es ilimitado. */
    porcentaje: number | null;
    nivel: NivelUso;
    texto: string;
}

export const usoLimite = (l: DerechoLimite): UsoLimite => {
    const unidad = l.tipo === "consumo_mensual" ? `${l.unidad} este mes` : l.unidad;
    if (l.valor === null) {
        return { id: l.id, nombre: l.nombre, porcentaje: null, nivel: "normal", texto: `${formatearNumero(l.uso)} ${unidad} · ilimitado` };
    }
    if (l.valor === 0) {
        return {
            id: l.id, nombre: l.nombre, porcentaje: l.uso > 0 ? 100 : 0,
            nivel: l.uso > 0 ? "excedido" : "normal",
            texto: l.uso > 0 ? `${formatearNumero(l.uso)} ${unidad}, y tu plan no los incluye` : "No incluido en tu plan",
        };
    }
    const real = (l.uso / l.valor) * 100;
    const nivel: NivelUso = l.uso > l.valor ? "excedido" : real >= UMBRAL_USO_ALTO ? "alto" : "normal";
    return {
        id: l.id, nombre: l.nombre, porcentaje: Math.min(100, Math.round(real)), nivel,
        texto: `${formatearNumero(l.uso)} de ${formatearNumero(l.valor)} ${unidad}`,
    };
};

// ---------------------------------------------------------------- objetivo

export const normalizarObjetivo = (o: Objetivo): Objetivo => ({
    planId: o.planId,
    periodicidad: o.periodicidad,
    modulos: [...new Set(o.modulos)].sort(),
    extras: Object.fromEntries(
        Object.entries(o.extras).filter(([, cantidad]) => cantidad > 0).sort(([a], [b]) => a.localeCompare(b)),
    ),
});

export const claveObjetivo = (o: Objetivo): string => JSON.stringify(normalizarObjetivo(o));

export const objetivosIguales = (a: Objetivo, b: Objetivo): boolean => claveObjetivo(a) === claveObjetivo(b);

export const objetivoDeSuscripcion = (s: Suscripcion): Objetivo =>
    normalizarObjetivo({ planId: s.planId, periodicidad: s.periodicidad, modulos: s.modulos, extras: s.extras });

export const precioEn = (precio: PrecioPeriodo, p: Periodicidad): string => precio[p];

/** Módulos presentes con el plan y los extras elegidos: los incluidos más los marcados. */
export const modulosPresentes = (plan: PlanCatalogo, objetivo: Objetivo): Set<string> =>
    new Set([
        ...plan.modulos.filter((m) => m.modo === "incluido").map((m) => m.moduloId),
        ...objetivo.modulos,
    ]);

export interface ModuloOfrecido {
    id: string;
    nombre: string;
    descripcion: string;
    dependeDe: string[];
    precio: string;
}

/** Módulos que el plan vende como extra, con su precio en la periodicidad elegida. */
export const modulosExtraOfrecidos = (
    plan: PlanCatalogo, catalogo: Catalogo, periodicidad: Periodicidad,
): ModuloOfrecido[] => {
    const lista: [number, ModuloOfrecido][] = [];
    for (const mp of plan.modulos) {
        if (mp.modo !== "extra") continue;
        const m = catalogo.modulos.find((x) => x.id === mp.moduloId);
        if (!m) continue;
        lista.push([m.orden, {
            id: m.id, nombre: m.nombre, descripcion: m.descripcion, dependeDe: m.dependeDe,
            precio: precioEn(mp.precio ?? m.precio, periodicidad),
        }]);
    }
    return lista.sort((a, b) => a[0] - b[0]).map(([, m]) => m);
};

const nombreModulo = (catalogo: Catalogo, id: string): string =>
    catalogo.modulos.find((m) => m.id === id)?.nombre ?? id;

const listaConY = (nombres: string[]): string =>
    nombres.length <= 1 ? (nombres[0] ?? "") : `${nombres.slice(0, -1).join(", ")} y ${nombres[nombres.length - 1]}`;

/** Por qué no se puede marcar un módulo (le faltan los módulos de los que depende); null si se puede. */
export const motivoModuloBloqueado = (
    modulo: ModuloOfrecido | ModuloCatalogo, presentes: Set<string>, catalogo: Catalogo,
): string | null => {
    const faltan = modulo.dependeDe.filter((id) => !presentes.has(id));
    return faltan.length ? `Necesita ${listaConY(faltan.map((id) => nombreModulo(catalogo, id)))}` : null;
};

/** Quita los módulos extra a los que ya les falta alguno de los que dependen (en cascada). */
const podarModulos = (plan: PlanCatalogo, catalogo: Catalogo, modulos: string[]): string[] => {
    let actuales = [...modulos];
    const incluidos = plan.modulos.filter((m) => m.modo === "incluido").map((m) => m.moduloId);
    for (;;) {
        const presentes = new Set([...incluidos, ...actuales]);
        const validos = actuales.filter((id) => {
            const m = catalogo.modulos.find((x) => x.id === id);
            return !m || m.dependeDe.every((d) => presentes.has(d));
        });
        if (validos.length === actuales.length) return actuales;
        actuales = validos;
    }
};

/** Extras con cantidad que se pueden ofrecer: ampliables en el plan y con su módulo presente. */
export const extrasOfrecidos = (
    plan: PlanCatalogo, catalogo: Catalogo, objetivo: Objetivo,
): ExtraCatalogo[] => {
    const presentes = modulosPresentes(plan, objetivo);
    return catalogo.extras
        .filter((e) => {
            if (!e.limiteId) return false;
            const limite: LimitePlan | undefined = plan.limites.find((l) => l.limiteId === e.limiteId);
            if (!limite || !limite.ampliable || limite.valor === null) return false;
            return !e.requiereModulo || presentes.has(e.requiereModulo);
        })
        .sort((a, b) => a.orden - b.orden);
};

const ajustarExtras = (plan: PlanCatalogo, catalogo: Catalogo, objetivo: Objetivo): Objetivo => {
    const ofrecidos = new Set(extrasOfrecidos(plan, catalogo, objetivo).map((e) => e.id));
    return {
        ...objetivo,
        extras: Object.fromEntries(Object.entries(objetivo.extras).filter(([id, c]) => c > 0 && ofrecidos.has(id))),
    };
};

/** Pasa a otro plan conservando lo que sigue teniendo sentido (módulos extra y extras compatibles). */
export const objetivoConPlan = (objetivo: Objetivo, plan: PlanCatalogo, catalogo: Catalogo): Objetivo => {
    const sigueSiendoExtra = objetivo.modulos.filter(
        (id) => plan.modulos.find((m) => m.moduloId === id)?.modo === "extra",
    );
    const base: Objetivo = {
        ...objetivo, planId: plan.id, modulos: podarModulos(plan, catalogo, sigueSiendoExtra),
    };
    return normalizarObjetivo(ajustarExtras(plan, catalogo, base));
};

export const objetivoConModulo = (
    objetivo: Objetivo, moduloId: string, marcado: boolean, plan: PlanCatalogo, catalogo: Catalogo,
): Objetivo => {
    const modulos = marcado
        ? [...new Set([...objetivo.modulos, moduloId])]
        : objetivo.modulos.filter((id) => id !== moduloId);
    const base: Objetivo = { ...objetivo, modulos: podarModulos(plan, catalogo, modulos) };
    return normalizarObjetivo(ajustarExtras(plan, catalogo, base));
};

export const objetivoConExtra = (objetivo: Objetivo, extraId: string, cantidad: number): Objetivo => {
    const c = Math.max(0, Math.min(MAX_UNIDADES_EXTRA, Math.floor(Number.isFinite(cantidad) ? cantidad : 0)));
    return normalizarObjetivo({ ...objetivo, extras: { ...objetivo.extras, [extraId]: c } });
};

export const objetivoConPeriodicidad = (objetivo: Objetivo, periodicidad: Periodicidad): Objetivo =>
    ({ ...objetivo, periodicidad });

// ---------------------------------------------------------------- presupuesto

export const textoEfecto = (p: Presupuesto): string => {
    if (p.efecto === "fin_periodo") {
        return `Se aplica el ${fechaCorta(p.fechaEfecto)}, cuando termine tu periodo actual. Hasta entonces sigues como ahora.`;
    }
    return Number(p.prorrateo) > 0
        ? `Se aplica hoy. Cobramos ${importeEuros(p.prorrateo)} por lo que queda del periodo actual.`
        : "Se aplica hoy, sin cargo adicional por lo que queda del periodo.";
};

export const textoExceso = (e: Exceso, nombrePlan: string, limite?: DerechoLimite): string => {
    const unidad = limite?.unidad ?? e.nombre.toLowerCase();
    if (limite?.tipo === "consumo_mensual") {
        return `Este mes llevas ${formatearNumero(e.uso)} ${unidad} y ${nombrePlan} permite ${formatearNumero(e.limite)}. Podrás hacer este cambio cuando se renueve el periodo.`;
    }
    return `Tienes ${formatearNumero(e.uso)} ${unidad} y ${nombrePlan} permite ${formatearNumero(e.limite)}: libera ${formatearNumero(e.uso - e.limite)} antes de hacer este cambio.`;
};

/** Se puede confirmar si el presupuesto es de lo que hay en pantalla, es aplicable y supone un cambio. */
export const puedeConfirmarCambio = (
    p: Presupuesto | null, objetivo: Objetivo, actual: Objetivo,
): boolean =>
    p !== null
    && p.aplicable
    && p.excesos.length === 0
    && objetivosIguales(p.objetivo, objetivo)
    && !objetivosIguales(objetivo, actual);

// ---------------------------------------------------------------- planes (comparador y registro)

export const ordenarPlanes = (planes: PlanCatalogo[]): PlanCatalogo[] =>
    [...planes].sort((a, b) => a.orden - b.orden);

export const planPorDefecto = (planes: PlanCatalogo[]): PlanCatalogo | null =>
    planes.find((p) => p.id === PLAN_POR_DEFECTO) ?? planes.find((p) => p.destacado) ?? ordenarPlanes(planes)[0] ?? null;

/** "4 usuarios", "300 consultas al mes", "Llamadas por API y MCP ilimitadas"; null si el plan no lo incluye. */
export const textoLimitePlan = (limite: LimitePlan, catalogo: Catalogo): string | null => {
    const def = catalogo.limites.find((l) => l.id === limite.limiteId);
    if (!def) return null;
    if (limite.valor === null) return `${def.nombre}: ilimitado`;
    if (limite.valor === 0) return null;
    const mes = def.tipo === "consumo_mensual" ? " al mes" : "";
    return `${formatearNumero(limite.valor)} ${def.unidad}${mes}`;
};

export const limitesDePlan = (plan: PlanCatalogo, catalogo: Catalogo): string[] =>
    [...plan.limites]
        .sort((a, b) =>
            (catalogo.limites.find((l) => l.id === a.limiteId)?.orden ?? 0)
            - (catalogo.limites.find((l) => l.id === b.limiteId)?.orden ?? 0))
        .map((l) => textoLimitePlan(l, catalogo))
        .filter((t): t is string => t !== null);

export const modulosDePlan = (
    plan: PlanCatalogo, catalogo: Catalogo, modo: "incluido" | "extra",
): string[] =>
    plan.modulos
        .filter((m) => m.modo === modo)
        .map((m) => catalogo.modulos.find((x) => x.id === m.moduloId))
        .filter((m): m is ModuloCatalogo => m !== undefined)
        .sort((a, b) => a.orden - b.orden)
        .map((m) => m.nombre);

export const textoPrueba = (plan: PlanCatalogo | null): string =>
    plan && plan.diasPrueba > 0 ? `${plan.diasPrueba} días gratis, sin tarjeta` : "";

export const textoPrecioPlan = (plan: PlanCatalogo, p: Periodicidad): string =>
    textoImportePeriodo(plan.precio[p], p);

// ---------------------------------------------------------------- pago

export const urlsRetornoPago = (origin: string): { ok: string; cancelado: string } => ({
    ok: `${origin}${RUTA_SUSCRIPCION}?pago=ok`,
    cancelado: `${origin}${RUTA_SUSCRIPCION}?pago=cancelado`,
});

export const resultadoPagoDeUrl = (search: string): "ok" | "cancelado" | null => {
    const pago = new URLSearchParams(search).get("pago");
    return pago === "ok" || pago === "cancelado" ? pago : null;
};

export const nuevoMandatoInicial: NuevoMandato = { titular: "", iban: "" };

export const metaNuevoMandato: MetaModelo<NuevoMandato> = {
    campos: {
        titular: { requerido: true, validacion: (m) => m.titular.trim().length > 0 },
        iban: { requerido: true, validacion: (m) => ibanValido(m.iban) || ERR_IBAN_NO_VALIDO },
    },
};

// ---------------------------------------------------------------- facturas

export const estadoFactura = (f: Factura): { texto: string; variante: VarianteEtiqueta } => {
    switch (f.estado) {
        case "pagada": return { texto: "Pagada", variante: "exito" };
        case "pendiente": return { texto: "Pendiente de cobro", variante: "advertencia" };
        case "devuelta": return { texto: "Devuelta", variante: "error" };
        case "fallida": return { texto: "Cobro fallido", variante: "error" };
        case "anulada": return { texto: "Anulada", variante: "gris" };
        default: return { texto: f.estado ? f.estado.charAt(0).toUpperCase() + f.estado.slice(1) : "—", variante: "neutro" };
    }
};

export const periodoFactura = (f: Factura): string =>
    `${fechaCorta(f.periodoDesde)} - ${fechaCorta(f.periodoHasta)}`;

/** Total con IVA: lo que dice la API (`total` ya lo incluye). */
export const totalFactura = (f: Factura): string => importeEuros(f.total);

// ---------------------------------------------------------------- aviso global (whoami)

export const leerSuscripcionWhoami = (raw: string | null): SuscripcionWhoami | null => {
    if (!raw) return null;
    try {
        const s = (JSON.parse(raw) as { saas?: { suscripcion?: Record<string, unknown> | null } | null })
            .saas?.suscripcion;
        if (!s) return null;
        return {
            planId: String(s.plan_id ?? ""),
            plan: String(s.plan ?? ""),
            estado: s.estado as EstadoSuscripcionSaas,
            finPrueba: (s.fin_prueba as string | null) ?? null,
            finPeriodo: (s.fin_periodo as string | null) ?? null,
            cancelarAlFin: Boolean(s.cancelar_al_fin),
            tieneMetodoPago: Boolean(s.tiene_metodo_pago),
        };
    } catch {
        return null;
    }
};

export const avisoSuscripcion = (s: SuscripcionWhoami | null): AvisoSuscripcion | null => {
    if (!s) return null;
    if (s.estado === "impagada") {
        return {
            variante: "error",
            mensaje: "No hemos podido cobrar tu última cuota. Revisa tu método de pago para no quedarte en solo lectura.",
            accion: "Resolver el pago",
        };
    }
    if (s.estado === "solo_lectura") {
        return {
            variante: "error",
            mensaje: "Tu empresa está en solo lectura: puedes consultar tus datos, pero no modificarlos.",
            accion: "Ver mi suscripción",
        };
    }
    if (s.estado === "finalizada") {
        return { variante: "error", mensaje: "Tu suscripción ha terminado.", accion: "Ver mi suscripción" };
    }
    if (s.cancelarAlFin) {
        return {
            variante: "advertencia",
            mensaje: s.finPeriodo
                ? `Has cancelado tu suscripción: terminará el ${fechaCorta(s.finPeriodo)}.`
                : "Has cancelado tu suscripción: terminará al final del periodo.",
            accion: "Reanudar suscripción",
        };
    }
    if (s.estado === "prueba" && !s.tieneMetodoPago) {
        return {
            variante: "info",
            mensaje: s.finPrueba
                ? `Tu prueba termina el ${fechaCorta(s.finPrueba)}. Añade un método de pago para seguir sin interrupciones.`
                : "Estás en periodo de prueba. Añade un método de pago para seguir sin interrupciones.",
            accion: "Añadir método de pago",
        };
    }
    return null;
};

// ---------------------------------------------------------------- errores de límites

/** Qué se ofrece junto a un error de límite: enlace a la suscripción o remitir al administrador. */
export const accionErrorSuscripcion = (_error: ErrorLimite, puedeVerSuscripcion: boolean): AccionError =>
    puedeVerSuscripcion
        ? { texto: "Ver mi suscripción", url: RUTA_SUSCRIPCION }
        : { texto: "Pide a tu administrador que revise la suscripción de la empresa." };
