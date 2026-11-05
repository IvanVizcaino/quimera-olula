import { MetaModelo } from "@olula/lib/dominio.ts";
import { Modelo } from "@olula/lib/diseño.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test } from "vitest";
import { EmpresaActual } from "../empresaActual.tsx";

type Alta = Modelo & { empresa_id: string };

const altaVacia: Alta = { empresa_id: "" };

const metaAlta: MetaModelo<Alta> = {
  campos: { empresa_id: { requerido: true } },
};

/* Reproduce el montaje de un alta: el hijo empuja la empresa desde su efecto y el
   padre no debe pisarla al resincronizar con su modelo inicial. */
const Anfitrion = () => {
  const alta = useModelo(metaAlta, altaVacia);

  return (
    <>
      <EmpresaActual
        onChange={(id) => alta.uiProps("empresa_id").onChange(id)}
      />
      <span data-testid="empresa">{alta.modelo.empresa_id}</span>
      <span data-testid="valido">{alta.valido ? "sí" : "no"}</span>
    </>
  );
};

beforeEach(() => {
  localStorage.clear();
});

describe("EmpresaActual sobre useModelo", () => {
  test("la empresa que pone el hijo sobrevive al montaje del padre", () => {
    localStorage.setItem(
      "whoami",
      JSON.stringify({ empresas: [{ id: "7", nombre: "Empresa Siete" }] })
    );

    render(<Anfitrion />);

    expect(screen.getByTestId("empresa")).toHaveTextContent("7");
    expect(screen.getByTestId("valido")).toHaveTextContent("sí");
  });

  test("sin empresa activa el modelo queda inválido", () => {
    localStorage.setItem(
      "whoami",
      JSON.stringify({
        empresas: [
          { id: "7", nombre: "Empresa Siete" },
          { id: "8", nombre: "Empresa Ocho" },
        ],
      })
    );

    render(<Anfitrion />);

    expect(screen.getByTestId("empresa")).toHaveTextContent("");
    expect(screen.getByTestId("valido")).toHaveTextContent("no");
  });
});
