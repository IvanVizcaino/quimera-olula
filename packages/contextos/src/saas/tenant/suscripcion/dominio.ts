import { Catalogo } from "../../catalogo/diseño.js";
import { importeValido, normalizarImporte, textoANumero } from "../../comun/dominio.js";
import { Plan } from "../../plan/diseño.js";
import {
    CambioPlan, CambiosSuscripcion, CuerpoExcepcion, DatosSuscripcion, EstadoFactura, EstadoSuscripcion,
    ExcepcionLimite, FacturaSuscripcion, FormCondiciones, FormExcepcion, OrigenModulo, Periodicidad,
    SuscripcionTenant,
} from "./diseño.js";

export const etiquetaEstadoSuscripcion: Record<EstadoSuscripcion, string> = {
    prueba: "En prueba",
    activa: "Activa",
    impagada: "Impagada",
    solo_lectura: "Solo lectura",
    finalizada: "Finalizada",
};

export const varianteEstadoSuscripcion = (estado: EstadoSuscripcion) => {
    switch (estado) {
        case "activa": return "exito";
        case "prueba": return "primario";
        case "impagada": return "error";
        case "solo_lectura": return "advertencia";
        default: return "gris";
    }
};

export const etiquetaOrigenModulo = (origen: OrigenModulo | null): string => {
    switch (origen) {
        case "plan": return "Plan";
        case "extra": return "Extra";
        case "cortesia": return "Cortesía";
        default: return "";
    }
};

export const varianteOrigenModulo = (origen: OrigenModulo | null) =>
    origen === "plan" ? "exito" : origen === "extra" ? "primario" : origen === "cortesia" ? "advertencia" : "gris";

export const etiquetaPeriodicidad: Record<Periodicidad, string> = { mensual: "Mensual", anual: "Anual" };

export const puedePasarASoloLectura = (s: SuscripcionTenant): boolean =>
    s.estado === "activa" || s.estado === "prueba" || s.estado === "impagada";

export const puedeReactivarSuscripcion = (s: SuscripcionTenant): boolean =>
    s.estado === "solo_lectura" || s.estado === "impagada";

export const facturaPendiente = (f: Pick<FacturaSuscripcion, "estado">): boolean => f.estado === "pendiente";

export const varianteEstadoFactura = (estado: EstadoFactura) =>
    estado === "pagada" ? "exito" : estado === "pendiente" ? "advertencia" : estado === "devuelta" ? "error" : "gris";

/** Límite como texto: «5», o «Ilimitado» si es null. */
export const textoLimite = (valor: number | null): string => (valor === null ? "Ilimitado" : String(valor));

export const textoUsoLimite = (uso: number, valor: number | null): string => `${uso} / ${textoLimite(valor)}`;

// Cambio de plan

/** Módulos del plan que se pueden contratar como extra. */
export const modulosExtraDelPlan = (plan: Plan | undefined): string[] =>
    plan ? plan.modulos.filter((m) => m.modo === "extra").map((m) => m.moduloId) : [];

/** Planes entre los que elegir: los activos, más el que ya tiene la empresa aunque esté archivado. */
export const planesSeleccionables = (catalogo: Catalogo, planActual: string | null): Plan[] =>
    catalogo.planes.filter((p) => p.activo || p.id === planActual);

/**
 * Deja el cambio coherente con el plan elegido: solo módulos que son extra en ese plan y
 * solo extras con cantidad positiva.
 */
export const normalizarCambio = (cambio: CambioPlan, catalogo: Catalogo): CambioPlan => {
    const plan = catalogo.planes.find((p) => p.id === cambio.planId);
    const permitidos = modulosExtraDelPlan(plan);
    const extrasValidos = new Set(catalogo.extras.map((e) => e.id));
    return {
        ...cambio,
        modulos: cambio.modulos.filter((m) => permitidos.includes(m)),
        extras: Object.fromEntries(
            Object.entries(cambio.extras).filter(([id, n]) => n > 0 && extrasValidos.has(id))
        ),
    };
};

/** Punto de partida del modal: lo que tiene contratado la empresa, o el primer plan activo si no tiene suscripción. */
export const cambioInicial = (datos: DatosSuscripcion | null, catalogo: Catalogo): CambioPlan => {
    const s = datos?.suscripcion ?? null;
    if (s) {
        return normalizarCambio({
            planId: s.planId,
            periodicidad: s.periodicidad,
            modulos: [...s.modulos],
            extras: { ...s.extras },
            conPrueba: false,
        }, catalogo);
    }
    return {
        planId: catalogo.planes.find((p) => p.activo)?.id ?? "",
        periodicidad: "mensual",
        modulos: [],
        extras: {},
        conPrueba: true,
    };
};

