/**
 * Ajustes opcionales del módulo de credenciales externas que registra cada app al
 * arrancar (mismo estilo que `configurarAccionErrorLimite`). Sin registrar nada, el
 * módulo se comporta como en el resto de apps.
 */
export interface ConfiguracionCredenciales {
    /** Empresa a la que pertenecen siempre las credenciales: el alta no pregunta la empresa. */
    empresaFija?: string;
    /** La app no tiene tesorería: se ocultan los campos de cuenta bancaria y su aviso. */
    sinCuentaBancaria?: boolean;
}

let configuracion: ConfiguracionCredenciales = {};

export const configurarCredenciales = (c: ConfiguracionCredenciales) => {
    configuracion = { ...c };
};

export const getConfiguracionCredenciales = (): ConfiguracionCredenciales => configuracion;
