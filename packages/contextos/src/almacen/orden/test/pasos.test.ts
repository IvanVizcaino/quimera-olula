import { LineaOrdenAlmacen, OrdenAlmacen } from "#/almacen/orden/diseño.ts";
import { ordenVacia } from "#/almacen/orden/dominio.ts";
import {
    definicion,
    definicionDeLinea,
    instruccionPasos,
    pasosEfectivos,
    tieneFaseDrop,
    tieneFasePick,
} from "#/almacen/orden/pasos/catalogo.ts";
import { CajaResuelta, CodigoResuelto, DefinicionPasos, ValoresLectura } from "#/almacen/orden/pasos/diseño.ts";
import {
    aLecturaOrden,
    aLecturaPalet,
    aplicarCodigo,
    buscarLineaParaCodigo,
    cantidadALeer,
    cantidadHecha,
    cantidadPendiente,
    definicionParaPalet,
    dimensionesPendientes,
    elegirLote,
    sinDestino,
    tiposAceptados,
    tiposAceptadosCabecera,
} from "#/almacen/orden/pasos/lector.ts";
import { describe, expect, test } from "vitest";

const linea = (parcial: Partial<LineaOrdenAlmacen>): LineaOrdenAlmacen => ({
    id: "1",
    sku: "414911",
    articulo: "Artículo",
    loteId: null,
    porLotes: false,
    cantidadPrevista: 25,
    cantidadReal: 0,
    idUbicacionOrigen: null,
    ubicacionOrigen: null,
    idCajaOrigen: null,
    cajaOrigen: null,
    idUbicacionDestino: "14",
    ubicacionDestino: "PK-2",
    idCajaDestino: null,
    cajaDestino: null,
    idLineaPick: null,
    pasosPick: null,
    pasosDrop: "SKU-CANTIDAD",
    cantidadPick: 0,
    pedidoVentaId: null,
    pedidoVenta: null,
    cliente: null,
    cambioPedido: null,
    cantidadPedidoAnterior: null,
    lecturas: [],
    ...parcial,
});

const ordenCon = (lineas: LineaOrdenAlmacen[], parcial: Partial<OrdenAlmacen> = {}): OrdenAlmacen =>
    ({ ...ordenVacia(), id: "O1", tipo: "ENTRADA", lineas, ...parcial });

const def = (codigo: string, fase: "PICK" | "DROP" = "DROP") => definicion(codigo, fase) as DefinicionPasos;

const articulo = (sku: string, loteId: string | null = null): CodigoResuelto =>
    ({ tipo: "articulo", sku, descripcion: `Desc ${sku}`, loteId });
const ubicacion = (id: string, codigo = id): CodigoResuelto => ({ tipo: "ubicacion", id, codigo });
const caja = (parcial: Partial<CajaResuelta> = {}): CajaResuelta => ({
    tipo: "caja", id: "C1", lpn: "BX-1", sku: null, idLote: null, idUbicacion: "14",
    cantidad: null, capacidad: null, ...parcial,
});

/** Aplica varios códigos seguidos y devuelve los valores (falla el test si alguno da error). */
const leer = (d: DefinicionPasos, l: LineaOrdenAlmacen | null, ...codigos: CodigoResuelto[]): ValoresLectura =>
    codigos.reduce<ValoresLectura>((v, c) => {
        const r = aplicarCodigo(d, l, v, c);
        if (!r.ok) throw new Error(r.error);
        return r.valores;
    }, {});

// Réplica de la entrada E0000013: una línea suelta sin lotes y otra por lotes.
const lineaSku = linea({ id: "297" });
const lineaLote = linea({
    id: "298", sku: "414913", loteId: "1234", porLotes: true, cantidadPrevista: 2, pasosDrop: "LOTE-CANTIDAD",
});
const e13 = ordenCon([lineaSku, lineaLote], { id: "E0000013" });

