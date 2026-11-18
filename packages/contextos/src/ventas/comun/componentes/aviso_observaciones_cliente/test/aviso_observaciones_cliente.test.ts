import { ConfigVentas } from "#/ventas/config/diseño.ts";
import { configVentasPorDefecto } from "#/ventas/config/dominio.ts";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { DependenciasAvisoObservacionesCliente } from "../diseño.ts";
import {
  avisoObservacionesCliente,
  buscarAvisoObservacionesCliente,
  tituloAvisoObservacionesCliente,
} from "../dominio.ts";
import { useAvisoObservacionesCliente } from "../useAvisoObservacionesCliente.ts";

const config = (mostrar: boolean): ConfigVentas => ({
  ...configVentasPorDefecto,
  mostrarObservacionesCliente: mostrar,
});

const dependencias = (
  mostrar: boolean,
  observaciones: Record<string, string | null> = {}
): DependenciasAvisoObservacionesCliente => ({
  getConfig: vi.fn(async () => config(mostrar)),
  getObservaciones: vi.fn(async (id: string) => observaciones[id] ?? null),
});

describe("aviso de observaciones del cliente: decisión", () => {
  test("con el check marcado y observaciones, avisa", () => {
    const aviso = avisoObservacionesCliente(true, "000001", "Paga tarde");
    expect(aviso).toEqual({ clienteId: "000001", observaciones: "Paga tarde" });
    expect(tituloAvisoObservacionesCliente(aviso!)).toBe(
      "Aviso sobre el cliente 000001:"
    );
  });

  test("con el check desmarcado no avisa", () => {
    expect(avisoObservacionesCliente(false, "000001", "Paga tarde")).toBeNull();
  });

  test("sin observaciones (nulas, vacías o en blanco) no avisa", () => {
    expect(avisoObservacionesCliente(true, "000001", null)).toBeNull();
    expect(avisoObservacionesCliente(true, "000001", undefined)).toBeNull();
    expect(avisoObservacionesCliente(true, "000001", "")).toBeNull();
    expect(avisoObservacionesCliente(true, "000001", "  \n ")).toBeNull();
  });

  test("sin cliente registrado no avisa", () => {
    expect(avisoObservacionesCliente(true, null, "x")).toBeNull();
    expect(avisoObservacionesCliente(true, "", "x")).toBeNull();
    expect(avisoObservacionesCliente(true, "None", "x")).toBeNull();
  });

  test("conserva los saltos de línea y recorta los extremos", () => {
    expect(
      avisoObservacionesCliente(true, "000001", " Línea 1\nLínea 2 ")?.observaciones
    ).toBe("Línea 1\nLínea 2");
  });
});

describe("aviso de observaciones del cliente: búsqueda", () => {
  test("lee las observaciones solo si la configuración lo pide", async () => {
    const desactivado = dependencias(false, { "000001": "Paga tarde" });
    expect(await buscarAvisoObservacionesCliente("000001", desactivado)).toBeNull();
    expect(desactivado.getObservaciones).not.toHaveBeenCalled();

    const activado = dependencias(true, { "000001": "Paga tarde" });
    expect(await buscarAvisoObservacionesCliente("000001", activado)).toEqual({
      clienteId: "000001",
      observaciones: "Paga tarde",
    });
  });

  test("sin cliente no consulta nada", async () => {
    const deps = dependencias(true);
    expect(await buscarAvisoObservacionesCliente(null, deps)).toBeNull();
    expect(deps.getConfig).not.toHaveBeenCalled();
  });

  test("un error al leer la configuración o el cliente no avisa ni falla", async () => {
    const sinConfig: DependenciasAvisoObservacionesCliente = {
      getConfig: async () => Promise.reject({ estado: 403 }),
      getObservaciones: async () => "x",
    };
    expect(await buscarAvisoObservacionesCliente("000001", sinConfig)).toBeNull();

    const sinCliente: DependenciasAvisoObservacionesCliente = {
      getConfig: async () => config(true),
      getObservaciones: async () => Promise.reject({ estado: 404 }),
    };
    expect(await buscarAvisoObservacionesCliente("000001", sinCliente)).toBeNull();
  });
});

describe("useAvisoObservacionesCliente", () => {
  test("avisa al elegir un cliente con observaciones y lo quita al cambiar a otro sin ellas", async () => {
    const deps = dependencias(true, { "000001": "Paga tarde", "000002": null });
    const { result } = renderHook(() => useAvisoObservacionesCliente(deps));

    expect(result.current.aviso).toBeNull();

    await act(() => result.current.avisar("000001"));
    expect(result.current.aviso?.observaciones).toBe("Paga tarde");

    await act(() => result.current.avisar("000002"));
    expect(result.current.aviso).toBeNull();
  });

  test("el mismo cliente no se vuelve a consultar y la configuración se lee una vez", async () => {
    const deps = dependencias(true, { "000001": "A", "000002": "B" });
    const { result } = renderHook(() => useAvisoObservacionesCliente(deps));

    await act(() => result.current.avisar("000001"));
    await act(() => result.current.avisar("000001"));
    await act(() => result.current.avisar("000002"));

    expect(deps.getObservaciones).toHaveBeenCalledTimes(2);
    expect(deps.getConfig).toHaveBeenCalledTimes(1);
    expect(result.current.aviso?.observaciones).toBe("B");
  });

  test("con el check desmarcado no muestra nada", async () => {
    const deps = dependencias(false, { "000001": "Paga tarde" });
    const { result } = renderHook(() => useAvisoObservacionesCliente(deps));

    await act(() => result.current.avisar("000001"));
    expect(result.current.aviso).toBeNull();
  });

  test("cerrar quita el aviso", async () => {
    const deps = dependencias(true, { "000001": "Paga tarde" });
    const { result } = renderHook(() => useAvisoObservacionesCliente(deps));

    await act(() => result.current.avisar("000001"));
    act(() => result.current.cerrar());
    expect(result.current.aviso).toBeNull();
  });
});
