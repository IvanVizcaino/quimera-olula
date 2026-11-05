import { ejercicioDelMovimiento, paramsAsiento } from "#/tesoreria/conciliacion/conciliar_asiento/dominio.ts";
import {
    CandidatoConciliacion, CandidatoListaConciliacion, Conciliacion, ItemConciliacion, MovimientoBancario,
    PartidaHuerfana, RemesaCandidata,
} from "#/tesoreria/conciliacion/diseño.ts";
import {
    admiteSeleccion,
    filtrarCandidatosPorTipo,
    diferenciaSeleccion,
    itemsDesdeSeleccion,
    seleccionCuadra,
    sumaSeleccion,
    conciliacionDesdeCandidato,
    contrapartidaEsSubcuentaBanco,
    conciliacionDesdeRemesa,
    consecuenciaDesconciliarItem,
    cuadraRemesa,
    mensajeDesconciliarMovimientoBancario,
    importePartidaCoincide,
    importeRecibosRemesa,
    listaCandidatosConciliacion,
    reciboIdsConciliacionRemesa,
    urlRemesaConciliacion,
    etiquetaEstadoConConciliaciones,
    filtroCuentaBanco,
    movimientoBancarioVacio,
    restoConciliacionParcial,
    urlAsientoConciliacion,
    urlReciboConciliacion,
    conRemesas,
    varianteEstadoMovimientoBancario,
    varianteProbabilidad,
} from "#/tesoreria/conciliacion/dominio.ts";
import { describe, expect, test } from "vitest";

const movimiento = (cambios: Partial<MovimientoBancario> = {}): MovimientoBancario => ({
    ...movimientoBancarioVacio,
    id: "m1",
    importe: 300,
    ...cambios,
});

const candidato = (cambios: Partial<CandidatoConciliacion> = {}): CandidatoConciliacion => ({
    id: "cobro_7",
    tipoRecibo: "cobro",
    tipoConciliacion: "cobrar_recibo_venta",
    encaje: "completo",
    reciboId: "7",
    codigo: "F2026A00001-01",
    facturaCodigo: "F2026A00001",
    tercero: "Cliente",
    idFiscal: null,
    importe: 300,
    fechaVencimiento: new Date("2026-10-01"),
    estado: "Emitido",
    diasDiferencia: 0,
    ...cambios,
});

describe("estado del movimiento en la lista", () => {
    test("casado en verde, con candidatos en naranja y pendiente en rojo", () => {
        expect(varianteEstadoMovimientoBancario("conciliado")).toBe("exito");
        expect(varianteEstadoMovimientoBancario("candidatos")).toBe("advertencia");
        expect(varianteEstadoMovimientoBancario("pendiente")).toBe("error");
    });

    test("con candidatos indica cuántos hay", () => {
        expect(etiquetaEstadoConConciliaciones(movimiento({ estado: "candidatos", numConciliaciones: 1 }))).toBe("1 candidato");
        expect(etiquetaEstadoConConciliaciones(movimiento({ estado: "candidatos", numConciliaciones: 3 }))).toBe("3 candidatos");
        expect(etiquetaEstadoConConciliaciones(movimiento({ estado: "conciliado" }))).toBe("Conciliado");
        expect(etiquetaEstadoConConciliaciones(movimiento({ estado: "pendiente" }))).toBe("Pendiente");
    });
});

describe("conciliación a mano desde un recibo buscado", () => {
    test("un recibo por el importe del movimiento se casa entero", () => {
        const item = conciliacionDesdeCandidato(movimiento(), candidato());
        expect(item.tipo).toBe("cobrar_recibo_venta");
        expect(item.params).toEqual({ recibo_id: 7 });
        expect(item.recibo?.codigo).toBe("F2026A00001-01");
        expect(item.cuota).toBeNull();
    });

    test("un recibo mayor se casa en parte, por el importe del movimiento", () => {
        const mayor = candidato({ tipoConciliacion: "cobro_parcial_venta", importe: 500 });
        const item = conciliacionDesdeCandidato(movimiento(), mayor);

        expect(item.tipo).toBe("cobro_parcial_venta");
        expect(item.params).toEqual({ recibo_id: 7, importe: "300.00" });
        expect(restoConciliacionParcial(movimiento(), 500)).toBe(200);
    });

    test("en un cargo el importe parcial va en positivo", () => {
        const mayor = candidato({ tipoRecibo: "pago", tipoConciliacion: "pago_parcial_compra", importe: 100 });

        expect(conciliacionDesdeCandidato(movimiento({ importe: -40.5 }), mayor).params)
            .toEqual({ recibo_id: 7, importe: "40.50" });
        expect(restoConciliacionParcial(movimiento({ importe: -40.5 }), 100)).toBe(59.5);
    });
});

