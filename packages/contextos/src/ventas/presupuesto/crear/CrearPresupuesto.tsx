import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useFocus } from "@olula/lib/useFocus.js";
import { useForm } from "@olula/lib/useForm.js";
import { HookModelo, useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useState } from "react";
import { Cliente } from "../../comun/componentes/cliente.tsx";
import { DirCliente } from "../../comun/componentes/dirCliente.tsx";
import {
  NuevoPresupuesto,
  NuevoPresupuestoClienteNoRegistrado,
} from "../diseño.ts";
import { getPresupuesto, postPresupuesto } from "../infraestructura.ts";
import "./CrearPresupuesto.css";
import {
  metaNuevoPresupuesto,
  metaNuevoPresupuestoClienteNoRegistrado,
  nuevoPresupuestoClienteNoRegistradoVacio,
  nuevoPresupuestoVacio,
} from "./crear.ts";

export const CrearPresupuesto = ({
  publicar = async () => {},
  onCancelar = () => {},
  modeloVacio = nuevoPresupuestoVacio,
}: {
  publicar?: EmitirEvento;
  onCancelar?: () => void;
  modeloVacio?: NuevoPresupuesto;
}) => {
  const [modoNoRegistrado, setModoNoRegistrado] = useState(false);
  const presupuestoRegistrado = useModelo(metaNuevoPresupuesto, modeloVacio);
  const presupuestoNoRegistrado = useModelo(
    metaNuevoPresupuestoClienteNoRegistrado,
    nuevoPresupuestoClienteNoRegistradoVacio
  );

  const toggleModoCliente = () => {
    const nuevoModo = !modoNoRegistrado;
    setModoNoRegistrado(nuevoModo);

    presupuestoRegistrado.init(modeloVacio);
    presupuestoNoRegistrado.init(nuevoPresupuestoClienteNoRegistradoVacio);
  };

  const cancelar = () => {
    presupuestoRegistrado.init(modeloVacio);
    presupuestoNoRegistrado.init(nuevoPresupuestoClienteNoRegistradoVacio);
    setModoNoRegistrado(false);
    onCancelar();
  };

  return (
    <QModal
      abierto={true}
      nombre="crear_presupuesto"
      titulo="Nuevo Presupuesto"
      onCerrar={cancelar}
    >
      <FormAltaPresupuesto
        publicar={publicar}
        presupuestoRegistrado={presupuestoRegistrado}
        presupuestoNoRegistrado={presupuestoNoRegistrado}
        modoNoRegistrado={modoNoRegistrado}
        modeloVacio={modeloVacio}
        onToggleModoCliente={toggleModoCliente}
      />
    </QModal>
  );
};

const FormAltaPresupuesto = ({
  publicar = async () => {},
  presupuestoRegistrado,
  presupuestoNoRegistrado,
  modoNoRegistrado,
  onToggleModoCliente,
  modeloVacio,
}: {
  publicar?: EmitirEvento;
  presupuestoRegistrado: HookModelo<NuevoPresupuesto>;
  presupuestoNoRegistrado: HookModelo<NuevoPresupuestoClienteNoRegistrado>;
  modoNoRegistrado: boolean;
  modeloVacio: NuevoPresupuesto;
  onToggleModoCliente: () => void;
}) => {
  const focus = useFocus();

  const crear_ = useCallback(async () => {
    let modelo;

    if (modoNoRegistrado) {
      modelo = { ...presupuestoNoRegistrado.modelo };
    } else {
      modelo = { ...presupuestoRegistrado.modelo };
    }

    const id = await postPresupuesto(modelo);
    const presupuestoCreada = await getPresupuesto(id);
    publicar("presupuesto_creado", presupuestoCreada);

    presupuestoRegistrado.init(modeloVacio);
    presupuestoNoRegistrado.init(nuevoPresupuestoClienteNoRegistradoVacio);
  }, [
    modoNoRegistrado,
    presupuestoNoRegistrado,
    presupuestoRegistrado,
    publicar,
    modeloVacio,
  ]);

  const cancelar_ = useCallback(() => {
    publicar("creacion_presupuesto_cancelada");
    presupuestoRegistrado.init(modeloVacio);
    presupuestoNoRegistrado.init(nuevoPresupuestoClienteNoRegistradoVacio);
  }, [publicar, presupuestoRegistrado, presupuestoNoRegistrado, modeloVacio]);

  const [crear, cancelar] = useForm(crear_, cancelar_);

  return (
    <>
      <div className="modo-cliente">
        <QBoton onClick={onToggleModoCliente} variante="texto" tipo="button">
          {modoNoRegistrado ? "Cliente no registrado" : "Cliente registrado"}
        </QBoton>
      </div>
      <quimera-formulario>
        {modoNoRegistrado ? (
          <>
            <QInput
              label="Nombre del Cliente"
              {...presupuestoNoRegistrado.uiProps("nombre_cliente")}
              ref={focus}
            />
            <QInput
              label="ID Fiscal"
              {...presupuestoNoRegistrado.uiProps("id_fiscal")}
            />

            <QInput
              label="Tipo de Vía"
              {...presupuestoNoRegistrado.uiProps("tipo_via")}
            />
            <QInput
              label="Nombre de la Vía"
              {...presupuestoNoRegistrado.uiProps("nombre_via")}
            />
            <QInput
              label="Ciudad"
              {...presupuestoNoRegistrado.uiProps("ciudad")}
            />
          </>
        ) : (
          <>
            <Cliente
              {...presupuestoRegistrado.uiProps("cliente_id", "nombre")}
              nombre="clientePresupuesto"
              ref={focus}
            />
            <DirCliente
              clienteId={presupuestoRegistrado.modelo.cliente.cliente_id}
              {...presupuestoRegistrado.uiProps("direccion_id")}
            />
          </>
        )}
      </quimera-formulario>
      <div className="botones">
        <QBoton onClick={crear} deshabilitado={!presupuestoRegistrado.valido}>
          Guardar
        </QBoton>
        <QBoton onClick={cancelar} variante="texto">
          Cancelar
        </QBoton>
      </div>
    </>
  );
};
