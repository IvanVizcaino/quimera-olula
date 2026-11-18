import { describe, expect, test } from "vitest";
import {
    nuevaRegularizacionIvaAApi,
    regularizacionIvaDesdeApi,
} from "../infraestructura.ts";

describe("regularización de IVA infraestructura (co_regiva)", () => {
    test("regularizacionIvaDesdeApi mapea snake_case a dominio", () => {
        const r = regularizacionIvaDesdeApi({
            id: 3,
            ejercicio_id: "2026",
            periodo: "T1",
            fecha_inicio: "2026-01-01",
            fecha_fin: "2026-03-31",
            fecha_asiento: "2026-03-31",
            asiento_id: 77,
            numero_asiento: 12,
            importe: 525.5,
            codigo_subcuenta_deudora: "4700000000",
            codigo_subcuenta_acreedora: null,
        });
        expect(r).toMatchObject({
            id: "3",
            ejercicioId: "2026",
            periodo: "T1",
            asientoId: "77",
            numeroAsiento: 12,
            importe: 525.5,
            codigoSubcuentaDeudora: "4700000000",
            codigoSubcuentaAcreedora: "",
        });
        expect(r.fechaFin.getMonth()).toBe(2);
        expect(r.fechaFin.getDate()).toBe(31);
    });

    test("nuevaRegularizacionIvaAApi envía las fechas del formulario y omite subcuentas vacías", () => {
        expect(nuevaRegularizacionIvaAApi({
            ejercicioId: "2026",
            trimestre: "OTRO",
            fechaInicio: new Date(2026, 6, 15, 12),
            fechaFin: new Date(2026, 8, 20, 12),
            fechaAsiento: null,
            codigoSubcuentaDeudora: "",
            codigoSubcuentaAcreedora: "4750000001",
        })).toEqual({
            ejercicio_id: "2026",
            fecha_inicio: "2026-07-15",
            fecha_fin: "2026-09-20",
            fecha_asiento: "2026-09-20",
            codigo_subcuenta_acreedora: "4750000001",
        });
    });
});
