import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { DocumentosTercero } from "../DocumentosTercero.tsx";

type Doc = { id: string; codigo: string; fecha: string };

const meta = [
    { id: "codigo", cabecera: "Código" },
    { id: "fecha", cabecera: "Fecha" },
];

const Detalle = ({ id }: { id?: string }) => (id ? <div>ficha {id}</div> : null);

describe("DocumentosTercero", () => {
    test("pide los documentos del tercero con el orden fijado y los muestra", async () => {
        const cargar = vi.fn().mockResolvedValue({
            datos: [{ id: "2", codigo: "B2", fecha: "2026-11-02" }, { id: "1", codigo: "A1", fecha: "2026-11-01" }],
            total: 2,
        });

        render(<DocumentosTercero<Doc> cargar={cargar} filtro={[["cliente_id", "=", "000005"]]}
            orden={["fecha", "DESC", "codigo", "DESC"]} metaTabla={meta} Detalle={Detalle} />);

        expect(await screen.findByText("B2")).toBeInTheDocument();
        expect(cargar).toHaveBeenCalledTimes(1);
        const criteria = cargar.mock.calls[0][0];
        expect(criteria.filtro).toEqual([["cliente_id", "=", "000005"]]);
        expect(criteria.orden).toEqual(["fecha", "DESC", "codigo", "DESC"]);
    });

    test("al cambiar el filtro fijo vuelve a pedir", async () => {
        const cargar = vi.fn().mockResolvedValue({ datos: [], total: 0 });
        const { rerender } = render(<DocumentosTercero<Doc> cargar={cargar} filtro={[["estado", "=", "Emitido"]]}
            orden={["fecha", "DESC"]} metaTabla={meta} Detalle={Detalle} />);
        await vi.waitFor(() => expect(cargar).toHaveBeenCalledTimes(1));

        rerender(<DocumentosTercero<Doc> cargar={cargar} filtro={[]}
            orden={["fecha", "DESC"]} metaTabla={meta} Detalle={Detalle} />);

        await vi.waitFor(() => expect(cargar).toHaveBeenCalledTimes(2));
        expect(cargar.mock.calls[1][0].filtro).toEqual([]);
    });

    test("al pulsar un documento abre su ficha", async () => {
        const cargar = vi.fn().mockResolvedValue({ datos: [{ id: "7", codigo: "C7", fecha: "2026-11-03" }], total: 1 });
        render(<DocumentosTercero<Doc> cargar={cargar} filtro={[]} orden={["fecha", "DESC"]}
            metaTabla={meta} Detalle={Detalle} />);

        fireEvent.click(await screen.findByText("C7"));

        expect(await screen.findByText("ficha 7")).toBeInTheDocument();
    });
});
