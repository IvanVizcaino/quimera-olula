import { LineaOrdenAlmacen, OrdenAlmacen } from "../diseño.ts";
import { lineaOrdenVacia, lineasConSobrante, ordenAlbaranable, ordenVacia, sobranteLinea } from "../dominio.ts";
import { cantidadPendiente, lineasPendientes } from "../pasos/lector.ts";
import { calcularAccionPrincipal } from "../vistas/detalle/accion_principal.ts";

// Línea de salida: el pedido se redujo a `prevista` después de recoger `recogido`.
const linea = (prevista: number, recogido: number, id = "1"): LineaOrdenAlmacen => ({
    ...lineaOrdenVacia(),
    id,
    sku: "414911",
    articulo: "Artículo",
    cantidadPrevista: prevista,
    cantidadReal: recogido,
    cantidadPick: recogido,
    pasosPick: "SKU_CAJA",
});

const salida = (estado: string, lineas: LineaOrdenAlmacen[]): OrdenAlmacen => ({
    ...ordenVacia(),
    id: "S00001",
    tipo: "SALIDA",
    estado,
    lineas,
});

const handlers = () => ({
    emitirPickSolicitado: vi.fn(),
    emitirDropSolicitado: vi.fn(),
    emitirColocacionSolicitada: vi.fn(),
    emitirAlbaranadoSolicitado: vi.fn(),
    emitirDevolucionSobrante: vi.fn(),
});

describe("[sobrante] material recogido de más", () => {
    test("es lo recogido por encima de lo previsto", () => {
        expect(sobranteLinea(linea(2, 5))).toBe(3);
        expect(sobranteLinea(linea(5, 5))).toBe(0);
        expect(sobranteLinea(linea(5, 2))).toBe(0);
    });

    test("una línea quitada del pedido ya recogida es toda sobrante", () => {
        expect(lineasConSobrante(salida("PREPARADA", [linea(0, 4), linea(3, 3, "2")])).map((l) => l.id)).toEqual(["1"]);
    });

    test("no se puede albaranar con sobrante", () => {
        expect(ordenAlbaranable(salida("PREPARADA", [linea(3, 3)]))).toBe(true);
        expect(ordenAlbaranable(salida("PREPARADA", [linea(2, 5)]))).toBe(false);
    });

    test("la acción principal pide devolver el sobrante antes de albaranar", () => {
        const h = handlers();
        const sobrante = linea(2, 5);
        const accion = calcularAccionPrincipal(salida("PREPARADA", [sobrante]), h);

        expect(accion?.label).toBe("Devolver sobrante");
        expect(accion?.instruccion).toContain("sobran 3");
        accion?.onClick();
        expect(h.emitirDevolucionSobrante).toHaveBeenCalledWith(sobrante);
    });

    test("el lector trata la línea con sobrante como completa", () => {
        const o = salida("EN_CURSO", [linea(2, 5)]);
        expect(cantidadPendiente(o.lineas[0], o, "PICK")).toBe(-3);
        expect(lineasPendientes(o, "PICK")).toEqual([]);
    });
});
