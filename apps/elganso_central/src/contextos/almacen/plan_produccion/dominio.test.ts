import { ArticuloTallas, DestinoLineas, LineaPlanProduccion } from "./diseño.ts";
import {
    anadirLinea, cambiarCantidad, columnasTalla, ERROR_SIN_CABECERA, filasValidas, fusionarPegado,
    parsearCantidad, parsearPegado, rejillaModificada, resolverPegado, totalColumna, totalGeneral,
    totalLinea,
} from "./dominio.ts";

const tallasLetra = ["S", "M", "L", "XL", "XXL"].map((t, i) => ({
    talla: t, descripcion: t, grupo: "LETRA", orden: i + 1, barcode: "", color: "",
}));
const tallasNumero = ["37", "38", "39", "40", "41", "42", "43", "44", "45"].map((t, i) => ({
    talla: t, descripcion: t, grupo: "NUM", orden: i + 1, barcode: "", color: "",
}));

const camisa: ArticuloTallas = {
    referencia: "1050S270001", descripcion: "Camisa Algodón Lino Blanco", tallas: tallasLetra,
};
const vestir: ArticuloTallas = {
    referencia: "1050S270113", descripcion: "Camisa Vestir Celeste", tallas: tallasNumero,
};

const destino: DestinoLineas = {
    proveedorId: "P1", nombreProveedor: "Prov", almacenId: "A1", nombreAlmacen: "Alm", fechaEntrega: "2027-01-10",
};

const EXCEL = [
    "Referencia\tDescripción del artículo\tS\tM\tL\tXL\tXXL\t37\t38\t39\t40\t41\t42\t43\t44\t45\tTotal general",
    "1050s270001\tCamisa Algodón Lino Cuello Italiano Blanco\t125\t300\t360\t160\t55\t\t\t\t\t\t\t\t\t\t1000",
    "1050s270113\tCamisa Vestir Cuello Italiano Royal Oxford Celeste\t\t\t\t\t\t10\t30\t130\t200\t160\t180\t80\t80\t30\t900",
    "TOTAL S27GA1050T01\t\t745\t1765",
].join("\r\n");

describe("parsearCantidad", () => {
    test("vacío, enteros y separador de miles", () => {
        expect(parsearCantidad("")).toEqual({ valor: null });
        expect(parsearCantidad(" 12 ")).toEqual({ valor: 12 });
        expect(parsearCantidad("1.000")).toEqual({ valor: 1000 });
        expect(parsearCantidad("1,000")).toEqual({ valor: 1000 });
        expect(parsearCantidad("1.234.567")).toEqual({ valor: 1234567 });
    });

    test("errores: texto, negativo, decimal", () => {
        expect(parsearCantidad("abc").error).toBeDefined();
        expect(parsearCantidad("-5").error).toBeDefined();
        expect(parsearCantidad("2,5").error).toBeDefined();
        expect(parsearCantidad("2.50").error).toBeDefined();
    });
});

