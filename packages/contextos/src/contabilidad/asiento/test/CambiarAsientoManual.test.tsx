import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { Asiento, PatchAsientoManual } from "../diseño.ts";

const { patchAsientoManual } = vi.hoisted(() => ({
    patchAsientoManual: vi.fn<PatchAsientoManual>(async () => ({ id: "7", numero: 3 })),
}));

vi.mock("../infraestructura.ts", () => ({ patchAsientoManual }));

// El selector real consulta /contabilidad/subcuenta; aquí basta con sendos
// botones que asignen a la fila una subcuenta normal o una de IVA.
vi.mock("#/contabilidad/comun/componentes/SubcuentaSelector.tsx", () => ({
    SubcuentaSelector: ({
        nombre,
        onChange,
    }: {
        nombre: string;
        onChange: (
            opcion: {
                valor: string;
                descripcion: string;
                descripcionOpcion: string;
                esIva: boolean;
            } | null
        ) => void;
    }) => (
        <>
            <button
                type="button"
                onClick={() =>
                    onChange({
                        valor: "930",
                        descripcion: "6290000",
                        descripcionOpcion: "6290000",
                        esIva: false,
                    })
                }
            >
                {`elegir ${nombre}`}
            </button>
            <button
                type="button"
                onClick={() =>
                    onChange({
                        valor: "940",
                        descripcion: "4720000",
                        descripcionOpcion: "4720000",
                        esIva: true,
                    })
                }
            >
                {`elegir iva ${nombre}`}
            </button>
        </>
    ),
}));

const { CambiarAsientoManual } = await import("../vistas/cambiar/CambiarAsientoManual.tsx");

const asientoCuadradoDe100 = (): Asiento => ({
    id: "7",
    numero: 3,
    ejercicioId: "2025",
    fecha: new Date("2025-06-01T12:00:00"),
    concepto: "Compra de material",
    importe: 100,
    manual: true,
    tipoDocumento: "",
    documento: "",
    partidas: [
        {
            id: "1",
            asientoId: "7",
            subcuentaId: 11,
            codigoSubcuenta: "6000000",
            debe: 100,
            haber: 0,
            concepto: "Cargo",
        },
        {
            id: "2",
            asientoId: "7",
            subcuentaId: 22,
            codigoSubcuenta: "4000000",
            debe: 0,
            haber: 100,
            concepto: "Abono",
        },
    ],
});

const escribir = async (nombre: string, texto: string) => {
    const input = document.querySelector<HTMLInputElement>(`input[name="${nombre}"]`);
    if (!input) throw new Error(`No existe el campo ${nombre}`);
    await userEvent.clear(input);
    await userEvent.type(input, texto);
};

// El contenido vive dentro de un <dialog> que jsdom no abre, así que queda
// fuera del árbol de accesibilidad: hay que pedirlo con `hidden`.
const boton = (nombre: string) => screen.getByRole("button", { name: nombre, hidden: true });
// QBoton no marca `disabled` en el <button>: refleja el estado en el
// elemento <quimera-boton> que lo envuelve.
const botonGuardar = () => boton("Guardar");
const etiquetasIva = () =>
    Array.from(
        document.querySelectorAll(".EditorPartidasManual-etiquetaIva")
    ).map((e) => e.textContent);
const guardarDeshabilitado = () => botonGuardar().closest("quimera-boton");

describe("CambiarAsientoManual", () => {
    beforeEach(() => {
        patchAsientoManual.mockClear();
        render(<CambiarAsientoManual asiento={asientoCuadradoDe100()} publicar={vi.fn()} />);
    });

    test("parte de un asiento cuadrado con Guardar habilitado", () => {
        expect(guardarDeshabilitado()).not.toHaveAttribute("deshabilitado");
    });

    test("descuadrar el asiento deshabilita Guardar y muestra el descuadre", async () => {
        await escribir("debe-0", "150");

        expect(guardarDeshabilitado()).toHaveAttribute("deshabilitado");
        expect(screen.getByText(/Descuadre: 50\.00/)).toBeInTheDocument();
    });

    test("al volver a cuadrar envía todas las partidas al PATCH", async () => {
        await escribir("debe-0", "150");
        await escribir("haber-1", "150");

        expect(guardarDeshabilitado()).not.toHaveAttribute("deshabilitado");
        await userEvent.click(botonGuardar());

        expect(patchAsientoManual).toHaveBeenCalledTimes(1);
        const [id, cambios] = patchAsientoManual.mock.calls[0];
        expect(id).toBe("7");
        expect(cambios.concepto).toBe("Compra de material");
        expect(cambios.partidas).toHaveLength(2);
        expect(cambios.partidas?.[0]).toMatchObject({ subcuentaId: 11, debe: 150, haber: 0 });
        expect(cambios.partidas?.[1]).toMatchObject({ subcuentaId: 22, debe: 0, haber: 150 });
    });

    test("una partida nueva sin subcuenta no deja guardar aunque cuadre", async () => {
        await userEvent.click(boton("Añadir partida"));
        await escribir("debe-0", "150");
        await escribir("haber-2", "50");

        expect(screen.queryByText(/Descuadre/)).not.toBeInTheDocument();
        expect(guardarDeshabilitado()).toHaveAttribute("deshabilitado");
    });

    test("el IVA de la partida lo dice su subcuenta, no un check del usuario", async () => {
        expect(document.querySelector('input[type="checkbox"]')).toBeNull();
        expect(etiquetasIva()).toEqual(["NO", "NO"]);

        await userEvent.click(boton("elegir iva subcuenta-0"));

        expect(etiquetasIva()).toEqual(["SI", "NO"]);
    });

    test("asignar la subcuenta de la partida nueva la deja lista para enviar", async () => {
        await userEvent.click(boton("Añadir partida"));
        await escribir("debe-0", "150");
        await escribir("haber-2", "50");
        await userEvent.click(boton("elegir subcuenta-2"));

        expect(guardarDeshabilitado()).not.toHaveAttribute("deshabilitado");
        await userEvent.click(botonGuardar());

        const [, cambios] = patchAsientoManual.mock.calls[0];
        expect(cambios.partidas).toHaveLength(3);
        expect(cambios.partidas?.[2]).toMatchObject({ subcuentaId: 930, debe: 0, haber: 50 });
    });
});
