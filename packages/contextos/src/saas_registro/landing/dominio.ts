import { formatearNumero } from "@olula/lib/dominio.ts";
import { Catalogo, Periodicidad, PlanCatalogo } from "../../saas_suscripcion/diseño.ts";
import {
    ahorroAnual, importeEuros, modulosDePlan, ordenarPlanes, planPorDefecto, textoPrecioPlan,
} from "../../saas_suscripcion/dominio.ts";

/** Página pública de bienvenida: es la entrada de Olula SaaS para quien no tiene sesión. */
export const RUTA_LANDING = "/bienvenida";
export const ANCLA_REGISTRO = "registro";
export const ANCLA_PLANES = "planes";
export const ENLACE_REGISTRO_LANDING = `${RUTA_LANDING}#${ANCLA_REGISTRO}`;

const LIMITE_USUARIOS = "usuarios";
const LIMITE_CONSULTAS_IA = "consultas_ia";
const MODULO_MCP = "mcp";

/**
 * Destino de un visitante sin sesión: quien llega a la raíz ve la landing; el resto de rutas
 * protegidas siguen yendo al destino que decidió el middleware de auth (el login).
 */
export const destinoSinSesion = (ruta: string, destinoAuth: string): string =>
    ruta === "/" && destinoAuth === "/login" ? RUTA_LANDING : destinoAuth;

export interface TarjetaPlan {
    id: string;
    nombre: string;
    descripcion: string;
    destacado: boolean;
    /** "49,00 €/mes" */
    precio: string;
    /** Solo en anual: "Ahorras 98,00 € al año"; null si no compensa o es mensual. */
    ahorro: string | null;
    /** "4 usuarios incluidos"; null si el plan no lo define. */
    usuarios: string | null;
    /** "300 consultas al asistente al mes"; null si no tiene asistente. */
    consultasIa: string | null;
    diasPrueba: number;
    modulos: string[];
}

const textoLimite = (plan: PlanCatalogo, catalogo: Catalogo, limiteId: string, sufijo: string): string | null => {
    const limite = plan.limites.find((l) => l.limiteId === limiteId);
    if (!limite || limite.valor === 0) return null;
    const def = catalogo.limites.find((l) => l.id === limiteId);
    if (limite.valor === null) return `${def?.nombre ?? limiteId} ilimitados`;
    return `${formatearNumero(limite.valor)} ${sufijo}`;
};

export const textoAhorro = (plan: PlanCatalogo, periodicidad: Periodicidad): string | null => {
    if (periodicidad !== "anual") return null;
    const ahorro = ahorroAnual(plan.precio);
    return ahorro > 0 ? `Ahorras ${importeEuros(ahorro)} al año` : null;
};

export const construirTarjetasPlanes = (catalogo: Catalogo, periodicidad: Periodicidad): TarjetaPlan[] =>
    ordenarPlanes(catalogo.planes).map((plan) => {
        const usuarios = textoLimite(plan, catalogo, LIMITE_USUARIOS, "usuarios incluidos");
        const consultas = textoLimite(plan, catalogo, LIMITE_CONSULTAS_IA, "consultas al asistente al mes");
        return {
            id: plan.id,
            nombre: plan.nombre,
            descripcion: plan.descripcion,
            destacado: plan.destacado,
            precio: textoPrecioPlan(plan, periodicidad),
            ahorro: textoAhorro(plan, periodicidad),
            usuarios,
            consultasIa: consultas,
            diasPrueba: plan.diasPrueba,
            modulos: modulosDePlan(plan, catalogo, "incluido"),
        };
    });

/** Días de prueba del plan destacado (o del de por defecto); 0 si no se conoce o no hay prueba. */
export const diasPruebaDestacado = (catalogo: Catalogo | null): number => {
    if (!catalogo) return 0;
    const plan = catalogo.planes.find((p) => p.destacado) ?? planPorDefecto(catalogo.planes);
    return plan?.diasPrueba ?? 0;
};

/** Nombre del primer plan (por orden) que incluye el conector MCP; null si ninguno.
 * Cuenta el módulo `mcp` incluido: en un plan donde es extra se paga aparte. */
export const primerPlanConMcp = (catalogo: Catalogo | null): string | null => {
    if (!catalogo) return null;
    const plan = ordenarPlanes(catalogo.planes).find((p) =>
        p.modulos.some((m) => m.moduloId === MODULO_MCP && m.modo === "incluido"));
    return plan?.nombre ?? null;
};

export const textoCtaPrueba = (dias: number): string =>
    dias > 0 ? `Prueba ${dias} días gratis` : "Crea tu empresa";
