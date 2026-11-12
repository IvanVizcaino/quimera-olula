import { TipoIdFiscal } from "#/comun/componentes/tipoIdFiscal.tsx";
import { conEmpresaActual } from "#/valores/empresaActual.ts";
import { QAviso } from "@olula/componentes/atomos/qaviso.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useState } from "react";
import { getCliente, postCliente } from "../infraestructura.ts";
import "./CrearCliente.css";
import { metaNuevoCliente, nuevoClienteVacio } from "./dominio.ts";

interface CrearClienteProps {
  publicar?: EmitirEvento;
  onCancelar?: () => void;
}

export const CrearCliente = ({
  publicar = async () => {},
  onCancelar = () => {},
}: CrearClienteProps) => {
  /* Lazy initializer: referencia estable para useModelo y empresa ya puesta en el
     primer render. */
  const [inicial] = useState(() => conEmpresaActual(nuevoClienteVacio));
  const nuevoCliente = useModelo(metaNuevoCliente, inicial);

  const guardar_ = useCallback(async () => {
    const id = await postCliente(nuevoCliente.modelo);
    nuevoCliente.init(conEmpresaActual(nuevoClienteVacio));
    const clienteCreado = await getCliente(id);
    publicar("cliente_creado", clienteCreado);
    onCancelar();
  }, [nuevoCliente, publicar, onCancelar]);

  const cancelar_ = useCallback(() => onCancelar(), [onCancelar]);

  const [guardar, cancelar] = useForm(guardar_, cancelar_);

  return (
    <QModal
      abierto={true}
      nombre="crear_cliente"
      titulo="Nuevo Cliente"
      onCerrar={cancelar}
    >
      <>
        <quimera-formulario>
          <QInput
            label="Nombre"
            autoSeleccion={true}
            {...nuevoCliente.uiProps("nombre")}
          />
          <TipoIdFiscal {...nuevoCliente.uiProps("tipo_id_fiscal")} />
          <QInput label="ID Fiscal" {...nuevoCliente.uiProps("id_fiscal")} />
        </quimera-formulario>
        {!nuevoCliente.modelo.empresa_id && (
          <QAviso>
            Sin empresa activa. Selecciónala en la cabecera para poder guardar.
          </QAviso>
        )}
        <div className="botones">
          <QBoton
            onClick={guardar}
            deshabilitado={nuevoCliente.valido === false}
          >
            Guardar
          </QBoton>
          <QBoton tipo="reset" variante="texto" onClick={cancelar}>
            Cancelar
          </QBoton>
        </div>
      </>
    </QModal>
  );
};
