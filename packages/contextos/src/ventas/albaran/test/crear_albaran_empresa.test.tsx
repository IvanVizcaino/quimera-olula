import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("#/comun/componentes/pais/pais.tsx", () => ({
  PaisSelector: () => null,
}));

vi.mock("#/ventas/comun/componentes/cliente.tsx", () => ({
  Cliente: ({ onChange }: { onChange: (valor: string) => void }) => (
    <button type="button" onClick={() => onChange("CLI001")}>
      elegir cliente
    </button>
  ),
}));

vi.mock("#/ventas/comun/componentes/dirCliente.tsx", () => ({
  DirCliente: ({ onChange }: { onChange: (valor: string) => void }) => (
    <button type="button" onClick={() => onChange("DIR001")}>
      elegir direccion
    </button>
  ),
}));

import { CrearAlbaran } from "../crear/CrearAlbaran.tsx";

const conEmpresas = (empresas: { id: string; nombre: string }[]) => {
  localStorage.clear();
  localStorage.setItem("whoami", JSON.stringify({ empresas }));
};

const guardar = () =>
  screen.getByRole("button", { name: /Guardar/ }).closest("quimera-boton");

const completarCliente = async () => {
  await userEvent.click(screen.getByText("elegir cliente"));
  await userEvent.click(screen.getByText("elegir direccion"));
};

beforeEach(() => {
  localStorage.clear();
});

describe("Alta de albarán: empresa activa", () => {
  test("con una sola empresa, Guardar se habilita al completar el cliente", async () => {
    conEmpresas([{ id: "1", nombre: "Empresa Uno" }]);

    render(<CrearAlbaran />);
    await completarCliente();

    expect(guardar()).not.toHaveAttribute("deshabilitado");
  });

  test("la empresa sobrevive al cambio a cliente no registrado", async () => {
    conEmpresas([{ id: "1", nombre: "Empresa Uno" }]);

    render(<CrearAlbaran />);
    await userEvent.click(screen.getByText("Cliente no registrado"));
    await userEvent.type(screen.getByLabelText(/Nombre del Cliente/), "De paso");
    await userEvent.type(screen.getByLabelText(/Nombre de la Vía/), "Gran Vía");

    expect(guardar()).not.toHaveAttribute("deshabilitado");
  });

  test("sin empresa activa avisa y deja Guardar deshabilitado", async () => {
    conEmpresas([
      { id: "1", nombre: "Empresa Uno" },
      { id: "2", nombre: "Empresa Dos" },
    ]);

    render(<CrearAlbaran />);
    await completarCliente();

    expect(screen.getByText("Sin empresa activa")).toBeInTheDocument();
    expect(guardar()).toHaveAttribute("deshabilitado");
  });
});
