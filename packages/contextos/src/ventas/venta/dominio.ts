import { empresaActual } from "#/valores/empresaActual.ts";
import { Direccion } from "@olula/lib/diseño.js";
import { MetaCampo, MetaModelo } from "@olula/lib/dominio.ts";
import { CambioClienteVenta, ClienteVenta, LineaVenta, NuevaLineaVenta, NuevaVenta, Venta } from "./diseño.ts";

export const direccionVacia = (): Direccion => ({
    nombre_via: "",
    tipo_via: "",
    numero: "",
    otros: "",
    cod_postal: "",
    ciudad: "",
    provincia_id: 0,
    provincia: "",
    pais_id: "",
    apartado: "",
    telefono: "",
});

export const clienteVentaVacio: ClienteVenta = {
    cliente_id: null,
    nombre_cliente: '',
    id_fiscal: '',
    direccion_id: null,
    direccion: direccionVacia(),
}

export const ventaVacia: Venta = {
    id: '',
    codigo: '',
    fecha: new Date(),
    agente_id: '',
    nombre_agente: '',
    divisa_id: '',
    tasa_conversion: 1,
    total: 0,
    total_divisa_empresa: 0,
    neto: 0,
    total_iva: 0,
    total_irpf: 0,
    forma_pago_id: '',
    nombre_forma_pago: '',
    grupo_iva_negocio_id: '',
    observaciones: '',
    dtoPorcentual: 0,
    netoSinDto: 0,
}

export const nuevaVentaVacia: NuevaVenta = {
    cliente_id: "",
    direccion_id: "",
    empresa_id: empresaActual(),
}

export const cambioClienteVentaVacio: CambioClienteVenta = {
    cliente_id: "",
    nombre_cliente: "",
    direccion_id: "",
}
export const nuevaLineaVentaVacia: NuevaLineaVenta = {
    referencia: "",
    cantidad: 1,
};

export const metaVenta: MetaModelo<Venta> = {
    campos: {
        tasa_conversion: { tipo: "numero", requerido: false },
        total_divisa_empresa: { tipo: "numero", bloqueado: true },
        codigo: { bloqueado: true },
        divisa_id: { requerido: true },
    },
};

const metaDtoPorcentual: MetaCampo<LineaVenta> = {
    tipo: "decimal",
    requerido: false,
    decimales: 2,
    positivo: true,
    maximo: 100
};

const metaDtoLineal: MetaCampo<LineaVenta> = {
    tipo: "decimal",
    requerido: false,
    decimales: 2,
    positivo: true,
};

export const metaLineaVenta: MetaModelo<LineaVenta> = {
    campos: {
        cantidad: { tipo: "decimal", requerido: true, decimales: 2 },
        iva_incluido: { tipo: "checkbox", requerido: true },
        pvp_unitario: { tipo: "moneda", requerido: true },
        dto_porcentual: metaDtoPorcentual,
        dto_lineal: metaDtoLineal,
        referencia: { requerido: true },
    }
};

export const metaNuevaVenta: MetaModelo<NuevaVenta> = {
    campos: {
        cliente_id: { requerido: true },
        direccion_id: { requerido: true },
        empresa_id: { requerido: true },
    }
};

export const metaCambioClienteVenta: MetaModelo<CambioClienteVenta> = {
    campos: {
        cliente_id: { requerido: true },
        direccion_id: { requerido: true },
    }
};

export const metaNuevaLineaVenta: MetaModelo<NuevaLineaVenta> = {
    campos: {
        cantidad: { requerido: true, tipo: "decimal", decimales: 2 },
        referencia: { requerido: true, tipo: "texto" },
    }
};

