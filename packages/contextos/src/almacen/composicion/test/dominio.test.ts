import { describe, expect, test } from "vitest";
import { Composicion, LineaComposicion } from "../diseño.ts";
import {
    cambiosCabecera,
    composicionNuevaVacia,
    fechaHoy,
    horaAhora,
    lineaComposicionVacia,
    lineasModificadas,
    lineasValidas,
    metaCabeceraComposicion,
    metaNuevaComposicion,
} from "../dominio.ts";

const linea = (p: Partial<LineaComposicion> = {}): LineaComposicion => ({
    id: "1",
    articuloId: "CAFE",
    cantidad: 2,
    almacenId: "ALG",
    ...p,
});

const composicion = (p: Partial<Composicion> = {}): Composicion => ({
    id: "7",
    fecha: "2026-10-08",
    hora: "09:30:00",
    almacenId: "ALG",
    articuloId: "KIT",
    descripcion: "Kit",
    cantidad: 3,
    usuarioId: "admin",
    lineas: [linea()],
    ...p,
});

describe("composicion dominio (T2.6)", () => {
    test("fechaHoy y horaAhora usan hora local con ceros", () => {
        const d = new Date(2026, 0, 5, 7, 4);
        expect(fechaHoy(d)).toBe("2026-01-05");
        expect(horaAhora(d)).toBe("07:04");
    });

    test("alta: almacén, artículo, cantidad > 0, fecha y hora requeridos", () => {
        expect(metaNuevaComposicion.campos?.almacenId?.requerido).toBe(true);
        expect(metaNuevaComposicion.campos?.articuloId?.requerido).toBe(true);
        const vacia = composicionNuevaVacia();
        expect(vacia.cantidad).toBe(1);
        expect(vacia.fecha).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        const val = metaNuevaComposicion.campos?.cantidad?.validacion;
        expect(val?.({ ...vacia, cantidad: 0 })).toBe(false);
        expect(val?.({ ...vacia, cantidad: 2 })).toBe(true);
        expect(metaCabeceraComposicion.campos?.cantidad?.validacion?.({
            almacenId: "A", cantidad: -1, fecha: "x", hora: "y",
        })).toBe(false);
    });

    test("línea nueva hereda el almacén de la cabecera y no tiene id", () => {
        expect(lineaComposicionVacia("ALG")).toEqual({
            id: "",
            articuloId: "",
            cantidad: 1,
            almacenId: "ALG",
        });
    });

    test("lineasModificadas detecta alta, baja y edición", () => {
        const base = [linea(), linea({ id: "2", articuloId: "AZUCAR" })];
        expect(lineasModificadas(base, [...base])).toBe(false);
        expect(lineasModificadas(base, base.slice(1))).toBe(true);
        expect(lineasModificadas(base, [...base, lineaComposicionVacia("ALG")])).toBe(true);
        expect(lineasModificadas(base, [linea({ cantidad: 5 }), base[1]])).toBe(true);
    });

    test("lineasValidas descarta líneas sin artículo", () => {
        expect(lineasValidas([linea(), lineaComposicionVacia("ALG")])).toHaveLength(1);
    });

    test("cambiosCabecera solo incluye lo modificado e ignora segundos de la hora", () => {
        const c = composicion();
        const igual = { almacenId: "ALG", cantidad: 3, fecha: "2026-10-08", hora: "09:30" };
        expect(cambiosCabecera(c, igual)).toEqual({});
        expect(cambiosCabecera(c, { ...igual, cantidad: 4, hora: "10:00" })).toEqual({
            cantidad: 4,
            hora: "10:00",
        });
    });
});