describe("[pasos-catalogo] catálogo", () => {
    test("todos los modos tienen definición y nombre", () => {
        for (const c of ["SKU-CANTIDAD", "LOTE-CANTIDAD", "SKU_LOTE-CANTIDAD", "CAJAS", "PALET", "CAJAS-UBICACION", "SKU-UBICACION"]) {
            expect(def(c).nombre).toBeTruthy();
        }
        for (const c of ["SKU_CAJA", "LOTE_CAJA", "LOTE-CAJAS", "CAJA-CAJAS", "CAJAS", "CAJA-CANTIDAD"]) {
            expect(def(c, "PICK").nombre).toBeTruthy();
        }
    });

    test("el manejo de caja lo fija el modo", () => {
        expect(def("CAJAS-UBICACION").manejoCaja).toBe("COMPLETA");
        expect(def("CAJAS", "PICK").manejoCaja).toBe("COMPLETA");
        expect(def("CAJA-CAJAS", "PICK").manejoCaja).toBe("EXTRAER");
        expect(def("CAJA-CAJAS", "PICK").cantidad).toBe("CAPACIDAD_SUBCAJA");
    });

    test("los pasos de la línea prevalecen sobre los de cabecera", () => {
        const o = ordenCon([], { pasosDrop: "CAJAS" });
        expect(pasosEfectivos(lineaSku, o, "DROP")).toBe("SKU-CANTIDAD");
        expect(pasosEfectivos(linea({ pasosDrop: null }), o, "DROP")).toBe("CAJAS");
    });

    test("una entrada sin pasos de drop se lee como CAJAS", () => {
        const l = linea({ pasosDrop: null });
        expect(definicionDeLinea(l, ordenCon([l]), "DROP")?.codigo).toBe("CAJAS");
        expect(definicionDeLinea(l, ordenCon([l], { tipo: "SALIDA" }), "DROP")).toBeNull();
    });

    test("fases de la línea: el pick directo no es fase de pick", () => {
        const o = ordenCon([], { tipo: "TRASPASO" });
        expect(tieneFasePick(linea({ pasosPick: "CAJAS", pasosDrop: "CAJAS-UBICACION" }), o)).toBe(true);
        expect(tieneFasePick(linea({ pasosPick: "CAJA-CANTIDAD", pasosDrop: null }), o)).toBe(false);
        expect(tieneFaseDrop(linea({ pasosPick: "SKU_CAJA", pasosDrop: null }), o)).toBe(false);
    });

    test("la instrucción sale del catálogo o, si no existe, es el código", () => {
        expect(instruccionPasos("SKU-CANTIDAD", "DROP")).toContain("SKU");
        expect(instruccionPasos("XYZ", "DROP")).toBe("XYZ");
    });
});

describe("[pasos-cantidades] cantidades por fase", () => {
    test("en el pick de una línea con drop, lo dejado cuenta como recogido", () => {
        const l = linea({ pasosPick: "CAJAS", pasosDrop: "CAJAS-UBICACION", cantidadPick: 4, cantidadReal: 6, cantidadPrevista: 10 });
        const o = ordenCon([l], { tipo: "TRASPASO" });
        expect(cantidadHecha(l, o, "PICK")).toBe(10);
        expect(cantidadPendiente(l, o, "DROP")).toBe(4);
    });

    test("en una línea solo-pick cuenta solo el pick", () => {
        const l = linea({ pasosPick: "SKU_CAJA", pasosDrop: null, cantidadPick: 3, cantidadReal: 3 });
        expect(cantidadHecha(l, ordenCon([l], { tipo: "SALIDA" }), "PICK")).toBe(3);
    });
});