describe("parsearPegado", () => {
    test("ejemplo real: cabecera, tallas, totales ignorados", () => {
        const r = parsearPegado(EXCEL);
        expect(r.error).toBeUndefined();
        expect(r.etiquetasTalla).toEqual(["S", "M", "L", "XL", "XXL", "37", "38", "39", "40", "41", "42", "43", "44", "45"]);
        expect(r.filas).toHaveLength(2);
        expect(r.filas[0].referencia).toBe("1050s270001");
        expect(r.filas[0].descripcion).toBe("Camisa Algodón Lino Cuello Italiano Blanco");
        expect(r.filas[0].cantidades).toEqual({ S: 125, M: 300, L: 360, XL: 160, XXL: 55 });
        expect(r.filas[1].cantidades["37"]).toBe(10);
        expect(r.filas[1].cantidades["45"]).toBe(30);
        expect(r.filas[1].errores).toEqual([]);
    });

    test("admite \\n, filas vacías y descripción opcional", () => {
        const r = parsearPegado("\nREFERENCIA\tS\tM\n\nA1\t1\t2\n");
        expect(r.etiquetasTalla).toEqual(["S", "M"]);
        expect(r.filas).toEqual([
            { fila: 4, referencia: "A1", descripcion: "", cantidades: { S: 1, M: 2 }, errores: [] },
        ]);
    });

    test("reconoce Referencia sin acentos/mayúsculas e ignora columnas vacías", () => {
        const r = parsearPegado("referencia\t\tS\tTotal\nA1\tx\t3\t3");
        expect(r.etiquetasTalla).toEqual(["S"]);
        expect(r.filas[0].cantidades).toEqual({ S: 3 });
    });

    test("sin columna Referencia: error global", () => {
        expect(parsearPegado("Código\tS\nA1\t1").error).toBe(ERROR_SIN_CABECERA);
        expect(parsearPegado("").error).toBe(ERROR_SIN_CABECERA);
    });

    test("errores de celda en la fila", () => {
        const r = parsearPegado("Referencia\tS\tM\tL\nA1\tabc\t-1\t2,5");
        expect(r.filas[0].errores).toHaveLength(3);
        expect(r.filas[0].cantidades).toEqual({});
    });
});

describe("resolverPegado", () => {
    const filas = parsearPegado(EXCEL).filas;

    test("camisas de letra y de vestir en el mismo pegado", () => {
        const r = resolverPegado(filas, [camisa, vestir]);
        expect(r.every((f) => !f.error)).toBe(true);
        expect(r[0].referencia).toBe("1050S270001"); // canónica
        expect(r[0].cantidades).toEqual({ S: 125, M: 300, L: 360, XL: 160, XXL: 55 });
        expect(r[1].cantidades["41"]).toBe(160);
    });

    test("referencia inexistente", () => {
        const r = resolverPegado(filas, [camisa]);
        expect(r[0].error).toBeUndefined();
        expect(r[1].error).toMatch(/no existe/);
    });

    test("talla con cantidad que la referencia no tiene", () => {
        const r = resolverPegado(parsearPegado("Referencia\tS\t37\nCAMISA\t1\t5\n1050s270001\t1\t0").filas, [camisa]);
        expect(r[0].error).toMatch(/no existe/);
        // 37 con cantidad 0 no es error
        expect(r[1].error).toBeUndefined();
        const r2 = resolverPegado(parsearPegado("Referencia\tS\t37\n1050s270001\t1\t5").filas, [camisa]);
        expect(r2[0].error).toMatch(/talla 37/);
    });

    test("casa por descripción si no casa por código, sin distinguir mayúsculas", () => {
        const art: ArticuloTallas = {
            referencia: "X1", descripcion: "X",
            tallas: [{ talla: "001", descripcion: "Pequeña", grupo: "G", orden: 1, barcode: "", color: "" },
                     { talla: "m", descripcion: "Mediana", grupo: "G", orden: 2, barcode: "", color: "" }],
        };
        const r = resolverPegado(parsearPegado("Referencia\tpequeña\tM\nx1\t3\t4").filas, [art]);
        expect(r[0].error).toBeUndefined();
        expect(r[0].cantidades).toEqual({ "001": 3, m: 4 });
    });

    test("referencias repetidas: error en las repetidas", () => {
        const r = resolverPegado(parsearPegado("Referencia\tS\nA\t1\na\t2").filas, [{ ...camisa, referencia: "A" }]);
        expect(r[0].error).toBeUndefined();
        expect(r[1].error).toMatch(/repetida/);
        expect(filasValidas(r)).toHaveLength(1);
    });
});