describe("enlaces al recibo", () => {
    test("urlReciboConciliacion genera la URL a partir del ítem y su recibo", () => {
        const itemCobro: ItemConciliacion = {
            tipo: "cobrar_recibo_venta",
            params: { recibo_id: 7 },
            recibo: {
                id: "7", codigo: "R", tercero: null, importe: 1, fechaVencimiento: new Date(), estado: "Emitido",
                fechaEmision: null, fechaCobro: null,
            },
            cuota: null,
            remesa: null,
            asientoId: null,
            asiento: null,
        };
        expect(urlReciboConciliacion(itemCobro)).toBe("/tesoreria/recibo_venta?id=7");

        const itemAsiento: ItemConciliacion = {
            tipo: "asiento_manual",
            params: {},
            recibo: null,
            cuota: null,
            remesa: null,
            asientoId: "12",
            asiento: null,
        };
        expect(urlReciboConciliacion(itemAsiento)).toBeNull();
        expect(urlAsientoConciliacion(itemAsiento)).toBe("/contabilidad/asiento?id=12");
        expect(urlAsientoConciliacion(itemCobro)).toBeNull();
    });
});

describe("probabilidad y filtros", () => {
    test("la probabilidad de conciliar sin preguntar sale en verde", () => {
        expect(varianteProbabilidad(95)).toBe("exito");
        expect(varianteProbabilidad(75)).toBe("advertencia");
        expect(varianteProbabilidad(40)).toBe("gris");
    });

    test("filtro de los movimientos de una cuenta", () => {
        expect(filtroCuentaBanco("000001")).toEqual(["cuenta_banco_id", "=", "000001"]);
    });

    test("los datos del asiento van a la API en snake_case y sin espacios", () => {
        expect(paramsAsiento({ codigoSubcuenta: " 6260000000 ", concepto: "Comisión " }))
            .toEqual({ codigo_subcuenta: "6260000000", concepto: "Comisión" });
    });

    test("solo es erróneo el asiento manual cuya contrapartida es la subcuenta del banco", () => {
        const asiento = (codigo: string): ItemConciliacion => ({
            tipo: "asiento_manual", params: { codigo_subcuenta: codigo },
            recibo: null, cuota: null, remesa: null, asientoId: null, asiento: null,
        });
        expect(contrapartidaEsSubcuentaBanco(asiento("1020000000"), "5720000001")).toBe(false);
        expect(contrapartidaEsSubcuentaBanco(asiento("5720000001"), "5720000001")).toBe(true);
        expect(contrapartidaEsSubcuentaBanco(asiento("5720000001"), null)).toBe(false);
    });

    test("la subcuenta del asiento se busca en el ejercicio de la fecha del movimiento", () => {
        expect(ejercicioDelMovimiento(movimiento({ fecha: new Date("2025-12-31T12:00:00") }))).toBe("2025");
    });
});

const remesa = (cambios: Partial<RemesaCandidata> = {}): RemesaCandidata => ({
    id: "12",
    tipoConciliacion: "cobro_parcial_remesa",
    tipoRemesa: null,
    fecha: new Date("2026-09-01"),
    fechaCargo: new Date("2026-09-05"),
    total: 180.1,
    importePendiente: 180.1,
    diasDiferencia: 2,
    recibos: [
        { reciboId: "1", codigo: "R1", tercero: "A", importe: 100.1 },
        { reciboId: "2", codigo: "R2", tercero: "B", importe: 50 },
        { reciboId: "3", codigo: "R3", tercero: "C", importe: 30 },
    ],
    reciboIdsPropuestos: ["1", "3"],
    propuestaAmbigua: false,
    ...cambios,
});