export const cambiarPlanElegido = (cambio: CambioPlan, planId: string, catalogo: Catalogo): CambioPlan =>
    normalizarCambio({ ...cambio, planId }, catalogo);

export const alternarModulo = (cambio: CambioPlan, moduloId: string, contratado: boolean): CambioPlan => ({
    ...cambio,
    modulos: contratado
        ? [...cambio.modulos.filter((m) => m !== moduloId), moduloId]
        : cambio.modulos.filter((m) => m !== moduloId),
});

export const cambiarCantidadExtra = (cambio: CambioPlan, extraId: string, cantidad: number): CambioPlan => {
    const extras = { ...cambio.extras };
    if (cantidad > 0) extras[extraId] = Math.trunc(cantidad);
    else delete extras[extraId];
    return { ...cambio, extras };
};

// Condiciones

export const formCondiciones = (s: SuscripcionTenant): FormCondiciones => ({
    descuentoPct: s.descuentoPct,
    precioFijadoHasta: s.precioFijadoHasta ?? "",
    notas: s.notas,
    pasarelaId: s.pasarelaId ?? "",
    finPrueba: s.finPrueba ?? "",
    finPeriodo: s.finPeriodo,
});

/** Solo viajan los campos que han cambiado. */
export const cambiosCondiciones = (s: SuscripcionTenant, f: FormCondiciones): CambiosSuscripcion => {
    const inicial = formCondiciones(s);
    const cambios: CambiosSuscripcion = {};
    if (f.descuentoPct !== inicial.descuentoPct) cambios.descuentoPct = normalizarImporte(f.descuentoPct);
    if (f.precioFijadoHasta !== inicial.precioFijadoHasta) cambios.precioFijadoHasta = f.precioFijadoHasta;
    if (f.notas !== inicial.notas) cambios.notas = f.notas;
    if (f.pasarelaId !== inicial.pasarelaId) cambios.pasarelaId = f.pasarelaId === "" ? null : f.pasarelaId;
    if (f.finPrueba !== inicial.finPrueba && f.finPrueba !== "") cambios.finPrueba = f.finPrueba;
    if (f.finPeriodo !== inicial.finPeriodo && f.finPeriodo !== "") cambios.finPeriodo = f.finPeriodo;
    return cambios;
};

export const hayCambiosCondiciones = (s: SuscripcionTenant, f: FormCondiciones): boolean =>
    Object.keys(cambiosCondiciones(s, f)).length > 0;

export const descuentoValido = (texto: string): boolean => {
    if (!importeValido(texto)) return false;
    const n = Number(normalizarImporte(texto));
    return n >= 0 && n <= 100;
};

// Excepciones de límite

export const formExcepcionVacio = (limiteId = ""): FormExcepcion => ({
    limiteId,
    ilimitado: false,
    valor: "",
    motivo: "",
    hasta: "",
});

export const formDeExcepcion = (e: ExcepcionLimite): FormExcepcion => ({
    limiteId: e.limiteId,
    ilimitado: e.valor === null,
    valor: e.valor === null ? "" : String(e.valor),
    motivo: e.motivo,
    hasta: e.hasta ?? "",
});

export const cuerpoExcepcion = (f: FormExcepcion): CuerpoExcepcion => ({
    valor: f.ilimitado ? null : (textoANumero(f.valor) ?? 0),
    motivo: f.motivo.trim(),
    hasta: f.hasta === "" ? null : f.hasta,
});

/** El motivo es obligatorio; el valor, un entero >= 0 salvo que sea ilimitado. */
export const excepcionValida = (f: FormExcepcion): boolean => {
    if (f.limiteId === "" || f.motivo.trim() === "") return false;
    if (f.ilimitado) return true;
    const n = textoANumero(f.valor);
    return n !== null && Number.isInteger(n) && n >= 0;
};

/** «21 %» a partir de "21.00"; vacío si no hay dato. */
export const textoIvaAplicado = (tipoIva: string | null | undefined): string => {
    if (tipoIva === null || tipoIva === undefined || tipoIva === "") return "";
    const n = Number(tipoIva);
    return `${Number.isFinite(n) ? n : tipoIva} %`;
};
