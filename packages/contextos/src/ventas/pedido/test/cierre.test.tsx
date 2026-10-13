import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import type { Pedido } from "../diseño.ts";

const { patch, post, getPedidosMock } = vi.hoisted(() => ({
    patch: vi.fn(),
    post: vi.fn(),
    getPedidosMock: vi.fn(),
}));

vi.mock("@olula/lib/api/rest_api.ts", () => ({
    RestAPI: { patch, post, get: vi.fn() },
}));

const dominio = await import("../dominio.ts");
const { pedidoVacio } = await import("../detalle/detalle.ts");
const { getMaquina: maquinaDetalle } = await import("../detalle/maquina.ts");
const { getMaquina: maquinaMaestro } = await import("../maestro/maquina.ts");
const infra = await import("../infraestructura.ts");

const pedido = (servido: string, cerradas: boolean[] = []): Pedido => ({
    ...pedidoVacio(),
    id: "17",
    servido,
    lineas: cerradas.map((cerrada, i) => ({ id: String(i), cerrada }) as unknown as Pedido["lineas"][number]),
});

describe("cierre de pedido: dominio (Eneboo abrirCerrarPedido)", () => {
    test("pendiente o parcial sin líneas cerradas: se puede cerrar", () => {
        expect(dominio.modoCierrePedido(pedido("PENDIENTE", [false]))).toBe("cerrar");
        expect(dominio.modoCierrePedido(pedido("PARCIAL"))).toBe("cerrar");
    });

    test("con alguna línea cerrada se ofrece abrir, aunque el pedido figure servido", () => {
        expect(dominio.modoCierrePedido(pedido("PENDIENTE", [false, true]))).toBe("abrir");
        expect(dominio.modoCierrePedido(pedido("TOTAL", [true]))).toBe("abrir");
    });

    test("servido completamente y sin líneas cerradas: no hay acción (Eneboo avisa 'ya servido')", () => {
        expect(dominio.modoCierrePedido(pedido("TOTAL", [false]))).toBeNull();
    });

    test("el servido total se reconoce con el literal del detalle (TOTAL) y el de BD del listado (Sí)", () => {
        for (const s of ["TOTAL", "SERVIDO", "Sí", "SI", "sí"]) {
            expect(dominio.pedidoServidoTotal({ servido: s })).toBe(true);
            expect(dominio.pedidoEsEditable({ servido: s })).toBe(false);
        }
        for (const s of ["No", "Parcial", "PENDIENTE", "PARCIAL", undefined]) {
            expect(dominio.pedidoEsEditable({ servido: s })).toBe(true);
        }
    });

    test("mensajes literales de Eneboo", () => {
        expect(dominio.mensajeCierrePedido("cerrar")).toBe(
            "Se va a cerrar el pedido y no podrá terminar de servirse.\n¿Desea continuar?",
        );
        expect(dominio.mensajeCierrePedido("abrir")).toBe(
            "El pedido seleccionado tiene líneas cerradas.\n¿Seguro que desea abrirlas?",
        );
    });
});

describe("cierre de pedido: infraestructura", () => {
    beforeEach(() => {
        patch.mockReset().mockResolvedValue(undefined);
        post.mockReset();
    });

    test("patchCerrarPedido envía {cerrar} a /<id>/cerrar", async () => {
        await infra.patchCerrarPedido("17", true);
        await infra.patchCerrarPedido("17", false);
        expect(patch).toHaveBeenNthCalledWith(1, expect.stringMatching(/\/17\/cerrar$/), { cerrar: true }, expect.any(String));
        expect(patch).toHaveBeenNthCalledWith(2, expect.stringMatching(/\/17\/cerrar$/), { cerrar: false }, expect.any(String));
    });

    test("postCerrarPedidosHastaFecha envía fecha ISO y simular; acepta respuesta con o sin 'datos'", async () => {
        post.mockResolvedValueOnce({ pedido_ids: [17, 18], total: 2, cerrados: false });
        const r = await infra.postCerrarPedidosHastaFecha(new Date("2026-10-08"), true);
        expect(post).toHaveBeenCalledWith(
            expect.stringMatching(/\/cerrar-hasta-fecha$/),
            { fecha_hasta: "2026-10-08", simular: true },
            expect.any(String),
        );
        expect(r).toEqual({ pedidoIds: ["17", "18"], total: 2, cerrados: false });

        post.mockResolvedValueOnce({ datos: { pedido_ids: [], total: 0, cerrados: true } });
        expect(await infra.postCerrarPedidosHastaFecha(new Date("2026-10-08"), false)).toEqual({
            pedidoIds: [],
            total: 0,
            cerrados: true,
        });
    });
});