describe("conciliación con una remesa", () => {
    test("los recibos elegidos cuadran si suman el importe del movimiento, sin errores de redondeo", () => {
        expect(importeRecibosRemesa(remesa(), ["1", "3"])).toBe(130.1);
        expect(cuadraRemesa(movimiento({ importe: 130.1 }), remesa(), ["1", "3"])).toBe(true);
        expect(cuadraRemesa(movimiento({ importe: 130.1 }), remesa(), ["1"])).toBe(false);
        expect(cuadraRemesa(movimiento({ importe: 0 }), remesa(), [])).toBe(false);
    });

    test("con parte de los recibos es un cobro parcial con sus ids", () => {
        const item = conciliacionDesdeRemesa(remesa(), ["1", "3"]);

        expect(item.tipo).toBe("cobro_parcial_remesa");
        expect(item.params).toEqual({ remesa_id: 12, recibo_ids: [1, 3] });
        expect(reciboIdsConciliacionRemesa(item)).toEqual(["1", "3"]);
        expect(urlRemesaConciliacion(item)).toBe("/tesoreria/remesa?id=12");
    });

    test("con todos los recibos pendientes es un cobro de remesa", () => {
        const item = conciliacionDesdeRemesa(remesa(), ["3", "2", "1"]);

        expect(item.tipo).toBe("cobrar_remesa");
        expect(item.params).toEqual({ remesa_id: 12 });
        expect(reciboIdsConciliacionRemesa(item)).toBeNull();
    });
});

describe("lista única de candidatos", () => {
    const partida = (cambios: Partial<PartidaHuerfana> = {}): PartidaHuerfana => ({
        idasiento: 40,
        fecha: new Date("2026-09-03"),
        importe: 300,
        descripcion: "Cobro Ángel Pérez",
        numeroAsiento: "1234",
        ...cambios,
    });

    test("junta recibos, remesas y partidas ordenados por fecha descendente con su tipo", () => {
        const lista = listaCandidatosConciliacion([candidato()], [remesa()], [partida()], "");

        expect(lista.map((c) => [c.clase, c.tipo])).toEqual([
            ["recibo", "cobrar_recibo_venta"],
            ["remesa", "cobro_parcial_remesa"],
            ["partida", "asiento_vinculado"],
        ]);
    });

    test("el texto filtra remesas y partidas; los recibos ya vienen filtrados de la API", () => {
        const lista = listaCandidatosConciliacion([candidato()], [remesa()], [partida()], "angel");
        expect(lista.map((c) => c.clase)).toEqual(["recibo", "partida"]);

        const porRecibo = listaCandidatosConciliacion([], [remesa()], [partida()], "r2");
        expect(porRecibo.map((c) => c.clase)).toEqual(["remesa"]);

        const porAsiento = listaCandidatosConciliacion([], [remesa()], [partida()], " 1234 ");
        expect(porAsiento.map((c) => c.clase)).toEqual(["partida"]);
    });

    test("una partida solo se vincula si su importe es el del movimiento", () => {
        expect(importePartidaCoincide(partida({ importe: 300.004 }), movimiento())).toBe(true);
        expect(importePartidaCoincide(partida({ importe: 299 }), movimiento())).toBe(false);
    });
});

describe("conciliación con una remesa de pago", () => {
    const remesaPago = remesa({
        tipoConciliacion: "pagar_remesa", tipoRemesa: "Nóminas", reciboIdsPropuestos: ["1", "2", "3"],
    });

    test("se paga entera: sin recibos en los params y enlazada a la ficha de remesas de pago", () => {
        const item = conciliacionDesdeRemesa(remesaPago, ["1", "2", "3"]);

        expect(item.tipo).toBe("pagar_remesa");
        expect(item.params).toEqual({ remesa_id: 12 });
        expect(item.remesa?.tipoRemesa).toBe("Nóminas");
        expect(urlRemesaConciliacion(item)).toBe("/tesoreria/remesa_pago?id=12");
    });

    test("cuadra con un cargo por su total", () => {
        expect(cuadraRemesa(movimiento({ importe: -180.1 }), remesaPago, ["1", "2", "3"])).toBe(true);
    });

    test("solo un cargo con las remesas de pago activas tiene remesas de pago", () => {
        expect(conRemesas(movimiento({ importe: 100 }), () => false)).toBe(true);
        expect(conRemesas(movimiento({ importe: -100 }), () => true)).toBe(true);
        expect(conRemesas(movimiento({ importe: -100 }), () => false)).toBe(false);
    });

    test("al desconciliar avisa de que se borra el asiento y vuelven a remesadas", () => {
        const texto = consecuenciaDesconciliarItem(conciliacionDesdeRemesa(remesaPago, []));

        expect(texto).toContain("la remesa 12 de pago");
        expect(texto).toContain("sus nóminas seguirán en la remesa, pendientes de pago");
    });
});

