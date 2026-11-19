import { Cliente } from "#/ventas/comun/componentes/cliente.tsx";
import { DirCliente } from "#/ventas/comun/componentes/dirCliente.tsx";
import { ModeloClienteVentaRegistrado } from "#/ventas/comun/componentes/moleculas/ClienteVenta/cliente_venta";
import { HookModelo } from "@olula/lib/useModelo.js";

export const ClienteVentaRegistrado = <T extends ModeloClienteVentaRegistrado>({
  cliente,
}: {
  cliente: HookModelo<T>;
}) => {
  const { modelo, uiProps } = cliente;

  return (
    <>
      <Cliente
        {...uiProps("idCliente", "nombre")}
        nombre="cambiar_cliente_presupuesto"
        avisarObservaciones
      />
      <DirCliente clienteId={modelo.idCliente} {...uiProps("idDireccion")} />
    </>
  );
};
