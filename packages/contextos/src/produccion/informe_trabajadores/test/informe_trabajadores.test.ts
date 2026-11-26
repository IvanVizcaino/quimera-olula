import { describe, expect, test } from "vitest";
import { filtroListadoVacio, motivoFiltroNoValido, nombreFicheroTrabajadores, queryListadoTrabajadores, textoTotal, tituloSeccion } from "../dominio.ts";
import { listadoTrabajadoresDesdeApi, urlHojaTrabajadores, urlListadoTrabajadores, urlReportTrabajadores } from "../infraestructura.ts";

describe("Listado de trabajadores", () => {
    test("URLs: solo los filtros con valor", () => {
        const vacio = filtroListadoVacio();
        expect(urlListadoTrabajadores(vacio)).toBe("/produccion/informe/trabajadores");
        expect(urlReportTrabajadores(vacio)).toBe("/produccion/informe/trabajadores/report");
        expect(urlHojaTrabajadores(vacio, "xlsx")).toBe("/produccion/informe/trabajadores/hoja?formato=xlsx");
        const filtro = { desde: "001", hasta: " 010 ", seccionId: "S 1" };
        expect(urlListadoTrabajadores(filtro)).toBe("/produccion/informe/trabajadores?desde=001&hasta=010&seccion_id=S+1");
        expect(urlHojaTrabajadores({ ...vacio, seccionId: "S1" }, "ods"))
            .toBe("/produccion/informe/trabajadores/hoja?seccion_id=S1&formato=ods");
        expect(queryListadoTrabajadores({ ...vacio, hasta: "5" })).toBe("?hasta=5");
    });

    test("desde no puede ir después de hasta", () => {
        expect(motivoFiltroNoValido({ desde: "010", hasta: "001", seccionId: "" })).toMatch(/después/);
        expect(motivoFiltroNoValido({ desde: "001", hasta: "", seccionId: "" })).toBeNull();
        expect(motivoFiltroNoValido({ desde: "001", hasta: "001", seccionId: "" })).toBeNull();
    });

    test("convierte la respuesta con los sin sección al final", () => {
        const listado = listadoTrabajadoresDesdeApi({
            titulo: "Trabajadores por sección", subtitulo: null, total: 3,
            grupos: [
                { seccion_id: "S1", seccion: "Corte", trabajadores: [{ id: "001", nombre: "Ana", de_baja: false }, { id: "002", nombre: null, de_baja: true }], total: 2 },
                { seccion_id: null, seccion: null, trabajadores: [{ id: "003", nombre: "Luis", de_baja: null }], total: 1 },
            ],
        });
        expect(listado).toMatchObject({ titulo: "Trabajadores por sección", subtitulo: "", total: 3 });
        expect(listado.grupos[0].trabajadores).toEqual([
            { id: "001", nombre: "Ana", deBaja: false }, { id: "002", nombre: "", deBaja: true },
        ]);
        expect(listado.grupos[1]).toMatchObject({ seccionId: null, seccion: "", total: 1 });
        expect(tituloSeccion(listado.grupos[0])).toBe("S1 · Corte");
        expect(tituloSeccion(listado.grupos[1])).toBe("Sin sección");
        expect(textoTotal(1)).toBe("1 trabajador");
        expect(textoTotal(2)).toBe("2 trabajadores");
        expect(nombreFicheroTrabajadores("ods")).toBe("trabajadores.ods");
    });
});
