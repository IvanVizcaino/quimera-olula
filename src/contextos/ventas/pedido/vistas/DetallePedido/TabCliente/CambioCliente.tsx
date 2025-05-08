import { QBoton } from "../../../../../../componentes/atomos/qboton.tsx";
import { EmitirEvento } from "../../../../../comun/diseño.ts";
import { useModelo } from "../../../../../comun/useModelo.ts";
import { Cliente } from "../../../../comun/componentes/cliente.tsx";
import { DirCliente } from "../../../../comun/componentes/dirCliente.tsx";
import { cambioClientePedidoVacio, metaCambioClientePedido } from "../../../dominio.ts";
import "./CambioCliente.css";

export const CambioCliente = ({
  publicar = () => {},
}: {
  publicar?: EmitirEvento;
  
}) => {

  const {modelo, uiProps, valido} = useModelo(
    metaCambioClientePedido,
    cambioClientePedidoVacio
  );


  return (
    <>
      <h2>Cambiar cliente</h2>

      <quimera-formulario>
        <Cliente
          {...uiProps("cliente_id", "nombre_cliente")}
          nombre='cambiar_cliente_presupuesto'
        />
        <DirCliente
          clienteId={modelo.cliente_id}
          {...uiProps("direccion_id")}
        />
      </quimera-formulario>

      <div className="botones maestro-botones ">
        <QBoton
          onClick={() => publicar("CAMBIO_CLIENTE_LISTO", modelo)}
          deshabilitado={!valido}
        >
          Guardar
        </QBoton>
      </div>
    </>
  );
};