describe("[pasos-drop-suelto] SKU-CANTIDAD / LOTE-CANTIDAD", () => {
    test("pide qué, cantidad y destino", () => {
        expect(dimensionesPendientes(def("SKU-CANTIDAD"), lineaSku, {})).toEqual(["que", "cantidad", "destino"]);
        expect(tiposAceptados(def("SKU-CANTIDAD"), "destino")).toEqual(["caja", "ubicacion"]);
    });

    test("SKU y ubicación prevista: queda suelto", () => {
        const v = leer(def("SKU-CANTIDAD"), lineaSku, articulo("414911"));
        const r = aplicarCodigo(def("SKU-CANTIDAD"), lineaSku, { ...v, cantidad: 25 }, ubicacion("14", "PK-2"));
        expect(r.ok && r.valores).toMatchObject({ idUbicacionDestino: "14", idCajaDestino: null });
    });

    test("LOTE-CANTIDAD exige el lote y lo valida", () => {
        expect(aplicarCodigo(def("LOTE-CANTIDAD"), lineaLote, {}, articulo("414913"))).toEqual({ ok: false, error: "Lee el código del lote" });
        expect(aplicarCodigo(def("LOTE-CANTIDAD"), lineaLote, {}, articulo("414913", "9")).ok).toBe(false);
    });

    test("caja de destino: en la ubicación prevista y sin otro artículo", () => {
        const v = { sku: "414911", loteId: null, cantidad: 25 };
        expect(aplicarCodigo(def("SKU-CANTIDAD"), lineaSku, v, caja()).ok).toBe(true);
        expect(aplicarCodigo(def("SKU-CANTIDAD"), lineaSku, v, caja({ idUbicacion: "15" })).ok).toBe(false);
        expect(aplicarCodigo(def("SKU-CANTIDAD"), lineaSku, v, caja({ sku: "999" })).ok).toBe(false);
    });

    test("lectura registrada: sin caja, con ubicación y fase DROP", () => {
        const lectura = aLecturaOrden(def("SKU-CANTIDAD"), lineaSku, e13,
            { sku: "414911", loteId: null, cantidad: 20, idUbicacionDestino: "14", idCajaDestino: null }, "DROP");
        expect(lectura).toMatchObject({ cantidad: 20, idCajaDestino: null, idUbicacionDestino: "14", cajaCompleta: false, fase: "DROP" });
    });
});

describe("[pasos-drop-cajas] CAJAS (entrada)", () => {
    const l = linea({ pasosDrop: "CAJAS", cantidadPrevista: 30 });
    const o = ordenCon([l]);

    test("se lee la caja destino y la cantidad es su capacidad", () => {
        const v = leer(def("CAJAS"), l, caja({ sku: "414911", capacidad: 10 }));
        expect(dimensionesPendientes(def("CAJAS"), l, v)).toEqual([]);
        expect(aLecturaOrden(def("CAJAS"), l, o, v, "DROP")).toMatchObject({ idCajaDestino: "C1", cantidad: 10 });
    });

    test("un palé (caja sin SKU) se registra como lectura de caja completa", () => {
        const v = leer(def("CAJAS"), l, caja({ id: "P1", lpn: "BX-P" }));
        expect(v.palet).toEqual({ id: "P1", lpn: "BX-P" });
        expect(dimensionesPendientes(def("CAJAS"), l, v)).toEqual([]);
        expect(aLecturaPalet(v)).toEqual({ cajaId: "P1", cajaCompleta: true, idUbicacionDestino: null, idCajaDestino: null });
    });

    test("la caja localiza la línea en cabecera", () => {
        expect(buscarLineaParaCodigo(o, "DROP", caja({ sku: "414911" }))?.id).toBe("1");
        expect(tiposAceptadosCabecera(o, "DROP")).toEqual(["caja"]);
    });
});

describe("[pasos-drop-palet] PALET", () => {
    test("un palé no ligado a ninguna línea usa la definición de palé", () => {
        const l = linea({ pasosDrop: "PALET" });
        const o = ordenCon([l]);
        expect(buscarLineaParaCodigo(o, "DROP", caja({ id: "P9" }))).toBeNull();
        const d = definicionParaPalet(o, "DROP")!;
        expect(d.codigo).toBe("PALET");
        expect(dimensionesPendientes(d, null, { palet: { id: "P9", lpn: "BX-9" } })).toEqual([]);
    });
});

