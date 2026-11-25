import { procesarEvento } from "@olula/lib/dominio.js";
import { describe, expect, test } from "vitest";
import { nuevaRegularizacionInicial } from "../../stock/regularizar/regularizar.ts";
import { fechaLocalAApi } from "../../stock/infraestructura.ts";
import { lineaACambios } from "../cambiar_linea/cambiar_linea.ts";
import {
    ficheroDesdeTexto,
    formatoFichero,
    opcionesCargaIniciales,
    resumenCarga,
} from "../cargar_fichero/cargar_fichero.ts";
import { contextoDetalleInventarioInicial, totalesLineas } from "../detalle/dominio.ts";
import { getMaquina } from "../detalle/maquina.ts";
import { LineaInventario, ResultadoCargaFichero } from "../diseño.ts";
import { cargaFicheroAFormData, resultadoCargaFicheroDesdeApi } from "../infraestructura.ts";

const linea = (id: string, inicial: number, final: number): LineaInventario => ({
    id,
    stockId: `S${id}`,
    almacenId: "ALG",
    articuloId: `REF${id}`,
    descripcion: `Artículo ${id}`,
    fecha: "2026-11-24",
    hora: "10:00:00",
    cantidadInicial: inicial,
    cantidadFinal: final,
    motivo: null,
    inventarioId: "000001",
});

const resultado = (cambios: Partial<ResultadoCargaFichero>): ResultadoCargaFichero => ({
    cargado: false,
    lecturas: 0,
    lineas: 0,
    articulos: [],
    rechazadas: [],
    ...cambios,
});

describe("Inventario y regularización de stock", () => {
    test("la fecha se envía a la API en hora local", () => {
        expect(fechaLocalAApi(new Date(2026, 10, 3, 23, 59))).toBe("2026-11-03");
    });

    test("la regularización parte de la cantidad actual del stock", () => {
        const nueva = nuevaRegularizacionInicial(4);
        expect(nueva.cantidad).toBe(4);
        expect(nueva.hora).toMatch(/^\d{2}:\d{2}:\d{2}$/);
    });
});

describe("Detalle del inventario", () => {
    const abierto = { ...contextoDetalleInventarioInicial, estado: "ABIERTO" as const };

    test("abre y cancela los modales de alta y de carga de fichero", async () => {
        const maquina = getMaquina();
        const [creando] = await procesarEvento(maquina, abierto, "crear_linea_solicitado", undefined);
        expect(creando.estado).toBe("CREANDO_LINEA");
        const [cancelado] = await procesarEvento(maquina, creando, "alta_de_linea_cancelada", undefined);
        expect(cancelado.estado).toBe("ABIERTO");
        const [cargando] = await procesarEvento(maquina, abierto, "cargar_fichero_solicitado", undefined);
        expect(cargando.estado).toBe("CARGANDO_FICHERO");
        const [sinCargar] = await procesarEvento(maquina, cargando, "carga_de_fichero_cancelada", undefined);
        expect(sinCargar.estado).toBe("ABIERTO");
    });

    test("editar y borrar línea necesitan una línea seleccionada", async () => {
        const maquina = getMaquina();
        const [sinLinea] = await procesarEvento(maquina, abierto, "cambio_linea_solicitado", undefined);
        expect(sinLinea.estado).toBe("ABIERTO");
        const [conLinea] = await procesarEvento(maquina, abierto, "linea_seleccionada", linea("1", 2, 5));
        expect(conLinea.lineaActiva?.id).toBe("1");
        const [cambiando] = await procesarEvento(maquina, conLinea, "cambio_linea_solicitado", undefined);
        expect(cambiando.estado).toBe("CAMBIANDO_LINEA");
        const [borrando] = await procesarEvento(maquina, conLinea, "borrar_linea_solicitado", undefined);
        expect(borrando.estado).toBe("BORRANDO_LINEA");
    });

    test("totaliza lo contado y la diferencia con el stock anterior", () => {
        expect(totalesLineas([linea("1", 2, 5), linea("2", 10, 7.5)])).toEqual({
            lineas: 2,
            contado: 12.5,
            diferencia: 0.5,
        });
        expect(totalesLineas([])).toEqual({ lineas: 0, contado: 0, diferencia: 0 });
    });

    test("el cambio de línea parte de la cantidad contada y el motivo", () => {
        expect(lineaACambios({ ...linea("1", 2, 5), motivo: "Recuento" })).toEqual({
            articuloId: "REF1",
            cantidad: 5,
            motivo: "Recuento",
        });
    });
});

