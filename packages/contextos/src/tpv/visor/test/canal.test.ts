import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { MensajeVisor } from "../diseño.ts";
import { escucharVisor, publicarEnVisor, reiniciarCanalTpv } from "../canal.ts";
import { ventaVisor } from "./fixtures.ts";

const esperar = () => new Promise((r) => setTimeout(r, 50));

/**
 * BroadcastChannel en memoria con la semántica del real: entrega asíncrona a los demás
 * canales abiertos con el mismo nombre, nunca al emisor. En jsdom el de Node no sirve:
 * despacha MessageEvent que no son instancias del Event de jsdom y ningún mensaje llega.
 */
class CanalEnMemoria {
    static abiertos = new Set<CanalEnMemoria>();
    onmessage: ((evento: MessageEvent) => void) | null = null;

    constructor(readonly name: string) {
        CanalEnMemoria.abiertos.add(this);
    }

    postMessage(datos: unknown): void {
        const copia = structuredClone(datos);
        for (const canal of CanalEnMemoria.abiertos) {
            if (canal !== this && canal.name === this.name) {
                setTimeout(() => canal.onmessage?.({ data: copia } as MessageEvent), 0);
            }
        }
    }

    close(): void {
        CanalEnMemoria.abiertos.delete(this);
    }
}

beforeAll(() => vi.stubGlobal("BroadcastChannel", CanalEnMemoria));
afterAll(() => vi.unstubAllGlobals());

describe("canal del visor de cliente", () => {
    afterEach(() => reiniciarCanalTpv());

    it("el visor recibe lo que publica el TPV", async () => {
        const recibidos: MensajeVisor[] = [];
        const dejarDeEscuchar = escucharVisor((m) => recibidos.push(m));
        await esperar();

        publicarEnVisor({ tipo: "venta", venta: ventaVisor(), metodo: null });
        publicarEnVisor({ tipo: "limpiar" });
        await esperar();
        dejarDeEscuchar();

        expect(recibidos.map((m) => m.tipo)).toContain("venta");
        expect(recibidos.at(-1)?.tipo).toBe("limpiar");
    });

    it("un visor abierto a mitad de venta recibe el estado del TPV", async () => {
        publicarEnVisor({ tipo: "venta", venta: ventaVisor(), metodo: "tarjeta" });

        const recibidos: MensajeVisor[] = [];
        const dejarDeEscuchar = escucharVisor((m) => recibidos.push(m));
        await esperar();
        dejarDeEscuchar();

        const estado = recibidos.find((m) => m.tipo === "estado");
        expect(estado?.tipo === "estado" && estado.estado.venta?.id).toBe("v1");
        expect(estado?.tipo === "estado" && estado.estado.cobro?.metodo).toBe("tarjeta");
    });
});
