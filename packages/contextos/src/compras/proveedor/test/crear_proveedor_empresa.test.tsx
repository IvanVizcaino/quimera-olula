import { modeloEsValido } from "@olula/lib/dominio.ts";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

const post = vi.fn(async (_url: string, _body: unknown, _msg?: string) => ({ id: "PRO001" }));

vi.mock("@olula/lib/api/rest_api.ts", () => ({
  RestAPI: {
    post: (url: string, body: unknown, msg?: string) => post(url, body, msg),
  },
}));

const { postProveedor } = await import("../infraestructura.ts");
const { metaNuevoProveedor, nuevoProveedorInicial } = await import("../crear/crear.ts");
const { CrearProveedor } = await import("../crear/CrearProveedor.tsx");

const conEmpresas = (empresas: { id: string; nombre: string }[], actual?: string) => {
  localStorage.clear();
  localStorage.setItem("whoami", JSON.stringify({ empresas }));
  if (actual) localStorage.setItem("empresa_actual", actual);
};

const dosEmpresas = [
  { id: "1", nombre: "Empresa Uno" },
  { id: "2", nombre: "Empresa Dos" },
];

const proveedorCompleto = () => ({
  ...nuevoProveedorInicial(),
  nombre: "Proveedor",
  idFiscal: "12345678Z",
});

const AVISO = /Sin empresa activa/;

beforeEach(() => {
  localStorage.clear();
  post.mockClear();
});

describe("Alta de proveedor: empresa activa", () => {
  test("sin empresa seleccionada el modelo nace sin empresa y no es válido", () => {
    conEmpresas(dosEmpresas);
    const proveedor = proveedorCompleto();
    expect(proveedor.empresaId).toBe("");
    expect(modeloEsValido(metaNuevoProveedor)(proveedor)).toBe(false);
  });

  test("con empresa seleccionada el modelo nace con ella y es válido", () => {
    conEmpresas(dosEmpresas, "2");
    const proveedor = proveedorCompleto();
    expect(proveedor.empresaId).toBe("2");
    expect(modeloEsValido(metaNuevoProveedor)(proveedor)).toBe(true);
  });

  test("postProveedor envía la empresa del modelo", async () => {
    await postProveedor({ ...proveedorCompleto(), empresaId: "2" });
    expect((post.mock.calls[0][1] as { empresa_id: string }).empresa_id).toBe("2");
  });

  test("con varias empresas y ninguna seleccionada muestra el aviso", () => {
    conEmpresas(dosEmpresas);
    render(<CrearProveedor publicar={async () => {}} />);
    expect(screen.getByText(AVISO)).toBeInTheDocument();
  });

  test("con empresa seleccionada no muestra el aviso", () => {
    conEmpresas(dosEmpresas, "1");
    render(<CrearProveedor publicar={async () => {}} />);
    expect(screen.queryByText(AVISO)).not.toBeInTheDocument();
  });
});
