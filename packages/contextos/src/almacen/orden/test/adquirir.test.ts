import { ordenAdquirible } from "../dominio.ts";

describe("ordenAdquirible", () => {
    const yo = "trabajador";

    test.each([
        ["PENDIENTE libre", "PENDIENTE", null, true],
        ["EN_CURSO libre", "EN_CURSO", null, true],
        ["PENDIENTE propia", "PENDIENTE", yo, true],
        ["EN_CURSO de otro", "EN_CURSO", "otro", false],
        ["TERMINADA libre", "TERMINADA", null, false],
        ["TERMINADA propia", "TERMINADA", yo, false],
    ])("%s", (_, estado, idResponsable, esperado) => {
        expect(ordenAdquirible({ estado, idResponsable }, yo)).toBe(esperado);
    });

    test("sin usuario con sesión no se puede adquirir", () => {
        expect(ordenAdquirible({ estado: "PENDIENTE", idResponsable: null }, null)).toBe(false);
    });
});
