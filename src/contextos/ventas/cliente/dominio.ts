import { EstadoObjetoValor, initEstadoObjetoValor, makeValidador, MetaObjetoValor, stringNoVacio, ValidacionCampo, ValidadorCampos, validarCampo } from "../../comun/dominio.ts";
import { idFiscalValido, tipoIdFiscalValido } from "../../valores/idfiscal.ts";
import { Cliente, CrmContacto, CuentaBanco, DirCliente, FormBaja, NuevaCuentaBanco, NuevaDireccion, NuevoCliente, NuevoCrmContacto } from "./diseño.ts";



export const idFiscalValidoGeneral = (tipo: string, valor: string) => {
    return idFiscalValido(tipo)(valor) && tipoIdFiscalValido(tipo) === true;
}

export const puedoMarcarDireccionFacturacion = (direccion: DirCliente) => {
    return !direccion.dir_facturacion;
}


export const clienteVacio = (): Cliente => ({
    id: '',
    nombre: '',
    nombre_comercial: null,
    id_fiscal: '',
    agente_id: null,
    nombre_agente: null,
    divisa_id: '',
    tipo_id_fiscal: '',
    serie_id: '',
    forma_pago_id: '',
    grupo_iva_negocio_id: '',
    de_baja: false,
    fecha_baja: null,
    grupo_id: '',
    telefono1: '',
    telefono2: '',
    email: '',
    web: '',
    observaciones: '',
    copiasfactura: 0,
    fechabaja: '',
    contacto_id: '',
    cuenta_domiciliada: '',
    descripcion_cuenta: '',
    debaja: false,
    forma_pago: '',
    divisa: '',
    grupo_iva_negocio: '',
    serie: '',
    grupo: '',
})

export const nuevoClienteVacio: NuevoCliente = {
    nombre: '',
    id_fiscal: '',
    empresa_id: '1',
    tipo_id_fiscal: '',
    agente_id: '',
}

export const nuevaDireccionVacia: NuevaDireccion = {
    nombre_via: '',
    tipo_via: '',
    ciudad: '',
}

export const nuevaCuentaBancoVacia: NuevaCuentaBanco = {
    descripcion: '',
    iban: '',
    bic: '',
}

export const nuevoCrmContactoVacio: NuevoCrmContacto = {
    nombre: '',
    email: '',
}

export const validadoresDireccion = {
    nuevaDireccion: (valor: NuevaDireccion) => (
        validadoresDireccion.tipo_via(valor.tipo_via) &&
        validadoresDireccion.nombre_via(valor.nombre_via) &&
        validadoresDireccion.ciudad(valor.ciudad)
    ),
    tipo_via: (valor: string) => stringNoVacio(valor),
    nombre_via: (valor: string) => stringNoVacio(valor),
    ciudad: (valor: string) => stringNoVacio(valor),
}

export const validadoresCliente = {
    nombre: (valor: string) => stringNoVacio(valor),
    id_fiscal: (valor: string) => stringNoVacio(valor),
    nuevoCliente: (cliente: NuevoCliente) =>
        cliente.nombre && cliente.id_fiscal,
};


export const initEstadoCliente = (cliente: Cliente): EstadoObjetoValor<Cliente> => {
    return initEstadoObjetoValor(cliente, metaCliente);
}

export const initEstadoDireccion = (direccion: DirCliente): EstadoObjetoValor<DirCliente> => {
    return initEstadoObjetoValor(direccion, metaDireccion);
}

