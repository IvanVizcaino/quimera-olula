import { MetaModelo } from "@olula/lib/dominio.ts";
import { CambiosSecuencia, DatosSecuencia, SecuenciaSerie } from "./diseño.ts";

const texto = (n: number | null): string => (n === null || n === undefined ? "" : String(n));

export const datosSecuencia = (s: SecuenciaSerie): DatosSecuencia => ({
    descripcion: s.descripcion,
    valor: texto(s.valor),
    valorout: texto(s.valorout),
    valorini: texto(s.valorini),
});

const numeroValido = (valor: string): boolean => valor.trim() === "" || /^\d+$/.test(valor.trim());

/** secuencias.mtd: descripción de 100 y valores `uint`. */
export const metaDatosSecuencia: MetaModelo<DatosSecuencia> = {
    campos: {
        descripcion: { requerido: false, maximo: 100 },
        valor: { requerido: false },
        valorout: { requerido: false },
        valorini: { requerido: false },
    },
    validacion: (m) => {
        const campos: [keyof DatosSecuencia, string][] = [
            ["valor", "El valor"], ["valorout", "El valor sin bloqueo"], ["valorini", "El valor inicial"],
        ];
        for (const [campo, etiqueta] of campos) {
            if (!numeroValido(String(m[campo] ?? ""))) {
                return `${etiqueta} debe ser un número entero no negativo`;
            }
        }
        return true;
    },
};

const numero = (valor: string): number | null =>
    String(valor ?? "").trim() === "" ? null : Number(valor);

/** Solo lo que cambia (y todo si la secuencia aún no existe). */
export const cambiosSecuencia = (s: SecuenciaSerie, d: DatosSecuencia): CambiosSecuencia => {
    const previo = datosSecuencia(s);
    const nueva = s.idsec === null;
    return {
        ...(nueva || d.descripcion.trim() !== previo.descripcion ? { descripcion: d.descripcion.trim() } : {}),
        ...(nueva || numero(d.valor) !== numero(previo.valor) ? { valor: numero(d.valor) } : {}),
        ...(nueva || numero(d.valorout) !== numero(previo.valorout) ? { valorout: numero(d.valorout) } : {}),
        ...(nueva || numero(d.valorini) !== numero(previo.valorini) ? { valorini: numero(d.valorini) } : {}),
    };
};
