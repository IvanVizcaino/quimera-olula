import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { test } from "vitest";
import { TransferenciaStock } from "../diseño.ts";
import { MaestroDetalleTransferenciasStock } from "../vistas/MaestroDetalleTransferenciasStock.tsx";

const t1: TransferenciaStock = {
  id: "20250A001",
  origen: "Al1",
  destino: "Al2",
  nombre_origen: "Almacén 1",
  nombre_destino: "Almacén 2",
  fecha: "2025-12-04",
};

const t2: TransferenciaStock = {
  id: "20250A002",
  origen: "Al2",
  destino: "Al3",
  nombre_origen: "Almacén 2",
  nombre_destino: "Almacén 3",
  fecha: "2025-12-05",
};

vi.mock("../../almacen/infraestructura.ts", () => ({
  obtenerAlmacenes: vi.fn(async () => Promise.resolve([])),
}));

vi.mock("../infraestructura.ts", () => ({
  obtenerTransferenciasStock: vi.fn(async () =>
    Promise.resolve({ datos: [t1, t2], total: 2 })
  ),
  obtenerTransferenciaStock: vi.fn(async () => Promise.resolve(t2)),
  obtenerLineasTransferenciaStock: vi.fn(async () =>
    Promise.resolve({ datos: [], total: 0 })
  ),
}));

describe("Maestro de transferencias", () => {

  test("debe renderizar la cabecera", async () => {
    render(<MaestroDetalleTransferenciasStock />);
    // buscamos una cabecera "Transferencias"
    await screen.findByRole("heading", { name: "Transferencias" });
  });

  test("no debe renderizar detalle hasta pulsar", async () => {
    render(<MaestroDetalleTransferenciasStock />);

    // buscamos una cabecera "Origen -> Destino" que no debe existir
    expect(
      screen.queryByRole("heading", { name: "Al2 -> Al3" })
    ).not.toBeInTheDocument();

    // buscamos la celda con la id t2.id
    const celdaT2 = await screen.findByText(t2.id);
    // y la clickamos
    await userEvent.click(celdaT2);

    // buscamos una cabecera "Origen -> Destino"
    await screen.findByRole("heading", { name: "Al2 -> Al3" });
  });
});
