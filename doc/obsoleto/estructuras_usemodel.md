# Estructuras para crear formularios y acciones

Vemos un ejemplo bastante complejo, las implementaciones reales seguramente serán simplificaciones sobre esto.

## Descripción
Las vistas de presupuesto, pedido, albarán, factura y venta TPV usan las funcionalidades de crear documento, indicando el cliente, y cambiar cliente.

El cliente puede ser registrado, con lo que necesita solo idCliente y idDireccion, o no registrado, con lo que necesita nombre, cif y datos de dirección.

En el caso de factura y venta TPV, el cliente registrado solo necesita idCliente, ya que su dirección es siempre la marcada como dirección de facturación.

## Estructura:

+ ventas
    + comun
        + componentes
            + moleculas
                + ClienteVenta
                    + ClienteVenta.tsx: Obtiene los datos del cliente registrado o no usando ClienteVentaNoRegistrado y ClienteVentaRegistrado para renderizar el formulario.
                    + ClienteVentaRegistrado.tsx: Renderiza los inputs de Cliente Registrado
                    + ClienteVentaNoRegistrado.tsx: Renderiza los inputs de Cliente No Registrado
                
                + AltaVenta `(por hacer)`: Usa un modelo que extiende de cliente registrado / no registrado, y utiliza ClienteVentaNoRegistrado y ClienteVentaRegistrado para renderizar parte del formulario.
    + factura

        + cliente_factura
            + ClienteFactura.tsx: Obtiene los datos del cliente registrado o no usando ClienteVentaNoRegistrado y ClienteFacturaRegistrado para renderizar el formulario.
            + ClienteFacturaRegistrado.tsx: Renderiza los inputs de Cliente Registrado para facturas

        + crear
            + CrearFactura.tsx: Usa AltaFactura para obtener los datos de la nueva factura (cliente e idEmpresa), la crea y emite la correspondiente señal.
            + AltaFactura.tsx: Usa un modelo que extiende de cliente registrado / no registrado, y utiliza ClienteVentaNoRegistrado y ClienteFacturaRegistrado para renderizar parte del formulario.

        + cambiar_cliente `(por hacer)`:
            + CambiarClienteFactura.tsx: Usa ClienteFactura para obtener los datos del cliente y los guarda, emitiendo la correspondiente señal.

    + albarán

        + crear `(por hacer)`:
            + CrearAlbaran.tsx: Usa AltaVenta para obtener los datos de la nueva factura (cliente e idEmpresa), la crea y emite la correspondiente señal.

        + cambiar_cliente `(por hacer)`:
            + CambiarClienteAlbaran.tsx: Usa ClienteVenta para obtener los datos del cliente y los guarda, emitiendo la correspondiente señal.

    + pedido, presupuesto `(por hacer)`: Igual que albarán

+ tpv
    + venta
        + cambiar_cliente
            + CambiarClienteVentaTpv.tsx: Usa ClienteFactura para obtener los datos del cliente y los guarda, emitiendo la correspondiente señal.