describe("cierre de pedido: máquinas", () => {
    test("detalle: cerrar se pide desde ABIERTO y SERVIDO, y cancelar vuelve a abierto/servido", () => {
        const m = maquinaDetalle();
        expect(m.ABIERTO.cierre_pedido_solicitado).toBe("CERRANDO_PEDIDO");
        expect(m.SERVIDO.cierre_pedido_solicitado).toBe("CERRANDO_PEDIDO");
        expect(m.CERRANDO_PEDIDO.cierre_pedido_listo).toEqual(expect.any(Function));
        expect(m.CERRANDO_PEDIDO.cierre_pedido_cancelado).toEqual([expect.any(Function)]);
    });

    test("maestro: cerrar hasta fecha abre el proceso y se cierra al terminar o cancelar", () => {
        const m = maquinaMaestro();
        expect(m.INICIAL.cierre_hasta_fecha_solicitado).toBe("CERRANDO_HASTA_FECHA");
        expect(m.CERRANDO_HASTA_FECHA.cierre_hasta_fecha_cancelado).toBe("INICIAL");
        expect(m.CERRANDO_HASTA_FECHA.pedidos_cerrados_hasta_fecha).toEqual([expect.any(Function), "INICIAL"]);
    });
});

vi.mock("../infraestructura.ts", async (original) => {
    const real = await original<typeof import("../infraestructura.ts")>();
    return { ...real, getPedidos: (...a: unknown[]) => getPedidosMock(...a) };
});

