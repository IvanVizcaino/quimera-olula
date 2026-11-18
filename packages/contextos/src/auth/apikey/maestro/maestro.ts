import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { ApiKey } from "../diseño.ts";
import { getMisApiKeys } from "../infraestructura.ts";
import { ContextoMaestroApiKey, EstadoMaestroApiKey } from "./diseño.ts";

type ProcesarMaestro = ProcesarContexto<EstadoMaestroApiKey, ContextoMaestroApiKey>;

export const recargarClaves: ProcesarMaestro = async (contexto) => ({
    ...contexto,
    claves: await getMisApiKeys(),
});

export const enseñarClaveNueva: ProcesarMaestro = async (contexto, payload) => ({
    ...contexto,
    estado: "CREADA",
    claveNueva: payload as string,
    claves: await getMisApiKeys(),
});

export const olvidarClaveNueva: ProcesarMaestro = async (contexto) => ({
    ...contexto,
    estado: "INICIAL",
    claveNueva: null,
});

export const pedirRevocar: ProcesarMaestro = async (contexto, payload) => ({
    ...contexto,
    estado: "REVOCANDO",
    claveARevocar: payload as ApiKey,
});

export const cancelarRevocar: ProcesarMaestro = async (contexto) => ({
    ...contexto,
    estado: "INICIAL",
    claveARevocar: null,
});

export const quitarRevocada: ProcesarMaestro = async (contexto, payload) => {
    const revocada = payload as ApiKey;
    return {
        ...contexto,
        estado: "INICIAL",
        claveARevocar: null,
        claves: (contexto.claves ?? []).filter((c) => c.id !== revocada.id),
    };
};
