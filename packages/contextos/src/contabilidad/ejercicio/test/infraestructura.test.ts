import { describe, expect, test } from "vitest";
import {
    ejercicioDesdeApi,
    generarPgcAApi,
    nuevoEjercicioAApi,
    opcionesCierreAApi,
} from "../infraestructura.ts";

describe("ejercicio infraestructura", () => {
    test("ejercicioDesdeApi", () => {
        const e = ejercicioDesdeApi({
            id: "2026", nombre: "EJERCICIO 2026", empresa_id: 1,
            fecha_inicio: "2026-01-01", fecha_fin: "2026-12-31", estado: "CERRADO",
            digitos_subcuenta: 10, plan_contable: null, tiene_pgc: true,
            asiento_apertura_id: null, asiento_pyg_id: 4, asiento_cierre_id: 5,
        });
        expect(e).toMatchObject({
            id: "2026", estado: "CERRADO", planContable: "", tienePgc: true,
            asientoPygId: 4, asientoCierreId: 5,
        });
        expect(e.fechaFin.getDate()).toBe(31);
    });

    test("alta del ejercicio y del PGC", () => {
        expect(nuevoEjercicioAApi({
            id: "2027", nombre: "EJERCICIO 2027",
            fechaInicio: new Date(2027, 0, 1, 12), fechaFin: new Date(2027, 11, 31, 12),
            digitosSubcuenta: 10, ejercicioOrigenPgc: "2026", series: "A,B",
        }, 1)).toEqual({
            id: "2027", empresa_id: "1", nombre: "EJERCICIO 2027",
            fecha_inicio: "2027-01-01", fecha_fin: "2027-12-31",
            digitos_subcuenta: 10, serie_ids: ["A", "B"],
        });
        expect(generarPgcAApi({ ejercicioOrigenId: "2026", digitosSubcuenta: 10 }))
            .toEqual({ ejercicio_origen_id: "2026" });
        expect(generarPgcAApi({ ejercicioOrigenId: "", digitosSubcuenta: 8 }))
            .toEqual({ digitos_subcuenta: 8 });
    });

    test("opciones de cierre", () => {
        expect(opcionesCierreAApi({
            fecha: new Date(2026, 11, 31, 12), regularizar: true, cerrar: true,
            abrir: true, ejercicioDestinoId: "", ignorarCuentasSinCodigoBalance: false,
        })).toEqual({
            fecha: "2026-12-31", regularizar: true, cerrar: true, abrir: true,
            ignorar_cuentas_sin_codigo_balance: false,
        });
    });
});
