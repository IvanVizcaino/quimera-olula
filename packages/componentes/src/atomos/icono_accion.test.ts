import { describe, expect, test } from "vitest";
import { iconoAccionBoton } from "./icono_accion.ts";

describe("iconoAccionBoton", () => {
  test("acciones habituales por su primera palabra", () => {
    expect(iconoAccionBoton("Nueva Factura")).toBe("crear");
    expect(iconoAccionBoton("Nuevo")).toBe("crear");
    expect(iconoAccionBoton("Añadir pausa")).toBe("crear");
    expect(iconoAccionBoton("Editar")).toBe("editar");
    expect(iconoAccionBoton("Borrar")).toBe("eliminar");
    expect(iconoAccionBoton("Eliminar asociación")).toBe("eliminar");
  });

  test("el resto se queda con su texto", () => {
    expect(iconoAccionBoton("Borrador")).toBeUndefined();
    expect(iconoAccionBoton("Albaranar (3)")).toBeUndefined();
    expect(iconoAccionBoton("Imprimir")).toBeUndefined();
  });
});
