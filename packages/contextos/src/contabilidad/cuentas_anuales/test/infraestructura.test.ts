import { describe, expect, test } from "vitest";
import {
    BalanceCuentasAnualesApi,
    balanceDesdeApi,
    cambiosCuentasAnualesAApi,
    cuentasAnualesDesdeApi,
    CuentasAnualesApi,
    nuevaCuentasAnualesAApi,
} from "../infraestructura.ts";
import { nuevaCuentasAnualesInicial } from "../dominio.ts";

const fichaApi: CuentasAnualesApi = {
    id: 7,
    descripcion: "Cierre 2026",
    tipo: "Situacion",
    formato: "Normal",
    nivel_desglose: "Cuenta",
    periodo: {
        ejercicio_id: "2026",
        fecha_desde: "2026-01-01",
        fecha_hasta: "2026-12-31",
    },
    periodo_anterior: {
        ejercicio_id: "2025",
        fecha_desde: "2025-01-01",
        fecha_hasta: "2025-12-31",
    },
    omitir_epigrafes_sin_saldo: true,
};

describe("ficha del informe", () => {
    test("la API anida los periodos y el frontend los aplana", () => {
        const ficha = cuentasAnualesDesdeApi(fichaApi);

        expect(ficha.id).toBe("7");
        expect(ficha.ejercicioId).toBe("2026");
        expect(ficha.fechaHasta).toBe("2026-12-31");
        expect(ficha.ejercicioAnteriorId).toBe("2025");
        expect(ficha.omitirEpigrafesSinSaldo).toBe(true);
    });

    test("sin ejercicio anterior los campos quedan vacíos, no nulos", () => {
        const ficha = cuentasAnualesDesdeApi({
            ...fichaApi,
            periodo_anterior: null,
        });

        expect(ficha.ejercicioAnteriorId).toBe("");
        expect(ficha.fechaDesdeAnterior).toBe("");
    });

    test("el alta vuelve a anidar los periodos", () => {
        const api = nuevaCuentasAnualesAApi({
            ...nuevaCuentasAnualesInicial("2026"),
            descripcion: "Cierre 2026",
        });

        expect(api.periodo).toEqual({
            ejercicio_id: "2026",
            fecha_desde: "2026-01-01",
            fecha_hasta: "2026-12-31",
        });
        expect(api.periodo_anterior).toBeNull();
    });

    test("los tres campos del periodo viajan juntos", () => {
        const api = cambiosCuentasAnualesAApi({
            ejercicioId: "2026",
            fechaDesde: "2026-01-01",
            fechaHasta: "2026-06-30",
        });

        expect(api.periodo).toEqual({
            ejercicio_id: "2026",
            fecha_desde: "2026-01-01",
            fecha_hasta: "2026-06-30",
        });
    });

    test("vaciar el ejercicio anterior borra el periodo en la API", () => {
        const api = cambiosCuentasAnualesAApi({
            ejercicioAnteriorId: "",
            fechaDesdeAnterior: "",
            fechaHastaAnterior: "",
        });

        expect(api.periodo_anterior).toBeNull();
    });

    test("un cambio suelto no arrastra los periodos", () => {
        const api = cambiosCuentasAnualesAApi({ descripcion: "Otro nombre" });

        expect(api).toEqual({ descripcion: "Otro nombre" });
    });
});

describe("balance calculado", () => {
    const balanceApi: BalanceCuentasAnualesApi = {
        datos: [
            {
                codbalance: "A-B--VII-1",
                naturaleza: "A",
                nivel1: "B",
                nivel2: null,
                descripcion1: "B) ACTIVO CORRIENTE",
                descripcion2: "",
                descripcion3: "",
                descripcion4: "1. Tesorería.",
                saldo_actual: 1000,
                saldo_anterior: 800,
                desglose: [
                    {
                        clave: "5700000000",
                        descripcion: "Caja",
                        saldo_actual: 1000,
                        saldo_anterior: 800,
                    },
                ],
            },
        ],
        total: 1,
        subtotales: [
            {
                codigo: "A.1",
                descripcion: "A.1) RESULTADOS DE EXPLOTACIÓN",
                saldo_actual: 1000,
                saldo_anterior: 800,
                despues_de_nivel2: 13,
            },
        ],
        totales_grupo: [
            {
                clave: "A",
                descripcion: "TOTAL ACTIVO (A+B)",
                saldo_actual: 1000,
                saldo_anterior: 800,
            },
        ],
        avisos_sin_codigo_balance: [
            {
                codigo_subcuenta: "5550000000",
                codigo_cuenta: "555",
                debe: 10,
                haber: 0,
            },
        ],
    };

    test("convierte líneas, desglose, subtotales, totales y avisos", () => {
        const balance = balanceDesdeApi(balanceApi);

        expect(balance.datos[0].saldoActual).toBe(1000);
        expect(balance.datos[0].desglose[0].clave).toBe("5700000000");
        expect(balance.subtotales[0].despuesDeNivel2).toBe(13);
        expect(balance.totalesGrupo[0].clave).toBe("A");
        expect(balance.avisosSinCodigoBalance[0].codigoSubcuenta).toBe(
            "5550000000"
        );
    });

    test("una línea sin desglose llega como lista vacía", () => {
        const sinDesglose = {
            ...balanceApi,
            datos: [{ ...balanceApi.datos[0], desglose: undefined }],
        };

        expect(balanceDesdeApi(sinDesglose).datos[0].desglose).toEqual([]);
    });
});
