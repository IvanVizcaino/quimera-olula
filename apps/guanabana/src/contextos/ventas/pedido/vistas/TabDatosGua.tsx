import { Pedido } from "#/ventas/pedido/diseño.ts";
import { TabDatosBase } from "#/ventas/pedido/vistas/DetallePedido/TabDatos.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { HookModelo } from "@olula/lib/useModelo.ts";

export interface TabDatosProps {
  pedido: HookModelo<Pedido>;
}

export const TabDatosGua = ({ pedido }: TabDatosProps) => {
  const { uiProps } = pedido;

  return (
    <>
      <TabDatosBase pedido={pedido} />
      <quimera-formulario>
        <QInput label="Feria" {...uiProps("feria_id")} />
      </quimera-formulario>
    </>
  );
};
