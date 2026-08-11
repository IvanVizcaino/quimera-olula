import { ArqueoTpv } from "#/tpv/arqueo/diseño.ts";
import { patchRecuentoArqueo } from "#/tpv/arqueo/infraestructura.ts";
import { RecuentoArqueoTpv } from "./diseño.ts";

export const getRecuentoInicial = (arqueo: ArqueoTpv): RecuentoArqueoTpv => {

    return {
        id: arqueo.id,
        b500: arqueo.recuentoCaja.b500,
        b200: arqueo.recuentoCaja.b200,
        b100: arqueo.recuentoCaja.b100,
        b50: arqueo.recuentoCaja.b50,
        b20: arqueo.recuentoCaja.b20,
        b10: arqueo.recuentoCaja.b10,
        b5: arqueo.recuentoCaja.b5,
        m2: arqueo.recuentoCaja.m2,
        m1: arqueo.recuentoCaja.m1,
        m050: arqueo.recuentoCaja.m050,
        m020: arqueo.recuentoCaja.m020,
        m010: arqueo.recuentoCaja.m010,
        m005: arqueo.recuentoCaja.m005,
        m002: arqueo.recuentoCaja.m002,
        m001: arqueo.recuentoCaja.m001,
        recuentoEfectivo: arqueo.recuentoEfectivo,
        recuentoTarjeta: arqueo.recuentoTarjeta,
        recuentoVales: arqueo.recuentoVales
    };
};

export const recuentoEfectivo = (recuento: RecuentoArqueoTpv): number => {
    return (
        recuento.b500 * 500 +
        recuento.b200 * 200 +
        recuento.b100 * 100 +
        recuento.b50 * 50 +
        recuento.b20 * 20 +
        recuento.b10 * 10 +
        recuento.b5 * 5 +
        recuento.m2 * 2 +
        recuento.m1 +
        recuento.m050 * 0.5 +
        recuento.m020 * 0.2 +
        recuento.m010 * 0.1 +
        recuento.m005 * 0.05 +
        recuento.m002 * 0.02 +
        recuento.m001 * 0.01
    );
}

export const guardarRecuento = async (
    arqueo: ArqueoTpv,
    recuento: RecuentoArqueoTpv,
    recuentoTipoTarjeta: Record<string, number>
): Promise<void> => {

    const arqueoRecontado = {
        ...arqueo,
        recuentoCaja: {
            b500: recuento.b500,
            b200: recuento.b200,
            b100: recuento.b100,
            b50: recuento.b50,
            b20: recuento.b20,
            b10: recuento.b10,
            b5: recuento.b5,
            m2: recuento.m2,
            m1: recuento.m1,
            m050: recuento.m050,
            m020: recuento.m020,
            m010: recuento.m010,
            m005: recuento.m005,
            m002: recuento.m002,
            m001: recuento.m001
        },
        recuentoTarjeta: recuento.recuentoTarjeta,
        recuentoVales: recuento.recuentoVales,
        recuentoTipoTarjeta: arqueo.recuentoTipoTarjeta.map(datos => ({
            idTipoTarjeta: datos.idTipoTarjeta,
            calculado: datos.calculado,
            contado: recuentoTipoTarjeta[datos.idTipoTarjeta] ?? datos.contado
        }))
    }
    await patchRecuentoArqueo(arqueoRecontado);
}

