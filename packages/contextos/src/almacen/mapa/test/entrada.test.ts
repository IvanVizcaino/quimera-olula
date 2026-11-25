import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { almacenDeTrabajo, parametrosAbc } from "#/almacen/comun/preferencias.ts";
import { contextoMapaDeEntrada, preferenciasMapa } from "../maquina.ts";

describe("entrada al mapa", () => {
    beforeEach(() => localStorage.clear());
    afterEach(() => window.history.replaceState(null, "", "/"));

    it("sin nada recordado ni enlace, en blanco", () => {
        const ctx = contextoMapaDeEntrada();
        expect([ctx.almacenId, ctx.origen, ctx.dias, ctx.capa, ctx.vista]).toEqual(["", "ORDENES", "90", "OCUPACION", "ESQUEMA"]);
    });

    it("con lo recordado: almacén de trabajo, ABC y capa, vista y zona", () => {
        almacenDeTrabajo.fijar("ALG");
        parametrosAbc.guardar({ origen: "VENTAS", dias: "365" });
        preferenciasMapa.guardar({ capa: "ABC_UBICACION", vista: "PLANTA", zonaId: "3" });
        const ctx = contextoMapaDeEntrada();
        expect([ctx.almacenId, ctx.origen, ctx.dias, ctx.capa, ctx.vista, ctx.zonaId])
            .toEqual(["ALG", "VENTAS", "365", "ABC_UBICACION", "PLANTA", "3"]);
    });

    it("el enlace manda: almacén, ubicación y orden; la zona recordada no se aplica a otro almacén", () => {
        almacenDeTrabajo.fijar("ALG");
        preferenciasMapa.guardar({ zonaId: "3" });
        window.history.replaceState(null, "", "/almacen/mapa?almacen_id=MAD&ubicacion_id=17&orden_id=T1");
        const ctx = contextoMapaDeEntrada();
        expect([ctx.almacenId, ctx.ubicacionId, ctx.ordenId, ctx.zonaId]).toEqual(["MAD", "17", "T1", ""]);
    });
});
