import { CredencialExterna } from "../../comun/credencial_externa/diseño.js";
import { CambiosPasarela, FormPasarela, Pasarela, ResumenCiclo } from "./diseño.js";

export const formDePasarela = (p: Pasarela): FormPasarela => ({
    activa: p.activa,
    porDefecto: p.porDefecto,
    modo: p.modo,
    credencialId: p.credencialId ?? "",
    valores: Object.fromEntries(p.campos.map((c) => [c.id, p.publica[c.id] ?? ""])),
});

/** Solo viajan los campos no secretos; sin credencial elegida (o sin tipo) se envía null. */
export const cambiosDeForm = (p: Pasarela, form: FormPasarela): CambiosPasarela => {
    const publica: Record<string, string> = {};
    for (const c of p.campos) publica[c.id] = form.valores[c.id] ?? "";
    return {
        activa: form.activa,
        porDefecto: form.porDefecto,
        modo: form.modo,
        publica,
        credencialId: p.tipoCredencial === null || form.credencialId === "" ? null : form.credencialId,
    };
};

export const formModificado = (p: Pasarela, form: FormPasarela): boolean =>
    JSON.stringify(formDePasarela(p)) !== JSON.stringify(form);

/** Una pasarela por defecto tiene que estar activa. */
export const cambiarActiva = (form: FormPasarela, activa: boolean): FormPasarela =>
    ({ ...form, activa, porDefecto: activa ? form.porDefecto : false });

export const cambiarPorDefecto = (form: FormPasarela, porDefecto: boolean): FormPasarela =>
    ({ ...form, porDefecto, activa: porDefecto ? true : form.activa });

export const sustituirPasarela = (lista: Pasarela[], pasarela: Pasarela): Pasarela[] =>
    lista.map((p) => (p.id === pasarela.id ? pasarela : p));

export const resumenCicloATexto = (r: ResumenCiclo): string =>
    `Suscripciones revisadas: ${r.revisadas}. Cambios: ${r.cambios}. Errores: ${r.errores}.`;

/** Credenciales que puede usar una pasarela: conectores activos del proveedor que pide. */
export const credencialesDePasarela = (lista: CredencialExterna[], proveedor: string | null): CredencialExterna[] =>
    proveedor === null ? [] : lista.filter((c) => c.proveedor === proveedor && c.categoria === "conector" && c.activo);
