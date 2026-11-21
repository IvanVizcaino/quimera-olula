import { beforeEach, describe, expect, it } from "vitest";
import { criteriaDefecto } from "@olula/lib/dominio.ts";
import { almacenDeTrabajo, criteriaInicialSga, parametrosAbc, preferenciasPantalla } from "../preferencias.ts";

describe("preferencias del SGA", () => {
    beforeEach(() => localStorage.clear());

    it("almacén de trabajo: el mismo que el almacén local de la ficha", () => {
        expect(almacenDeTrabajo.obtener()).toBeNull();
        localStorage.setItem("almacen-local", JSON.stringify({ id: "ALG", nombre_almacen: "Algeciras" }));
        expect(almacenDeTrabajo.obtener()).toBe("ALG");
        almacenDeTrabajo.fijar("MAD");
        expect(JSON.parse(localStorage.getItem("almacen-local")!)).toEqual({ id: "MAD", nombre_almacen: "MAD" });
        almacenDeTrabajo.fijar("");
        expect(almacenDeTrabajo.obtener()).toBe("MAD");
    });

    it("parámetros del ABC con sus valores por defecto", () => {
        expect(parametrosAbc.obtener()).toEqual({ origen: "ORDENES", dias: "90" });
        parametrosAbc.guardar({ origen: "VENTAS" });
        parametrosAbc.guardar({ dias: "365" });
        expect(parametrosAbc.obtener()).toEqual({ origen: "VENTAS", dias: "365" });
        localStorage.setItem("sga-parametros-abc", "{roto");
        expect(parametrosAbc.obtener()).toEqual({ origen: "ORDENES", dias: "90" });
    });

    it("preferencias de una pantalla", () => {
        const mapa = preferenciasPantalla("mapa", { capa: "OCUPACION", vista: "ESQUEMA" });
        mapa.guardar({ capa: "ABC_UBICACION" });
        expect(mapa.obtener()).toEqual({ capa: "ABC_UBICACION", vista: "ESQUEMA" });
    });

    it("el listado entra filtrado por el almacén de trabajo salvo que la URL traiga filtros", () => {
        expect(criteriaInicialSga(criteriaDefecto, criteriaDefecto)).toEqual(criteriaDefecto);
        almacenDeTrabajo.fijar("ALG");
        expect(criteriaInicialSga(criteriaDefecto, criteriaDefecto).filtro).toEqual([["almacen_id", "=", "ALG"]]);
        const abiertas = { ...criteriaDefecto, filtro: [["estado", "in", "PENDIENTE"]] as [string, string, string][] };
        expect(criteriaInicialSga(criteriaDefecto, abiertas).filtro)
            .toEqual([["estado", "in", "PENDIENTE"], ["almacen_id", "=", "ALG"]]);
        const enlace = { ...criteriaDefecto, filtro: [["zona_id", "=", "3"]] as [string, string, string][] };
        expect(criteriaInicialSga(enlace, abiertas)).toEqual(enlace);
    });
});