describe("mensaje al desconciliar", () => {
    const item = (cambios: Partial<ItemConciliacion>): ItemConciliacion => ({
        tipo: "cobrar_recibo_venta", params: {}, recibo: null, cuota: null, remesa: null, asientoId: null, asiento: null, ...cambios,
    });
    const conciliacion = (items: ItemConciliacion[]): Conciliacion => ({
        id: "c1", items, probabilidad: 100, origen: "manual", justificacion: null,
    });
    const recibo = { codigo: "R-1" } as ItemConciliacion["recibo"];

    test("cobro de recibo: anula el cobro del recibo", () => {
        expect(consecuenciaDesconciliarItem(item({ recibo })))
            .toBe("Se anulará el cobro del recibo R-1 y volverá a quedar pendiente de cobro.");
    });

    test("cobro parcial: avisa de que se une con el resto", () => {
        expect(consecuenciaDesconciliarItem(item({ tipo: "cobro_parcial_venta", recibo })))
            .toContain("se volverá a unir con el recibo");
    });

    test("remesa parcial: indica cuántos recibos vuelven a pendiente", () => {
        const texto = consecuenciaDesconciliarItem(item({
            tipo: "cobro_parcial_remesa", params: { recibo_ids: [1, 2] },
            remesa: { id: "7" } as ItemConciliacion["remesa"],
        }));
        expect(texto).toContain("la remesa 7");
        expect(texto).toContain("los 2 recibos cobrados");
    });

    test("asiento vinculado: no borra el asiento", () => {
        expect(consecuenciaDesconciliarItem(item({ tipo: "asiento_vinculado" }))).toContain("no se borra");
    });

    test("varios ítems: una línea por ítem", () => {
        const texto = mensajeDesconciliarMovimientoBancario(conciliacion([
            item({ recibo }), item({ tipo: "asiento_manual" }),
        ]));
        expect(texto.split("\n").filter((l) => l.startsWith("• "))).toHaveLength(2);
    });

    test("sin conciliación cargada: mensaje genérico", () => {
        expect(mensajeDesconciliarMovimientoBancario(null)).toContain("Se deshará todo lo que se generó");
    });
});

