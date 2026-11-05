import { HookModelo } from "@olula/lib/useModelo.ts";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";

type ClienteProps = { cliente: HookModelo<never> };

vi.mock(
  "@olula/ctx/ventas/comun/componentes/moleculas/ClienteVenta/ClienteVentaRegistrado.tsx",
  () => ({
    ClienteVentaRegistrado: ({ cliente }: ClienteProps) => (
      <>
        <button
          type="button"
          onClick={() => cliente.uiProps("idCliente").onChange("CLI001")}
        >
          elegir cliente
        </button>
        <button
          type="button"
          onClick={() => cliente.uiProps("idDireccion").onChange("DIR001")}
        >
          elegir direccion
        </button>
      </>
    ),
  })
);

vi.mock(
  "@olula/ctx/ventas/comun/componentes/moleculas/ClienteVenta/ClienteVentaNoRegistrado.tsx",
  () => ({
    ClienteVentaNoRegistrado: ({ cliente }: ClienteProps) => (
      <>
        <button
          type="button"
          onClick={() => cliente.uiProps("nombre").onChange("De paso")}
        >
          poner nombre
        </button>
        <button
          type="button"
          onClick={() => cliente.uiProps("nombreVia").onChange("Gran Vía")}
        >
          poner via
        </button>
      </>
    ),
  })
);

import { CrearFactura } from "../crear/CrearFactura.tsx";

const conEmpresas = (empresas: { id: string; nombre: string }[]) => {
  localStorage.clear();
  localStorage.setItem("whoami", JSON.stringify({ empresas }));
};

/* El contenido vive dentro de un <dialog> que jsdom no abre de verdad, así que no
   aparece en el árbol de roles: hay que localizarlo por texto. */
const guardar = () => screen.getByText("Guardar").closest("quimera-boton");

beforeEach(() => {
  localStorage.clear();
});

describe("Alta de factura: empresa activa", () => {
  test("con una sola empresa, Guardar se habilita al completar el cliente", async () => {
    conEmpresas([{ id: "1", nombre: "Empresa Uno" }]);

    render(<CrearFactura activo />);
    await userEvent.click(screen.getByText("elegir cliente"));
    await userEvent.click(screen.getByText("elegir direccion"));

    expect(guardar()).not.toHaveAttribute("deshabilitado");
  });

  test("la empresa sobrevive al cambio a cliente no registrado", async () => {
    conEmpresas([{ id: "1", nombre: "Empresa Uno" }]);

    render(<CrearFactura activo />);
    await userEvent.click(screen.getByText("Cliente registrado"));
    await userEvent.click(screen.getByText("poner nombre"));
    await userEvent.click(screen.getByText("poner via"));

    expect(guardar()).not.toHaveAttribute("deshabilitado");
  });

  test("sin empresa activa avisa y deja Guardar deshabilitado", async () => {
    conEmpresas([
      { id: "1", nombre: "Empresa Uno" },
      { id: "2", nombre: "Empresa Dos" },
    ]);

    render(<CrearFactura activo />);
    await userEvent.click(screen.getByText("elegir cliente"));
    await userEvent.click(screen.getByText("elegir direccion"));

    expect(screen.getByText("Sin empresa activa")).toBeInTheDocument();
    expect(guardar()).toHaveAttribute("deshabilitado");
  });
});