describe("fusionarPegado", () => {
    const existente: LineaPlanProduccion = {
        id: "7", referencia: "1050S270001", descripcion: "Existente",
        proveedorId: "P0", nombreProveedor: "Otro", almacenId: "A0", nombreAlmacen: null, fechaEntrega: null,
        tallas: tallasLetra.map((t) => ({ ...t, cantidad: 9 })),
    };

    test("sobrescribe existentes (tallas ausentes a 0), añade nuevas y mantiene el resto", () => {
        const otra: LineaPlanProduccion = { ...existente, id: "8", referencia: "OTRA" };
        const filas = resolverPegado(
            parsearPegado("Referencia\tDescripción\tS\tM\n1050s270001\tx\t5\t6\n1050s270113\tVestir Excel\t\t").filas
                .map((f) => f), [camisa, vestir]);
        // la segunda fila usa tallas 37+ sin cantidades -> válida con todo a 0
        const r = fusionarPegado([existente, otra], filas, destino);
        expect(r).toHaveLength(3);
        expect(r[0].id).toBe("7");
        expect(r[0].descripcion).toBe("Existente");
        expect(r[0].proveedorId).toBe("P0");
        expect(r[0].tallas.map((t) => t.cantidad)).toEqual([5, 6, 0, 0, 0]);
        expect(r[1]).toBe(otra);
        expect(r[2].id).toBeUndefined();
        expect(r[2].referencia).toBe("1050S270113");
        expect(r[2].descripcion).toBe("Vestir Excel");
        expect(r[2].proveedorId).toBe("P1");
        expect(r[2].fechaEntrega).toBe("2027-01-10");
    });

    test("las filas erróneas no se importan", () => {
        const filas = resolverPegado(parsearPegado("Referencia\tS\nNOEXISTE\t1").filas, [camisa]);
        expect(fusionarPegado([existente], filas, destino)).toEqual([existente]);
    });
});

describe("columnas y totales", () => {
    const filas = resolverPegado(parsearPegado(EXCEL).filas, [camisa, vestir]);
    const rejilla = fusionarPegado([], filas, destino);

    test("columnas: S..XXL y luego 37..45", () => {
        expect(columnasTalla(rejilla).map((c) => c.talla)).toEqual(
            ["S", "M", "L", "XL", "XXL", "37", "38", "39", "40", "41", "42", "43", "44", "45"]
        );
    });

    test("grupos por primera aparición aunque el orden de tallas lo contradiga", () => {
        const invertida = [rejilla[1], rejilla[0]];
        expect(columnasTalla(invertida).map((c) => c.talla).slice(0, 2)).toEqual(["37", "38"]);
    });

    test("orden: nulls al final y luego por código", () => {
        const t = (talla: string, orden: number | null) =>
            ({ talla, descripcion: talla, grupo: "G", orden, barcode: "", color: "", cantidad: 0 });
        const l: LineaPlanProduccion = { ...rejilla[0], tallas: [t("Z", null), t("B", null), t("A", 2), t("C", 1)] };
        expect(columnasTalla([l]).map((c) => c.talla)).toEqual(["C", "A", "B", "Z"]);
    });

    test("totales", () => {
        expect(totalLinea(rejilla[0])).toBe(1000);
        expect(totalLinea(rejilla[1])).toBe(900);
        expect(totalColumna(rejilla, "S")).toBe(125);
        expect(totalColumna(rejilla, "45")).toBe(30);
        expect(totalGeneral(rejilla)).toBe(1900);
    });

    test("cambiarCantidad e indicador de modificada", () => {
        const cambiada = cambiarCantidad(rejilla, 0, "S", 1);
        expect(totalColumna(cambiada, "S")).toBe(1);
        expect(rejillaModificada(rejilla, rejilla)).toBe(false);
        expect(rejillaModificada(rejilla, cambiada)).toBe(true);
    });

    test("anadirLinea rechaza referencias repetidas", () => {
        expect(() => anadirLinea(rejilla, camisa, destino)).toThrow(/ya está/);
        expect(anadirLinea([], camisa, destino)).toHaveLength(1);
    });
});
