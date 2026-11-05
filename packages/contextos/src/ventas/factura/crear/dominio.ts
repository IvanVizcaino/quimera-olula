import { clienteRegistradoVacio, clienteVentaNoRegistradoVacio, metaModeloClienteVentaNoRegistrado, metaModeloClienteVentaRegistrado, ModeloClienteVentaNoRegistrado, ModeloClienteVentaRegistrado } from "#/ventas/comun/componentes/moleculas/ClienteVenta/cliente_venta.ts";
import { nuevaVentaVacia } from "#/ventas/venta/dominio.ts";
import { Modelo } from "@olula/lib/diseño.ts";
import { MetaModelo } from "@olula/lib/dominio.ts";
import { NuevaFactura } from "../diseño.ts";
import { postFactura } from "../infraestructura.ts";

export interface ModeloAltaFacturaRegistrada extends Modelo, ModeloClienteVentaRegistrado {
    idEmpresa: string;
}

export interface ModeloAltaFacturaNoRegistrada extends ModeloClienteVentaNoRegistrado {
    idEmpresa: string;
}

export const metaModeloAltaFacturaRegistrada: MetaModelo<ModeloAltaFacturaRegistrada> = {
    campos: {
        ...metaModeloClienteVentaRegistrado.campos,
        idEmpresa: { requerido: true },
    }
};

export const metaModeloAltaFacturaNoRegistrada: MetaModelo<ModeloAltaFacturaNoRegistrada> = {
    campos: {
        ...metaModeloClienteVentaNoRegistrado.campos,
        idEmpresa: { requerido: true },
    }
};

export const altaFacturaRegistradaVacia: ModeloAltaFacturaRegistrada = {
    ...clienteRegistradoVacio,
    idEmpresa: "",
} as ModeloAltaFacturaRegistrada;

export const altaFacturaNoRegistradaVacia: ModeloAltaFacturaNoRegistrada = {
    ...clienteVentaNoRegistradoVacio,
    idEmpresa: "",
}

export const crearFacturaRegistrada = async (alta: ModeloAltaFacturaRegistrada) => {
    return await postFactura({
        cliente_id: alta.idCliente,
        empresa_id: alta.idEmpresa
    });
}

export const crearFacturaNoRegistrada = async (alta: ModeloAltaFacturaNoRegistrada) => {
    return await postFactura({
        nombre_cliente: alta.nombre,
        id_fiscal: alta.idFiscal,
        tipo_via: alta.tipoVia || "",
        nombre_via: alta.nombreVia,
        numero: alta.numero || "",
        otros: alta.otros || "",
        cod_postal: alta.codPostal,
        ciudad: alta.ciudad || "",
        pais_id: alta.idPais || "",
        apartado: alta.apartado || "",
        telefono: alta.telefono || "",
        empresa_id: alta.idEmpresa
    });
}

export const nuevaFacturaVacia: NuevaFactura = nuevaVentaVacia;
