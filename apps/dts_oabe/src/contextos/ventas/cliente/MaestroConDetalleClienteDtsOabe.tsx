import { TabAdicionalCliente } from "#/ventas/cliente/detalle/diseño.ts";
import { MaestroConDetalleCliente } from "#/ventas/cliente/maestro/MaestroConDetalleCliente.tsx";
import { TabPreciosArticulo } from "../precio_articulo/detalle/TabPreciosArticulo.tsx";

const tabsAdicionales: TabAdicionalCliente[] = [
    {
        id: "precios-articulo",
        label: "Precios por artículo",
        contenido: (cliente) => <TabPreciosArticulo clienteId={cliente.id} />,
    },
];

/**
 * Clientes de dts_oabe: el maestro-detalle de la base con la pestaña de
 * precios por artículo (`preciosarticulos`).
 */
export const MaestroConDetalleClienteDtsOabe = () => (
    <MaestroConDetalleCliente tabsAdicionales={tabsAdicionales} />
);
