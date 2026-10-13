import { MetaModelo } from "@olula/lib/dominio.ts";
import { CambiosTarjetaPuntos, NuevaTarjetaPuntos, TarjetaPuntos } from "./diseño.ts";

export const metaNuevaTarjetaPuntos: MetaModelo<NuevaTarjetaPuntos> = {
    campos: {
        id: { requerido: true },
        nombre: { requerido: true },
        idFiscal: { requerido: true },
        direccion: { requerido: true },
    },
};

export const metaCambiosTarjetaPuntos: MetaModelo<CambiosTarjetaPuntos> = {
    campos: {
        nombre: { requerido: true },
        idFiscal: { requerido: true },
        direccion: { requerido: true },
    },
};

export const tarjetaPuntosVacia = (): TarjetaPuntos => ({
    id: "",
    nombre: "",
    idFiscal: "",
    direccion: "",
    codPostal: null,
    ciudad: null,
    provincia: null,
    activa: true,
    saldo: 0,
});

export const nuevaTarjetaPuntosVacia = (): NuevaTarjetaPuntos => ({
    id: "",
    nombre: "",
    idFiscal: "",
    direccion: "",
    codPostal: null,
    ciudad: null,
    provincia: null,
});