const validacionesCliente: ValidadorCampos<Cliente> = {
    tipo_id_fiscal: (cliente: EstadoObjetoValor<Cliente>): ValidacionCampo => {
        const valido = tipoIdFiscalValido(cliente.valor.tipo_id_fiscal);
        return {
            ...cliente.validacion.tipo_id_fiscal,
            valido: valido === true,
            textoValidacion: typeof valido === "string" ? valido : "",
        }
    },
    id_fiscal: (cliente: EstadoObjetoValor<Cliente>): ValidacionCampo => {
        const tipoValido = tipoIdFiscalValido(cliente.valor.tipo_id_fiscal);
        const valido = tipoValido
            ? idFiscalValido(cliente.valor.tipo_id_fiscal)(cliente.valor.id_fiscal)
            : true;
        return {
            ...cliente.validacion.id_fiscal,
            valido: valido === true,
            textoValidacion: typeof valido === "string" ? valido : "",
        }
    },
    fecha_baja: (estado: EstadoObjetoValor<Cliente>): ValidacionCampo => {
        const cliente = estado.valor;
        const deBajaSinFecha = cliente.de_baja && cliente.fecha_baja === '';
        const activoConFecha = !cliente.de_baja && cliente.fecha_baja !== '';
        const invalido = deBajaSinFecha || activoConFecha;
        return {
            ...estado.validacion.fecha_baja,
            valido: !invalido,
            textoValidacion: deBajaSinFecha
                ? "Debe indicar la fecha de baja"
                : activoConFecha
                    ? "No se puede marcar como activo con fecha de baja"
                    : "",
        }
    },
    fecha_baja_segun_de_baja: (estado: EstadoObjetoValor<Cliente>): ValidacionCampo => {
        const cliente = estado.valor;
        // const deBajaSinFecha = cliente.de_baja && cliente.fecha_baja === '';
        // const activoConFecha = !cliente.de_baja && cliente.fecha_baja !== '';
        // const invalido = deBajaSinFecha || activoConFecha;
        return {
            ...estado.validacion.fecha_baja,
            bloqueado: !cliente.de_baja,
            // valido: !invalido,
            // textoValidacion: deBajaSinFecha
            //     ? "Debe indicar la fecha de baja"
            //     : activoConFecha
            //         ? "No se puede marcar como activo con fecha de baja"
            //         : "",
        }
    },
}

const makeValidadorCliente = (validadorCampos: ValidadorCampos<Cliente>) =>

    (estado: EstadoObjetoValor<Cliente>, campo: string) => {

        const validacion = estado.validacion;

        switch (campo) {
            case "tipo_id_fiscal": {
                return {
                    ...validacion,
                    tipo_id_fiscal: validarCampo(estado, campo, validadorCampos.tipo_id_fiscal),
                    id_fiscal: validarCampo(estado, "id_fiscal", validadorCampos.id_fiscal),
                };
            }
            case "fecha_baja": {
                return {
                    ...validacion,
                    fecha_baja: validarCampo(estado, campo, validadorCampos.fecha_baja),
                };
            }
            case "de_baja": {
                const v1 = {
                    ...validacion,
                    fecha_baja: validarCampo(estado, campo, validadorCampos.fecha_baja_segun_de_baja),
                };
                return {
                    ...v1,
                    fecha_baja: validarCampo(estado, "fecha_baja", validadorCampos.fecha_baja),
                };
            }
            default: {
                return makeValidador(validadorCampos)(estado, campo);
            }
        }
    }

export const metaCliente: MetaObjetoValor<Cliente> = {
    bloqueados: ['nombre_agente'],
    requeridos: [
        'nombre',
        'tipo_id_fiscal',
        'id_fiscal'
    ],
    validador: makeValidadorCliente(validacionesCliente),
};

export const metaNuevoCliente: MetaObjetoValor<NuevoCliente> = {
    bloqueados: [],
    requeridos: [
        'nombre',
        'tipo_id_fiscal',
        'id_fiscal'
    ],
    validador: makeValidador({}),
};

export const metaDireccion: MetaObjetoValor<DirCliente> = {
    bloqueados: [],
    requeridos: [
        'tipo_via',
        'nombre_via',
        'ciudad'
    ],
    validador: makeValidador({}),
};

export const metaNuevaDireccion: MetaObjetoValor<NuevaDireccion> = {
    bloqueados: [],
    requeridos: [
        'nombre_via',
        'ciudad'
    ],
    validador: makeValidador({}),
};

export const metaCuentaBanco: MetaObjetoValor<CuentaBanco> = {
    bloqueados: [],
    requeridos: ["iban", "bic"],
    validador: makeValidador({}),
};

export const metaNuevaCuentaBanco: MetaObjetoValor<NuevaCuentaBanco> = {
    bloqueados: [],
    requeridos: ["cuenta"],
    validador: makeValidador({}),
};

export const metaCrmContacto: MetaObjetoValor<CrmContacto> = {
    bloqueados: [],
    requeridos: ["nombre", "email"],
    validador: makeValidador({}),
};

export const metaNuevoCrmContacto: MetaObjetoValor<NuevoCrmContacto> = {
    bloqueados: [],
    requeridos: ["nombre", "email"],
    validador: makeValidador({}),
};

export const metaDarDeBaja: MetaObjetoValor<FormBaja> = {
    bloqueados: [],
    requeridos: [
        'fecha_baja',
    ],
    validador: makeValidador({}),
};


export const initEstadoClienteVacio = () => initEstadoCliente(clienteVacio())


