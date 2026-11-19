import { MetaModelo } from "@olula/lib/dominio.js";
import { Plan } from "../../plan/diseño.js";
import { NuevoTenant } from "../diseño.js";
import { idTenantValido } from "../dominio.js";

const stringNoVacio = (v: string) => v.trim().length > 0;

export const metaNuevoTenant: MetaModelo<NuevoTenant> = {
    campos: {
        id: {
            requerido: true,
            validacion: (m) => idTenantValido(m.id) || "Minúsculas, números y _; empieza por letra (2-40 caracteres)",
        },
        nombre: { requerido: true, validacion: (m) => stringNoVacio(m.nombre) },
        nif: { requerido: false },
        emailContacto: { requerido: true, tipo: "texto", validacion: (m) => stringNoVacio(m.emailContacto) },
        adminEmail: { requerido: true, validacion: (m) => stringNoVacio(m.adminEmail) },
        adminNombre: { requerido: true, validacion: (m) => stringNoVacio(m.adminNombre) },
        adminContrasena: { requerido: true, validacion: (m) => stringNoVacio(m.adminContrasena) },
        planId: { requerido: false },
        periodicidad: { requerido: true },
        conPrueba: { tipo: "checkbox" },
    },
};

/** Plan de partida del alta: el destacado, o el primero activo. Vacío si no hay ninguno. */
export const planInicialAlta = (planes: Plan[]): string => {
    const activos = planes.filter((p) => p.activo);
    return (activos.find((p) => p.destacado) ?? activos[0])?.id ?? "";
};