describe("[pasos-colocacion] CAJAS-UBICACION", () => {
    const l = linea({ pasosDrop: "CAJAS-UBICACION", idUbicacionDestino: "20", ubicacionDestino: "A-1" });
    const o = ordenCon([l], { tipo: "TRASPASO" });

    test("caja y ubicación: mueve la caja entera con su contenido", () => {
        const v = leer(def("CAJAS-UBICACION"), l, caja({ sku: "414911", cantidad: 12 }), ubicacion("20"));
        const lectura = aLecturaOrden(def("CAJAS-UBICACION"), l, o, v, "DROP");
        expect(lectura).toMatchObject({ idCajaOrigen: "C1", cajaCompleta: true, cantidad: 12, idUbicacionDestino: "20", idCajaDestino: null, fase: "DROP" });
    });

    test("admite serie de cajas en cabecera", () => {
        expect(def("CAJAS-UBICACION").serie).toBe("QUE");
    });

    test("una caja recogida en el pick localiza su línea", () => {
        const recogida = linea({
            id: "2", sku: "777", pasosPick: "CAJAS", pasosDrop: "CAJAS-UBICACION", cantidadPick: 5,
            lecturas: [{ id: "L1", sku: "777", loteId: null, cantidad: 5, idUbicacionOrigen: null, ubicacionOrigen: null,
                idCajaOrigen: "C7", cajaOrigen: "BX-7", idUbicacionDestino: null, ubicacionDestino: null,
                idCajaDestino: null, cajaDestino: null, fechaHora: new Date(), idLecturaCaja: null }],
        });
        const ot = ordenCon([recogida], { tipo: "TRASPASO" });
        expect(buscarLineaParaCodigo(ot, "DROP", caja({ id: "C7", sku: "777" }))?.id).toBe("2");
    });
});

describe("[pasos-pick-suelto-caja] SKU_CAJA / LOTE_CAJA", () => {
    const l = linea({ pasosPick: "LOTE_CAJA", pasosDrop: null, porLotes: true, sku: "500", idUbicacionOrigen: "U1", ubicacionOrigen: "U-1", cantidadPrevista: 8 });
    const o = ordenCon([l], { tipo: "SALIDA" });
    const d = def("LOTE_CAJA", "PICK");

    test("lote suelto: origen sin caja y cantidad limitada al stock suelto", () => {
        const r = aplicarCodigo(d, l, {}, articulo("500", "L1"), { stockSuelto: 3 });
        expect(r.ok).toBe(true);
        const v = r.ok ? r.valores : {};
        expect(dimensionesPendientes(d, l, v)).toEqual([]);
        expect(aLecturaOrden(d, l, o, v, "PICK")).toMatchObject({
            idCajaOrigen: null, idUbicacionOrigen: "U1", idLote: "L1", cantidad: 3,
            idCajaDestino: null, idUbicacionDestino: null, fase: "PICK", cajaCompleta: false,
        });
    });

    test("sin stock suelto pide leer la caja", () => {
        expect(aplicarCodigo(d, l, {}, articulo("500", "L1"), { stockSuelto: 0 }).ok).toBe(false);
    });

    test("caja con varios lotes: hay que elegir", () => {
        const r = aplicarCodigo(d, l, {}, caja({ sku: "500", idUbicacion: "U1" }), { lotesEnCaja: ["L1", "L2"] });
        const v = r.ok ? r.valores : {};
        expect(v.lotesParaElegir).toEqual(["L1", "L2"]);
        expect(dimensionesPendientes(d, l, v)).toEqual(["que"]);
        const elegido = elegirLote(v, "L2");
        expect(dimensionesPendientes(d, l, elegido)).toEqual([]);
        expect(aLecturaOrden(d, l, o, elegido, "PICK")).toMatchObject({ idCajaOrigen: "C1", idLote: "L2", cantidad: 8 });
    });

    test("caja en otra ubicación da error", () => {
        expect(aplicarCodigo(d, l, {}, caja({ sku: "500", idLote: "L1", idUbicacion: "U9" })).ok).toBe(false);
    });

    test("en cabecera se acepta caja o artículo", () => {
        expect(tiposAceptadosCabecera(o, "PICK").sort()).toEqual(["articulo", "caja"]);
    });
});