describe("conciliación con varios candidatos", () => {
    const deRecibo = (recibo: CandidatoConciliacion): CandidatoListaConciliacion => ({
        clase: "recibo", id: `recibo_${recibo.id}`, fecha: recibo.fechaVencimiento,
        tipo: recibo.tipoConciliacion, recibo,
    });
    const deRemesa = (r: RemesaCandidata): CandidatoListaConciliacion => ({
        clase: "remesa", id: `remesa_${r.id}`, fecha: r.fechaCargo, tipo: r.tipoConciliacion, remesa: r,
    });
    const dePartida = (partida: PartidaHuerfana): CandidatoListaConciliacion => ({
        clase: "partida", id: `partida_${partida.idasiento}`, fecha: partida.fecha,
        tipo: "asiento_vinculado", partida,
    });
    const menor = (id: string, importe: number) =>
        deRecibo(candidato({ id: `cobro_${id}`, reciboId: id, encaje: "menor", importe }));
    const partida = (importe: number): PartidaHuerfana => ({
        idasiento: 40, fecha: new Date("2026-09-03"), importe, descripcion: null, numeroAsiento: "1234",
    });

    test("solo se seleccionan recibos completos o menores, remesas enteras y partidas del mismo sentido", () => {
        const ingreso = movimiento({ importe: 300 });

        expect(admiteSeleccion(deRecibo(candidato()), ingreso)).toBe(true);
        expect(admiteSeleccion(menor("8", 100), ingreso)).toBe(true);
        expect(admiteSeleccion(deRecibo(candidato({ encaje: "parcial", tipoConciliacion: "cobro_parcial_venta" })),
            ingreso)).toBe(false);
        expect(admiteSeleccion(deRemesa(remesa({ tipoConciliacion: "cobrar_remesa" })), ingreso)).toBe(true);
        expect(admiteSeleccion(deRemesa(remesa()), ingreso)).toBe(false);
        expect(admiteSeleccion(dePartida(partida(120)), ingreso)).toBe(true);
        expect(admiteSeleccion(dePartida(partida(-120)), ingreso)).toBe(false);
    });

    test("cuadra si la suma es el importe del movimiento, sin errores de redondeo", () => {
        const seleccion = [menor("8", 100.1), menor("9", 200.2)];

        expect(sumaSeleccion(seleccion)).toBe(300.3);
        expect(seleccionCuadra(movimiento({ importe: 300.3 }), seleccion)).toBe(true);
        expect(diferenciaSeleccion(movimiento({ importe: 500 }), seleccion)).toBe(199.7);
        expect(seleccionCuadra(movimiento({ importe: 500 }), seleccion)).toBe(false);
        expect(seleccionCuadra(movimiento({ importe: 0 }), [])).toBe(false);
    });

    test("en un cargo las partidas suman en positivo", () => {
        const recibo = deRecibo(candidato({ tipoRecibo: "pago", tipoConciliacion: "pagar_recibo_compra",
            encaje: "menor", importe: 700 }));
        const seleccion = [recibo, dePartida(partida(-300))];

        expect(sumaSeleccion(seleccion)).toBe(1000);
        expect(seleccionCuadra(movimiento({ importe: -1000 }), seleccion)).toBe(true);
    });

    test("cada ítem lleva el importe que cubre: en positivo, y la partida con su signo", () => {
        const items = itemsDesdeSeleccion([
            menor("8", 400),
            deRemesa(remesa({ tipoConciliacion: "cobrar_remesa" })),
            dePartida(partida(120)),
        ]);

        expect(items.map((item) => [item.tipo, item.params])).toEqual([
            ["cobrar_recibo_venta", { recibo_id: 8, importe: "400.00" }],
            ["cobrar_remesa", { remesa_id: 12, importe: "180.10" }],
            ["asiento_vinculado", { idasiento: 40, importe: "120.00" }],
        ]);
        expect(items[0]?.recibo?.codigo).toBe("F2026A00001-01");
        expect(items[2]?.asiento).toEqual({
            id: "40", numero: "1234", fecha: new Date("2026-09-03"), importe: 120, concepto: null,
        });
    });

    test("una remesa de pago cubre su total", () => {
        const remesaPago = remesa({ tipoConciliacion: "pagar_remesa", total: 250, importePendiente: 180.1 });

        expect(sumaSeleccion([deRemesa(remesaPago)])).toBe(250);
    });

    test("los seleccionados salen de la lista de candidatos", () => {
        const recibo = candidato();
        const lista = listaCandidatosConciliacion([recibo, candidato({ id: "cobro_8", reciboId: "8" })], [], [], "",
            [deRecibo(recibo)]);

        expect(lista.map((c) => c.id)).toEqual(["recibo_cobro_8"]);
    });
});

describe("filtro de candidatos por tipo", () => {
    const lista = listaCandidatosConciliacion(
        [candidato(), candidato({ id: "pago_8", tipoRecibo: "pago", tipoConciliacion: "pagar_recibo_compra" })],
        [remesa({ tipoConciliacion: "cobrar_remesa" }), remesa({ id: "13", tipoConciliacion: "pagar_remesa" })],
        [{ idasiento: 40, fecha: new Date("2026-09-03"), importe: 300, descripcion: null, numeroAsiento: "1234" }],
        "",
    );
    const ids = (filtros: Parameters<typeof filtrarCandidatosPorTipo>[1]) =>
        filtrarCandidatosPorTipo(lista, filtros).map((c) => c.id).sort();

    test("sin ningún tipo marcado se ven todos", () => {
        expect(filtrarCandidatosPorTipo(lista, [])).toHaveLength(5);
    });

    test("con varios tipos marcados se ven los de cualquiera de ellos", () => {
        expect(ids(["cobro"])).toEqual(["recibo_cobro_7"]);
        expect(ids(["pago", "remesa_pago"])).toEqual(["recibo_pago_8", "remesa_pagar_remesa_13"]);
        expect(ids(["remesa_cobro", "asiento"])).toEqual(["partida_40", "remesa_cobrar_remesa_12"]);
    });
});
