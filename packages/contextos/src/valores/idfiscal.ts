export const opcionesTipoIdFiscal = [
    { valor: "NIF", descripcion: "N.I.F." },
    { valor: "NIF/IVA", descripcion: "V.A.T." },
    { valor: "Otro", descripcion: "OTRO" },
]

const TIPOS_ACEPTADOS = [...opcionesTipoIdFiscal.map((o) => o.valor), "PASAPORTE"];

export const idFiscalValido = (tipo: string) => (valor: string) => {
    if (tipo === "NIF") {
        return valor.length === 9 || "El NIF debe tener 9 caracteres";
    }
    if (tipo === "NIF/IVA") {
        return (valor.length === 11 && valor[0] === "E" && valor[1] === "S") || "El VAT debe cumplir ESXXXXXXXXXX";
    }
    return true;
}
export const tipoIdFiscalValido = (tipo: string): string | boolean => {
    return TIPOS_ACEPTADOS.includes(tipo) || "El tipo debe ser N.I.F., V.A.T. u OTRO";
}
