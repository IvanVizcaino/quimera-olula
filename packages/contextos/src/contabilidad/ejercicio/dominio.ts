import { FormCierreEjercicio, PayloadCerrarEjercicio } from "./diseño.ts";

export const formCierreEjercicioVacio = (): FormCierreEjercicio => ({
    ejercicioId: "",
    fecha: "",
    asientoPyg: false,
    asientoCierre: true,
    asientoApertura: false,
    ejercicioAperturaId: "",
});

/** Fecha por defecto Eneboo `dedFecha`: fin de año del codejercicio (4 dígitos). */
export const fechaCierrePorDefecto = (ejercicioId: string): string =>
    /^\d{4}$/.test(ejercicioId.trim()) ? `${ejercicioId.trim()}-12-31` : "";

export const ejercicioAperturaSugerido = (ejercicioId: string): string => {
    const t = ejercicioId.trim();
    if (!/^\d{4}$/.test(t)) return "";
    return String(Number(t) + 1);
};

export const validarFormCierre = (form: FormCierreEjercicio): string | null => {
    const ejercicioId = form.ejercicioId.trim();
    if (!ejercicioId) return "Indique el ejercicio a cerrar.";
    if (!form.fecha.trim()) return "Indique la fecha de los asientos.";
    if (!form.asientoPyg && !form.asientoCierre && !form.asientoApertura) {
        return "Seleccione al menos una operación (PyG, cierre o apertura).";
    }
    if (form.asientoApertura) {
        const dest = form.ejercicioAperturaId.trim();
        if (!dest) return "Si genera asiento de apertura, indique el ejercicio destino.";
        if (dest === ejercicioId) return "El ejercicio de apertura debe ser distinto del que se cierra.";
    }
    return null;
};

export const payloadCerrarDesdeForm = (form: FormCierreEjercicio): PayloadCerrarEjercicio => {
    const payload: PayloadCerrarEjercicio = {
        fecha: form.fecha.trim(),
        asientoPyg: form.asientoPyg,
        asientoCierre: form.asientoCierre,
        asientoApertura: form.asientoApertura,
    };
    if (form.asientoApertura) {
        payload.ejercicioAperturaId = form.ejercicioAperturaId.trim();
    }
    return payload;
};

/** API snake_case desde dominio camelCase */
export const payloadCerrarEjercicioAApi = (payload: PayloadCerrarEjercicio) => ({
    fecha: payload.fecha,
    asiento_pyg: payload.asientoPyg,
    asiento_cierre: payload.asientoCierre,
    asiento_apertura: payload.asientoApertura,
    ...(payload.ejercicioAperturaId ? { ejercicio_apertura_id: payload.ejercicioAperturaId } : {}),
});

export const validarEjercicioId = (ejercicioId: string): string | null =>
    ejercicioId.trim() ? null : "Indique el ejercicio.";
