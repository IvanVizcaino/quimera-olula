import { whoAmI, whoAmIStorage } from "#/auth/login/infraestructura.ts";
import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { ContextoPaginaSuscripcion, EstadoPaginaSuscripcion, NuevoMandato, Objetivo } from "../diseño.ts";
import { fechaCorta, RUTA_SUSCRIPCION, urlsRetornoPago } from "../dominio.ts";
import {
    getCatalogo, getMiSuscripcion, postCambiar, postCancelar, postMandatoSepa, postPagar, postPortal,
} from "../infraestructura.ts";

type ProcesarPagina = ProcesarContexto<EstadoPaginaSuscripcion, ContextoPaginaSuscripcion>;

export const contextoPaginaInicial: ContextoPaginaSuscripcion = {
    estado: "CARGANDO",
    mi: null,
    catalogo: null,
    error: "",
    aviso: "",
};

const mensajeDe = (e: unknown): string => {
    const err = e as { descripcion?: string; message?: string } | null;
    return err?.descripcion || err?.message || "No se ha podido cargar tu suscripción.";
};

/** El aviso global y las reglas dependen de whoami: se refresca tras cada cambio (si falla, se ignora). */
const refrescarWhoami = async () => {
    try {
        whoAmIStorage.actualizar(await whoAmI());
    } catch {
        // El siguiente refresco periódico de la sesión lo corregirá.
    }
};

const redirigir = (url: string) => window.location.assign(url);

const cargarDatos = async (ctx: ContextoPaginaSuscripcion): Promise<ContextoPaginaSuscripcion> => {
    const [mi, catalogo] = await Promise.all([getMiSuscripcion(), getCatalogo()]);
    return {
        ...ctx, mi, catalogo, error: "",
        estado: mi.suscripcion && mi.plan ? "ABIERTA" : "SIN_SUSCRIPCION",
    };
};

/** Carga inicial o recarga. El payload opcional es el resultado del pago al volver de la pasarela. */
const cargarContexto = async (
    ctx: ContextoPaginaSuscripcion, pago?: "ok" | "cancelado",
): Promise<ContextoPaginaSuscripcion> => {
    try {
        const nuevo = await cargarDatos(ctx);
        if (pago === "ok") {
            await refrescarWhoami();
            return {
                ...nuevo,
                aviso: "Pago completado. Gracias: tu método de pago ya está guardado. Si no lo ves reflejado, recarga la página en unos segundos.",
            };
        }
        if (pago === "cancelado") {
            return { ...nuevo, aviso: "Has cancelado el pago y no se ha hecho ningún cargo. Puedes intentarlo de nuevo cuando quieras." };
        }
        return nuevo;
    } catch (e) {
        return { ...ctx, estado: "ERROR", error: mensajeDe(e) };
    }
};

export const cargar: ProcesarPagina = async (ctx, payload) =>
    cargarContexto(ctx, payload as "ok" | "cancelado" | undefined);

/** Recarga tras una operación; si la recarga falla se muestra el error de carga. */
const recargarConAviso = async (ctx: ContextoPaginaSuscripcion, aviso: string) => {
    await refrescarWhoami();
    const nuevo = await cargarContexto(ctx);
    return nuevo.estado === "ERROR" ? nuevo : { ...nuevo, aviso };
};

export const iniciarPago: ProcesarPagina = async (ctx) => {
    const { ok, cancelado } = urlsRetornoPago(window.location.origin);
    const r = await postPagar(ok, cancelado);
    if (r.url) {
        redirigir(r.url);
        return { ...ctx, aviso: "Te estamos llevando a la pasarela de pago…" };
    }
    if (r.necesitaMandato) return { ...ctx, estado: "PIDIENDO_MANDATO" };
    return recargarConAviso(ctx, "Método de pago guardado.");
};

export const abrirPortal: ProcesarPagina = async (ctx) => {
    const url = await postPortal(`${window.location.origin}${RUTA_SUSCRIPCION}`);
    if (url) {
        redirigir(url);
        return { ...ctx, aviso: "Te estamos llevando al portal de pagos…" };
    }
    return { ...ctx, aviso: "Tu forma de pago no tiene portal de cliente. Para cambiarla, escríbenos y lo hacemos por ti." };
};

export const aplicarCambio: ProcesarPagina = async (ctx, payload) => {
    const resultado = await postCambiar(payload as Objetivo);
    const efecto = resultado.presupuesto.efecto === "inmediato"
        ? "Tu plan ya está cambiado."
        : `El cambio se aplicará el ${fechaCorta(resultado.presupuesto.fechaEfecto)}.`;
    const nuevo = await recargarConAviso(ctx, efecto);
    return resultado.requierePago && nuevo.estado === "ABIERTA"
        ? iniciarPago({ ...nuevo, aviso: `${efecto} Falta añadir un método de pago.` })
        : nuevo;
};

export const guardarMandato: ProcesarPagina = async (ctx, payload) => {
    await postMandatoSepa(payload as NuevoMandato);
    return recargarConAviso({ ...ctx, estado: "ABIERTA" }, "Domiciliación guardada.");
};

export const cancelarSuscripcion: ProcesarPagina = async (ctx) => {
    await postCancelar(true);
    const fin = ctx.mi?.suscripcion?.finPeriodo;
    return recargarConAviso({ ...ctx, estado: "ABIERTA" },
        fin ? `Suscripción cancelada. Seguirás teniendo acceso hasta el ${fechaCorta(fin)}.` : "Suscripción cancelada.");
};

export const reanudarSuscripcion: ProcesarPagina = async (ctx) => {
    await postCancelar(false);
    return recargarConAviso(ctx, "Suscripción reanudada: seguirá renovándose con normalidad.");
};

export const cerrarAviso: ProcesarPagina = async (ctx) => ({ ...ctx, aviso: "" });
