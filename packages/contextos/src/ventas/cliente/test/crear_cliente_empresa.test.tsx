import { conEmpresaActual } from "#/valores/empresaActual.ts";
import { modeloEsValido } from "@olula/lib/dominio.ts";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

const post = vi.fn(async (_url: string, _body: unknown, _msg?: string) => ({ id: "CLI001" }));

vi.mock("@olula/lib/api/rest_api.ts", () => ({
  RestAPI: {
    post: (url: string, body: unknown, msg?: string) => post(url, body, msg),
  },
}));

const { postCliente } = await import("../infraestructura.ts");
const { metaNuevoCliente, nuevoClienteVacio } = await import("../crear/dominio.ts");
const { CrearCliente } = await import("../crear/CrearCliente.tsx");

const conEmpresas = (empresas: { id: string; nombre: string }[], actual?: string) => {
  localStorage.clear();
  localStorage.setItem("whoami", JSON.stringify({ empresas }));
  if (actual) localStorage.setItem("empresa_actual", actual);
};

const dosEmpresas = [
  { id: "1", nombre: "Empresa Uno" },
  { id: "2", nombre: "Empresa Dos" },
];

const clienteCompleto = { ...nuevoClienteVacio, nombre: "Cliente", tipo_id_fiscal: "NIF", id_fiscal: "12345678Z" };

const AVISO = /Sin empresa activa/;

beforeEach(() => {
  localStorage.clear();
  post.mockClear();
});

describe("Alta de cliente: empresa activa", () => {
  test("sin empresa el modelo no es válido", () => {
    expect(modeloEsValido(metaNuevoCliente)({ ...clienteCompleto, empresa_id: "" })).toBe(false);
  });

  test("con empresa el modelo es válido", () => {
    expect(modeloEsValido(metaNuevoCliente)({ ...clienteCompleto, empresa_id: "2" })).toBe(true);
  });

  test("el modelo nace con la empresa seleccionada en el front", () => {
    conEmpresas(dosEmpresas, "2");
    expect(conEmpresaActual(nuevoClienteVacio).empresa_id).toBe("2");
  });

  test("postCliente envía la empresa del modelo", async () => {
    await postCliente({ ...clienteCompleto, empresa_id: "2" });
    expect((post.mock.calls[0][1] as { empresa_id: string }).empresa_id).toBe("2");
  });

  test("con varias empresas y ninguna seleccionada muestra el aviso", () => {
    conEmpresas(dosEmpresas);
    render(<CrearCliente />);
    expect(screen.getByText(AVISO)).toBeInTheDocument();
  });

  test("con empresa seleccionada no muestra el aviso", () => {
    conEmpresas(dosEmpresas, "1");
    render(<CrearCliente />);
    expect(screen.queryByText(AVISO)).not.toBeInTheDocument();
  });
});