describe("Carga de fichero del inventario", () => {
    test("reconoce CSV, TXT, XLSX y ODS sin distinguir mayúsculas", () => {
        expect(formatoFichero("lecturas.csv")).toBe("texto");
        expect(formatoFichero("LECTURAS.TXT")).toBe("texto");
        expect(formatoFichero("inv.Xlsx")).toBe("xlsx");
        expect(formatoFichero("inv.ods")).toBe("ods");
        expect(formatoFichero("inv.xls")).toBeNull();
        expect(formatoFichero("sin_extension")).toBeNull();
    });

    test("el texto pegado se envía como fichero TXT", () => {
        const fichero = ficheroDesdeTexto("A|1\nB|2");
        expect(fichero.name).toBe("lecturas.txt");
        expect(fichero.type).toBe("text/plain");
        expect(fichero.size).toBe(7);
    });

    test("resume la carga, la simulación y el rechazo", () => {
        const articulos = [{ articuloId: "A", descripcion: null, lecturas: 2, cantidad: 3.5, cantidadActual: 1 }];
        const rechazadas = [{ linea: 3, referencia: "NOEXISTE", cantidad: "1", motivo: "El artículo NOEXISTE no existe" }];
        expect(resumenCarga(resultado({ cargado: true, lecturas: 2, lineas: 1, articulos }), false))
            .toBe("Cargado: 2 lecturas válidas de 1 artículo, 1 línea regularizada.");
        expect(resumenCarga(resultado({ lecturas: 2, articulos, rechazadas }), true))
            .toBe("Comprobación (no se ha grabado nada): 2 lecturas válidas de 1 artículo, 1 fila rechazada.");
        expect(resumenCarga(resultado({ lecturas: 2, articulos, rechazadas }), false))
            .toContain("No se ha cargado nada: 1 fila rechazada");
        expect(resumenCarga(resultado({ cargado: true, lecturas: 1200, lineas: 1, articulos, rechazadas }), false))
            .toBe("Cargado: 1.200 lecturas válidas de 1 artículo, 1 línea regularizada. Omitidas: 1 fila rechazada.");
    });

    test("convierte la respuesta de la API", () => {
        const convertido = resultadoCargaFicheroDesdeApi({
            cargado: false,
            lecturas: 1,
            lineas: 0,
            articulos: [{ articulo_id: "A", descripcion: "Uno", lecturas: 1, cantidad: 2, cantidad_actual: 7 }],
            rechazadas: [{ linea: 2, referencia: "X", cantidad: "3", motivo: "El artículo X no existe" }],
        });
        expect(convertido.articulos).toEqual([
            { articuloId: "A", descripcion: "Uno", lecturas: 1, cantidad: 2, cantidadActual: 7 },
        ]);
        expect(convertido.rechazadas[0]).toEqual({ linea: 2, referencia: "X", cantidad: "3", motivo: "El artículo X no existe" });
    });

    test("monta el formulario multipart con las opciones", () => {
        const fichero = new File(["x"], "inv.ods");
        const auto = cargaFicheroAFormData(fichero, opcionesCargaIniciales());
        expect((auto.get("fichero") as File).name).toBe("inv.ods");
        expect(auto.has("separador")).toBe(false);
        expect(auto.get("simular")).toBe("false");
        const conOpciones = cargaFicheroAFormData(fichero, {
            separador: ";",
            ignorarPrimeraLinea: true,
            simular: true,
            omitirRechazadas: true,
        });
        expect(conOpciones.get("separador")).toBe(";");
        expect(conOpciones.get("ignorar_primera_linea")).toBe("true");
        expect(conOpciones.get("simular")).toBe("true");
        expect(conOpciones.get("omitir_rechazadas")).toBe("true");
    });
});
