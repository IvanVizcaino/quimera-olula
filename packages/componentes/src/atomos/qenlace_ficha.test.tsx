import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, test, vi } from "vitest";
import { EnlaceFicha, ValorConEnlace } from "./qenlace_ficha.tsx";
import { urlEnlace } from "./url_enlace.ts";

describe("EnlaceFicha", () => {
  test("urlEnlace sustituye {id} o añade el valor a la ruta", () => {
    expect(urlEnlace("/almacen/articulo?id={id}", "A/1")).toBe("/almacen/articulo?id=A%2F1");
    expect(urlEnlace("/ventas/cliente/", "7")).toBe("/ventas/cliente/7");
    expect(urlEnlace(undefined, "7")).toBeNull();
    expect(urlEnlace("/x?id={id}", "")).toBeNull();
  });

  test("es un enlace con su etiqueta y la clase única del estilo, y no propaga el clic", () => {
    const enFila = vi.fn();
    render(
      <MemoryRouter>
        <div onClick={enFila}>
          <EnlaceFicha href="/almacen/articulo?id=90197" etiqueta="Abrir artículo 90197" className="extra" />
        </div>
      </MemoryRouter>
    );
    const enlace = screen.getByRole("link", { name: "Abrir artículo 90197" });
    expect(enlace.getAttribute("href")).toBe("/almacen/articulo?id=90197");
    expect(enlace.className).toBe("enlace-ficha extra");
    expect(enlace.getAttribute("target")).toBeNull();
    fireEvent.click(enlace);
    expect(enFila).not.toHaveBeenCalled();
  });

  test("ValorConEnlace solo pinta la flecha si hay destino", () => {
    const { rerender } = render(
      <MemoryRouter><ValorConEnlace href="/x" etiqueta="Abrir X">X</ValorConEnlace></MemoryRouter>
    );
    expect(screen.getByRole("link", { name: "Abrir X" })).toBeTruthy();
    rerender(<MemoryRouter><ValorConEnlace href={null} etiqueta="Abrir X">X</ValorConEnlace></MemoryRouter>);
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.getByText("X")).toBeTruthy();
  });
});

describe("columna con enlace en QTabla", () => {
  test("pinta el valor y su flecha; sin destino, solo el valor", async () => {
    const { QTabla } = await import("./qtabla.tsx");
    render(
      <MemoryRouter>
        <QTabla
          metaTabla={[{ id: "articulo", cabecera: "Artículo", enlace: (f: { articulo: string }) => f.articulo === "A" ? "/almacen/articulo?id=A" : null }]}
          datos={[{ id: "1", articulo: "A" }, { id: "2", articulo: "B" }]}
          cargando={false}
          orden={[]}
        />
      </MemoryRouter>
    );
    const enlace = screen.getByRole("link", { name: "Abrir artículo A" });
    expect(enlace.getAttribute("href")).toBe("/almacen/articulo?id=A");
    expect(screen.queryByRole("link", { name: "Abrir artículo B" })).toBeNull();
  });
});
