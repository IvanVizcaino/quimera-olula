import { MetaCampo, MetaModelo } from "@olula/lib/dominio.js"

export type RecuentoArqueoTpv = {
    id: string,
    b500: number
    b200: number
    b100: number
    b50: number
    b20: number
    b10: number
    b5: number
    m2: number
    m1: number
    m050: number
    m020: number
    m010: number
    m005: number
    m002: number
    m001: number
    recuentoEfectivo: number,
    recuentoTarjeta: number,
    recuentoVales: number
}
const metaCampoMoneda: MetaCampo<RecuentoArqueoTpv> = { requerido: true, tipo: "numero", positivo: true };

const camposDenominacion = new Set([
    'b500', 'b200', 'b100', 'b50', 'b20', 'b10', 'b5',
    'm2', 'm1', 'm050', 'm020', 'm010', 'm005', 'm002', 'm001'
]);

const onChange = (modelo: RecuentoArqueoTpv, campo: string): RecuentoArqueoTpv => {
    if (camposDenominacion.has(campo)) {
        return {
            ...modelo,
            recuentoEfectivo:
                modelo.b500 * 500 +
                modelo.b200 * 200 +
                modelo.b100 * 100 +
                modelo.b50 * 50 +
                modelo.b20 * 20 +
                modelo.b10 * 10 +
                modelo.b5 * 5 +
                modelo.m2 * 2 +
                modelo.m1 +
                modelo.m050 * 0.5 +
                modelo.m020 * 0.2 +
                modelo.m010 * 0.1 +
                modelo.m005 * 0.05 +
                modelo.m002 * 0.02 +
                modelo.m001 * 0.01
        };
    }
    return modelo;
};

export const metaRecuentoArqueoTpv: MetaModelo<RecuentoArqueoTpv> = {

    campos: {
        id: { requerido: true },
        b500: metaCampoMoneda,
        b200: metaCampoMoneda,
        b100: metaCampoMoneda,
        b50: metaCampoMoneda,
        b20: metaCampoMoneda,
        b10: metaCampoMoneda,
        b5: metaCampoMoneda,
        m2: metaCampoMoneda,
        m1: metaCampoMoneda,
        m050: metaCampoMoneda,
        m020: metaCampoMoneda,
        m010: metaCampoMoneda,
        m005: metaCampoMoneda,
        m002: metaCampoMoneda,
        m001: metaCampoMoneda,
        recuentoEfectivo: { requerido: true, tipo: "moneda", bloqueado: true },
        recuentoTarjeta: { requerido: true, tipo: "moneda" },
        recuentoVales: { requerido: true, tipo: "moneda" },
    },
    onChange,
};

export const recuentoArqueoTpvInicial: RecuentoArqueoTpv = {
    id: "",
    b500: 0,
    b200: 0,
    b100: 0,
    b50: 0,
    b20: 0,
    b10: 0,
    b5: 0,
    m2: 0,
    m1: 0,
    m050: 0,
    m020: 0,
    m010: 0,
    m005: 0,
    m002: 0,
    m001: 0,
    recuentoEfectivo: 0,
    recuentoTarjeta: 0,
    recuentoVales: 0
};

