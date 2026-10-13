import { AgenteTpv } from "../agente/diseño.ts";
import { PuntoVentaTpv } from "../punto_de_venta/diseño.ts";

const CLAVE_PUNTO_VENTA = "punto-venta-tpv-local";
const EVENTO_AGENTE_TPV = "tpv-agente-cambiado";

export const notificarAgenteTpvCambiado = (agente: AgenteTpv) => {
    window.dispatchEvent(new CustomEvent(EVENTO_AGENTE_TPV, { detail: agente }));
};

export const suscribirAgenteTpvCambiado = (onAgente: (agente: AgenteTpv) => void) => {
    const handler = (evento: Event) => {
        onAgente((evento as CustomEvent<AgenteTpv>).detail);
    };
    window.addEventListener(EVENTO_AGENTE_TPV, handler);
    return () => window.removeEventListener(EVENTO_AGENTE_TPV, handler);
};

export const puntoVentaLocal = {

    actualizar: (puntoVenta: PuntoVentaTpv) => {
        localStorage.setItem(CLAVE_PUNTO_VENTA, JSON.stringify(puntoVenta));
    },

    obtener: (): PuntoVentaTpv => {
        const puntoVentaStorage = localStorage.getItem(CLAVE_PUNTO_VENTA);
        if (puntoVentaStorage) {
            const puntoVenta = JSON.parse(puntoVentaStorage);
            return puntoVenta
        }
        throw new Error("No hay punto de venta activo");
    },

    obtenerSeguro: (): PuntoVentaTpv | null => {
        const puntoVentaStorage = localStorage.getItem(CLAVE_PUNTO_VENTA);
        if (puntoVentaStorage) {
            try {
                const puntoVenta = JSON.parse(puntoVentaStorage);
                return puntoVenta
            } catch {
                return null;
            }
        }
        return null;
    },

    borrar: () => {
        localStorage.removeItem(CLAVE_PUNTO_VENTA);
    },
}

const CLAVE_AGENTE_TPV = "agente-tpv-local";

export const agenteActivo = {

    actualizar: (agente: AgenteTpv) => {
        localStorage.setItem(CLAVE_AGENTE_TPV, JSON.stringify(agente));
    },

    obtener: (): AgenteTpv => {
        const agenteStorage = localStorage.getItem(CLAVE_AGENTE_TPV);
        if (agenteStorage) {
            const agente = JSON.parse(agenteStorage);
            return agente
        }
        throw new Error("No hay agente activo");
    },

    obtenerSeguro: (): AgenteTpv | null => {
        const agenteStorage = localStorage.getItem(CLAVE_AGENTE_TPV);
        if (agenteStorage) {
            try {
                const agente = JSON.parse(agenteStorage);
                return agente
            } catch {
                return null;
            }
        }
        return null;
    },

    borrar: () => {
        localStorage.removeItem(CLAVE_AGENTE_TPV);
    },
}