describe("[pasos-pick-palet] LOTE-CAJAS / CAJA-CAJAS", () => {
    test("CAJA-CAJAS: palé y caja etiqueta, cantidad la calcula el backend", () => {
        const l = linea({ pasosPick: "CAJA-CAJAS", pasosDrop: "CAJAS-UBICACION", idCajaOrigen: "P1", cajaOrigen: "BX-P1" });
        const o = ordenCon([l], { tipo: "TRASPASO" });
        const d = def("CAJA-CAJAS", "PICK");
        expect(aplicarCodigo(d, l, {}, caja({ id: "P2", sku: "414911" })).ok).toBe(false); // otro palé
        const v = leer(d, l, caja({ id: "P1", sku: "414911" }), caja({ id: "E1", lpn: "BX-E1", sku: "414911" }));
        expect(aLecturaOrden(d, l, o, v, "PICK")).toMatchObject({
            idCajaOrigen: "P1", idCajaDestino: "E1", cantidad: 0, cajaCompleta: false, fase: "PICK",
        });
        // Serie de destinos: se mantiene el palé para la siguiente etiqueta.
        expect(dimensionesPendientes(d, l, sinDestino(v))).toEqual(["destino"]);
    });

    test("LOTE-CAJAS: lote y caja etiqueta", () => {
        const l = linea({ pasosPick: "LOTE-CAJAS", porLotes: true, idCajaOrigen: "P1" });
        const d = def("LOTE-CAJAS", "PICK");
        expect(dimensionesPendientes(d, l, {})).toEqual(["que", "destino"]);
        const v = leer(d, l, articulo("414911", "L5"), caja({ id: "E1", sku: "414911" }));
        expect(v).toMatchObject({ loteId: "L5", idCajaDestino: "E1" });
    });

    test("la caja etiqueta no puede ser el palé", () => {
        const l = linea({ pasosPick: "CAJA-CAJAS", idCajaOrigen: "P1" });
        const d = def("CAJA-CAJAS", "PICK");
        const v = leer(d, l, caja({ id: "P1", sku: "414911" }));
        expect(aplicarCodigo(d, l, v, caja({ id: "P1", sku: "414911" })).ok).toBe(false);
    });
});

describe("[pasos-pick-cajas] CAJAS (traspaso) y CAJA-CANTIDAD", () => {
    test("CAJAS: recoge la caja entera sin destino", () => {
        const l = linea({ pasosPick: "CAJAS", pasosDrop: "CAJAS-UBICACION", idUbicacionDestino: "D1" });
        const o = ordenCon([l], { tipo: "TRASPASO" });
        const d = def("CAJAS", "PICK");
        const v = leer(d, l, caja({ sku: "414911", cantidad: 6, idUbicacion: "U3" }));
        expect(aLecturaOrden(d, l, o, v, "PICK")).toMatchObject({
            idCajaOrigen: "C1", idUbicacionOrigen: "U3", cajaCompleta: true, cantidad: 6,
            idCajaDestino: null, idUbicacionDestino: null, fase: "PICK",
        });
    });

    test("CAJA-CANTIDAD: lectura directa sin fase hacia el destino de la línea", () => {
        const l = linea({ pasosPick: "CAJA-CANTIDAD", pasosDrop: null, idUbicacionDestino: "D1" });
        const o = ordenCon([l], { tipo: "TRASPASO" });
        const d = def("CAJA-CANTIDAD", "PICK");
        const v = { ...leer(d, l, caja({ sku: "414911" })), cantidad: 2 };
        expect(cantidadALeer(d, l, o, v, "PICK")).toBe(2);
        expect(aLecturaOrden(d, l, o, v, "PICK")).toMatchObject({ fase: null, idUbicacionDestino: "D1", cajaCompleta: false });
    });
});

describe("[pasos-cabecera] localizar la línea", () => {
    test("un lote localiza su línea aunque la orden tenga pasos mixtos", () => {
        expect(buscarLineaParaCodigo(e13, "DROP", articulo("414913", "1234"))?.id).toBe("298");
        expect(buscarLineaParaCodigo(e13, "DROP", articulo("414911"))?.id).toBe("297");
    });

    test("no devuelve líneas completas", () => {
        const o = ordenCon([linea({ cantidadReal: 25 })]);
        expect(buscarLineaParaCodigo(o, "DROP", articulo("414911"))).toBeNull();
    });
});