describe("CerrarPedidosHastaFecha (vista)", () => {
    beforeEach(() => {
        patch.mockReset();
        post.mockReset();
        getPedidosMock.mockReset();
        HTMLDialogElement.prototype.showModal = vi.fn();
        HTMLDialogElement.prototype.close = vi.fn();
    });

    const abrir = async () => {
        const { CerrarPedidosHastaFecha } = await import("../maestro/CerrarPedidosHastaFecha.tsx");
        const publicar = vi.fn();
        render(<CerrarPedidosHastaFecha publicar={publicar} />);
        return publicar;
    };

    const fechaInput = () =>
        document.querySelector('quimera-input[nombre="fechaHasta"] input') as HTMLInputElement;

    test("simula, lista los pedidos afectados con el texto de Eneboo y cierra tras confirmar", async () => {
        const afectado = { ...pedidoVacio(), id: "17", codigo: "PED17", fecha: new Date("2023-06-15") };
        afectado.cliente = { ...afectado.cliente, nombre_cliente: "Cliente Uno" };
        post.mockResolvedValueOnce({ pedido_ids: ["17"], total: 1, cerrados: false });
        getPedidosMock.mockResolvedValue({ datos: [afectado], total: 1 });
        const publicar = await abrir();

        // Sin fecha, ni simular ni cerrar hacen nada.
        await userEvent.click(screen.getByText("Simular"));
        expect(post).not.toHaveBeenCalled();

        await userEvent.type(fechaInput(), "2026-10-08");
        await userEvent.click(screen.getByText("Simular"));

        expect(await screen.findByText("Se van a cerrar 1 pedidos anteriores a la fecha 08/10/2026.")).toBeInTheDocument();
        expect(screen.getByText(/PED17 · Cliente Uno · 2023-06-15/)).toBeInTheDocument();
        expect(post).toHaveBeenCalledWith(expect.any(String), { fecha_hasta: "2026-10-08", simular: true }, expect.any(String));
        expect(getPedidosMock.mock.calls[0][0]).toEqual([["id", "in", [17]]]);

        post.mockResolvedValueOnce({ pedido_ids: ["17"], total: 1, cerrados: true });
        await userEvent.click(screen.getByText("Cerrar 1 pedidos"));
        await waitFor(() => expect(publicar).toHaveBeenCalledWith("pedidos_cerrados_hasta_fecha"));
        expect(post).toHaveBeenLastCalledWith(expect.any(String), { fecha_hasta: "2026-10-08", simular: false }, expect.any(String));
    });

    test("getPedidos serializa el filtro id in como q con ids numéricos", async () => {
        const { criteriaQuery } = await import("@olula/lib/infraestructura.ts");
        const q = criteriaQuery([["id", "in", [12, 15, 18] as unknown as string]], ["fecha", "ASC"], { pagina: 1, limite: 100 });
        expect(JSON.parse(decodeURIComponent(q.slice(3))).filtro).toEqual([["id", "in", [12, 15, 18]]]);
    });

    test("sin pedidos afectados no permite cerrar", async () => {
        post.mockResolvedValueOnce({ pedido_ids: [], total: 0, cerrados: false });
        const publicar = await abrir();
        await userEvent.type(fechaInput(), "2020-01-01");
        await userEvent.click(screen.getByText("Simular"));
        expect(await screen.findByText("No hay pedidos pendientes anteriores a la fecha 01/01/2020.")).toBeInTheDocument();
        await userEvent.click(screen.getByText("Cerrar pedidos"));
        expect(post).toHaveBeenCalledTimes(1);
        expect(publicar).not.toHaveBeenCalled();
    });

    test("si el listado de afectados falla, la simulación sigue mostrando el recuento", async () => {
        post.mockResolvedValueOnce({ pedido_ids: ["1", "2"], total: 2, cerrados: false });
        getPedidosMock.mockRejectedValue(new Error("boom"));
        await abrir();
        await userEvent.type(fechaInput(), "2026-01-01");
        await userEvent.click(screen.getByText("Simular"));
        expect(await screen.findByText(/Se van a cerrar 2 pedidos/)).toBeInTheDocument();
    });

    test("cambiar la fecha invalida la simulación", async () => {
        post.mockResolvedValueOnce({ pedido_ids: ["1"], total: 1, cerrados: false });
        getPedidosMock.mockResolvedValue({ datos: [], total: 0 });
        await abrir();
        await userEvent.type(fechaInput(), "2026-01-01");
        await userEvent.click(screen.getByText("Simular"));
        await screen.findByText(/Se van a cerrar 1 pedidos/);
        fireEvent.change(fechaInput(), { target: { value: "2026-02-02" } });
        expect(screen.queryByText(/Se van a cerrar/)).not.toBeInTheDocument();
    });
});

describe("CerrarPedido (vista detalle)", () => {
    beforeEach(() => {
        HTMLDialogElement.prototype.showModal = vi.fn();
        HTMLDialogElement.prototype.close = vi.fn();
    });

    test("confirmar cierre emite cierre_pedido_listo con true; con líneas cerradas emite false", async () => {
        const { CerrarPedido } = await import("../cerrar/CerrarPedido.tsx");

        const publicar1 = vi.fn();
        const { unmount } = render(<CerrarPedido pedido={pedido("PARCIAL", [false])} publicar={publicar1} />);
        const msg = await screen.findByText(/Se va a cerrar el pedido/);
        await userEvent.click(within(msg.closest("dialog")!).getByText("Aceptar"));
        await waitFor(() => expect(publicar1).toHaveBeenCalledWith("cierre_pedido_listo", true));
        unmount();

        const publicar2 = vi.fn();
        render(<CerrarPedido pedido={pedido("TOTAL", [true])} publicar={publicar2} />);
        const msg2 = await screen.findByText(/tiene líneas cerradas/);
        await userEvent.click(within(msg2.closest("dialog")!).getByText("Aceptar"));
        await waitFor(() => expect(publicar2).toHaveBeenCalledWith("cierre_pedido_listo", false));
    });
});
