import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { ejecutarListaProcesos, MetaModelo, stringNoVacio } from "@olula/lib/dominio.ts";
import { ERR_IBAN_NO_VALIDO, ibanValido } from "@olula/lib/iban.ts";
import { CuentaBancaria } from "../diseño.js";
import { getCuentaBancaria, patchCuentaBancaria } from "../infraestructura.js";
import { ContextoDetalleCuentaBancaria, EstadoDetalleCuentaBancaria } from "./maquina.js";

type ProcesarDetalle = ProcesarContexto<EstadoDetalleCuentaBancaria, ContextoDetalleCuentaBancaria>;

const pipeCuenta = ejecutarListaProcesos<EstadoDetalleCuentaBancaria, ContextoDetalleCuentaBancaria>;

const ibanCuentaValido = (cuenta: CuentaBancaria): boolean | string =>
    !stringNoVacio(cuenta.iban) || ibanValido(cuenta.iban) || ERR_IBAN_NO_VALIDO;

// Los derivados van bloqueados: los calcula el servidor a partir del IBAN. Y
// ninguno es requerido, porque el autoguardado solo dispara si el modelo entero
// es válido y llegan vacíos hasta que el servidor los rellena.
const derivadoDelIban = { requerido: false, bloqueado: true } as const;

export const metaCuentaBancaria: MetaModelo<CuentaBancaria> = {
    campos: {
        descripcion: { requerido: false },
        iban: { requerido: false, validacion: ibanCuentaValido },
        empresaId: { requerido: false },
        obsoleta: { requerido: false, tipo: "checkbox" },

        codigoCuenta: derivadoDelIban,
        paisId: derivadoDelIban,
        digitoControl: derivadoDelIban,
        cuenta: derivadoDelIban,
        bic: derivadoDelIban,
        entidad: derivadoDelIban,
        agencia: derivadoDelIban,
    },
};

export const cuentaBancariaInicial = (): CuentaBancaria => ({
    id: '',
    codigoCuenta: '',
    paisId: '',
    obsoleta: false,
    empresaId: '',
    descripcion: '',
    iban: '',
    bic: '',
    entidad: '',
    agencia: '',
    digitoControl: '',
    cuenta: '',
});

export const contextoDetalleCuentaBancariaInicial: ContextoDetalleCuentaBancaria = {
    estado: 'INICIAL',
    cuenta: cuentaBancariaInicial(),
};

export const refrescarCuenta: ProcesarDetalle = async (contexto) => {
    const cuenta = await getCuentaBancaria(contexto.cuenta.id);
    return [
        { ...contexto, cuenta },
        [["cuenta_cambiada", cuenta]],
    ];
};

export const guardarCuenta = async (
    contexto: ContextoDetalleCuentaBancaria,
    cuenta: CuentaBancaria,
): Promise<void> => {
    const anterior = contexto.cuenta;
    const hayCambios =
        cuenta.descripcion !== anterior.descripcion ||
        cuenta.iban !== anterior.iban ||
        cuenta.empresaId !== anterior.empresaId ||
        cuenta.obsoleta !== anterior.obsoleta;
    if (!hayCambios) return;

    // Se envían solo los editables: mandar los derivados pisaría lo que calcula
    // el servidor desde el IBAN.
    await patchCuentaBancaria(cuenta.id, {
        descripcion: cuenta.descripcion,
        iban: cuenta.iban,
        empresaId: cuenta.empresaId,
        obsoleta: cuenta.obsoleta,
    });
};

export const cargarCuenta: (_: string) => ProcesarDetalle =
    (idCuenta) => async (contexto) => {
        const cuenta = await getCuentaBancaria(idCuenta);
        return pipeCuenta(contexto, [
            async (ctx) => ({ ...ctx, cuenta }),
            'ABIERTO',
        ]);
    };

export const cargarContexto: ProcesarDetalle = async (contexto, payload) => {
    const idCuenta = payload as string;
    if (idCuenta) {
        return cargarCuenta(idCuenta)(contexto);
    }
    return { ...contexto, estado: 'INICIAL', cuenta: cuentaBancariaInicial() };
};
