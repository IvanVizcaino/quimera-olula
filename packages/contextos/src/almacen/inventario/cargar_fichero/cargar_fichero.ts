import { formatearNumero } from "@olula/lib/dominio.ts";
import { OpcionesCargaFichero, ResultadoCargaFichero, SeparadorFichero } from "../diseño.ts";

/** Ficheros que lee el servidor: texto con separador, Excel y OpenDocument. */
export const EXTENSIONES_FICHERO = [".csv", ".txt", ".xlsx", ".ods"];

export type FormatoFichero = "texto" | "xlsx" | "ods";

export const formatoFichero = (nombre: string): FormatoFichero | null => {
    const extension = nombre.toLowerCase().match(/\.[^.]+$/)?.[0] ?? "";
    if (extension === ".csv" || extension === ".txt") return "texto";
    if (extension === ".xlsx") return "xlsx";
    if (extension === ".ods") return "ods";
    return null;
};

/** En el desplegable "auto" es detectar (QSelect toma "" como vacío). */
const SEPARADOR_DETECTAR = "auto";

export const opcionesSeparador: { valor: string; descripcion: string }[] = [
    { valor: SEPARADOR_DETECTAR, descripcion: "Detectar" },
    { valor: "|", descripcion: "Barra vertical |" },
    { valor: ";", descripcion: "Punto y coma ;" },
    { valor: ",", descripcion: "Coma ," },
    { valor: "\t", descripcion: "Tabulador" },
];

export const separadorAOpcion = (separador: SeparadorFichero): string =>
    separador || SEPARADOR_DETECTAR;

export const separadorDesdeOpcion = (valor: string | undefined): SeparadorFichero =>
    opcionesSeparador.some((o) => o.valor === valor) && valor !== SEPARADOR_DETECTAR
        ? (valor as SeparadorFichero)
        : "";

export const opcionesCargaIniciales = (): OpcionesCargaFichero => ({
    separador: "",
    ignorarPrimeraLinea: false,
    simular: false,
    omitirRechazadas: false,
});

/** Lecturas pegadas a mano (referencia|cantidad|ubicación) como un fichero de texto. */
export const ficheroDesdeTexto = (texto: string): File =>
    new File([texto], "lecturas.txt", { type: "text/plain" });

const plural = (n: number, singular: string, plural: string) =>
    `${formatearNumero(n)} ${n === 1 ? singular : plural}`;

export const resumenCarga = (resultado: ResultadoCargaFichero, simulado: boolean): string => {
    const lecturas = plural(resultado.lecturas, "lectura válida", "lecturas válidas");
    const articulos = plural(resultado.articulos.length, "artículo", "artículos");
    const rechazadas = plural(resultado.rechazadas.length, "fila rechazada", "filas rechazadas");
    if (resultado.cargado) {
        const lineas = plural(resultado.lineas, "línea regularizada", "líneas regularizadas");
        return resultado.rechazadas.length
            ? `Cargado: ${lecturas} de ${articulos}, ${lineas}. Omitidas: ${rechazadas}.`
            : `Cargado: ${lecturas} de ${articulos}, ${lineas}.`;
    }
    if (simulado) {
        return `Simulación (no se ha grabado nada): ${lecturas} de ${articulos}, ${rechazadas}.`;
    }
    return resultado.rechazadas.length
        ? `No se ha cargado nada: ${rechazadas}. Corrija el fichero o cargue solo las válidas.`
        : "No se ha cargado nada: el fichero no tiene lecturas.";
};
