import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, test } from "vitest";
import { QTextoEnriquecido } from "./qtexto_enriquecido.tsx";

describe("qtexto_enriquecido", () => {
  test("renderiza negrita con formato [b]", () => {
    render(
      <MemoryRouter>
        <QTextoEnriquecido texto="Se te ha asignado el [b]cliente[/b]." />
      </MemoryRouter>
    );

    const textoEnNegrita = screen.getByText("cliente");
    expect(textoEnNegrita.tagName).toBe("STRONG");
  });

  test("renderiza referencia conocida como enlace", () => {
    render(
      <MemoryRouter>
        <QTextoEnriquecido texto="Se te ha asignado [@ventas.cliente:id,123|Juan Perez]." />
      </MemoryRouter>
    );

    const enlace = screen.getByRole("link", { name: "Juan Perez" });
    expect(enlace.getAttribute("href")).toBe("/ventas/cliente?id=123");
  });

  test("si no hay resolver específico usa ruta generica con criterios", () => {
    render(
      <MemoryRouter>
        <QTextoEnriquecido texto="Referencia [@x.y:id,123;tipo,vip|Juan Perez]." />
      </MemoryRouter>
    );

    const enlace = screen.getByRole("link", { name: "Juan Perez" });
    expect(enlace.getAttribute("href")).toBe("/x/y?id=123&tipo=vip");
  });

  test("renderiza etiquetas de estilo i y u", () => {
    render(
      <MemoryRouter>
        <QTextoEnriquecido texto="Texto [i]italica[/i] y [u]subrayado[/u]." />
      </MemoryRouter>
    );

    expect(screen.getByText("italica").tagName).toBe("EM");
    expect(screen.getByText("subrayado").tagName).toBe("U");
  });

  test("renderiza etiqueta de parrafo [p]", () => {
    render(
      <MemoryRouter>
        <QTextoEnriquecido texto="[p]Parrafo de prueba[/p]" />
      </MemoryRouter>
    );

    expect(screen.getByText("Parrafo de prueba").tagName).toBe("P");
  });

  test("renderiza salto de linea con [br]", () => {
    const { container } = render(
      <MemoryRouter>
        <QTextoEnriquecido texto="Linea 1[br]Linea 2" />
      </MemoryRouter>
    );

    expect(container.querySelector("br")).not.toBeNull();
    expect(screen.getByText(/Linea 1/)).toBeDefined();
    expect(screen.getByText(/Linea 2/)).toBeDefined();
  });

  test("soporta referencia sin criterios", () => {
    render(
      <MemoryRouter>
        <QTextoEnriquecido texto="Seguimiento: [@ventas.pedidos|Ver estado]" />
      </MemoryRouter>
    );

    const enlace = screen.getByRole("link", { name: "Ver estado" });
    expect(enlace.getAttribute("href")).toBe("/ventas/pedidos");
  });

  test("no se bloquea con token invalido y lo deja como texto", () => {
    render(
      <MemoryRouter>
        <QTextoEnriquecido texto="Token raro [@ventas.pedidos:|sin datos] fin" />
      </MemoryRouter>
    );

    expect(screen.getByText(/Token raro/)).toBeDefined();
    expect(screen.getByText(/sin datos/)).toBeDefined();
    expect(screen.getByText(/fin/)).toBeDefined();
  });
});
