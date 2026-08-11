import { empresaActual } from "#/valores/empresaActual.ts";
import { MetaTabla } from "@olula/componentes/index.js";
import { MetaModelo, modeloEsEditable, modeloEsValido } from "@olula/lib/dominio.ts";
import {
    cambioClienteVentaVacio,
    clienteVentaVacio,
    metaCambioClienteVenta,
    metaLineaVenta,
    metaNuevaLineaVenta,
    metaNuevaVenta,
    metaVenta,
    nuevaLineaVentaVacia,
    nuevaVentaVacia,
    ventaVacia
} from "../venta/dominio.ts";
import {
    Albaran,
    CambioClienteAlbaran,
    LineaAlbaran,
    NuevaLineaAlbaran,
    NuevoAlbaran,
} from "./diseño.ts";

export const metaTablaAlbaran: MetaTabla<Albaran> = [
    {
        id: "codigo",
        cabecera: "Código",
    },
    {
        id: "nombre_cliente",
        cabecera: "Cliente",
        render: (a) => a.cliente.nombre_cliente,
    },
    {
        id: "total",
        cabecera: "Total",
        tipo: "moneda",
    },
];

export const albaranVacio = (): Albaran => ({
    ...ventaVacia,
    cliente: clienteVentaVacio,
    idfactura: null,
    lineas: [],
})

export const nuevoAlbaranVacio: NuevoAlbaran = nuevaVentaVacia;

export const cambioClienteAlbaranVacio: CambioClienteAlbaran = cambioClienteVentaVacio;

export const nuevaLineaAlbaranVacia: NuevaLineaAlbaran = nuevaLineaVentaVacia;

export const metaNuevoAlbaran: MetaModelo<NuevoAlbaran> = metaNuevaVenta;

export const metaCambioClienteAlbaran: MetaModelo<CambioClienteAlbaran> = metaCambioClienteVenta;

export const metaAlbaran: MetaModelo<Albaran> = {
    campos: {
        ...metaVenta.campos,
        fecha: { tipo: "fecha", requerido: false },
    },
    editable: (albaran: Albaran, _?: string) => {
        return !albaran.idfactura;
    },
};

export const editable = modeloEsEditable<Albaran>(metaAlbaran);
export const albaranValido = modeloEsValido<Albaran>(metaAlbaran);

export const metaLineaAlbaran: MetaModelo<LineaAlbaran> = metaLineaVenta;

export const metaNuevaLineaAlbaran: MetaModelo<NuevaLineaAlbaran> = metaNuevaLineaVenta;

const albaranVacioObjeto: Albaran = albaranVacio();

export const albaranVacioContexto = (): Albaran => ({ ...albaranVacioObjeto });

export const nuevoClienteRegistradoVacio: NuevoAlbaran = {
    cliente_id: "",
    direccion_id: "",
    empresa_id: empresaActual(),
} as NuevoAlbaran;

export const cambioClienteVacio = (): CambioClienteAlbaran => ({
    cliente_id: "",
    direccion_id: "",
});

export const cambioCliente = (albaran: Albaran): CambioClienteAlbaran => ({
    cliente_id: albaran.cliente.cliente_id ?? "",
    direccion_id: albaran.cliente.direccion_id ?? "",
});
