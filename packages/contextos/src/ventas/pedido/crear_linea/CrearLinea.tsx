import { Articulo } from "#/ventas/comun/componentes/articulo.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { FactoryCtx } from "@olula/lib/factory_ctx.js";
import { useFocus } from "@olula/lib/useFocus.js";
import { useForm } from "@olula/lib/useForm.js";
import { ProcesarEvento } from "@olula/lib/useMaquina.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useContext } from "react";
import { postLinea } from "../infraestructura.ts";
import "./CrearLinea.css";
import { metaNuevaLinea, nuevaLineaVacia } from "./dominio.ts";

export type CrearLineaProps = {
  pedidoId: string;
  publicar: ProcesarEvento;
};

export const CrearLinea = (props: CrearLineaProps) => {
  const { app } = useContext(FactoryCtx);
  const CrearLinea_ = app.Ventas.pedido_CrearLinea as typeof CrearLineaBase;

  return CrearLinea_(props);
};

export const CrearLineaBase = ({ pedidoId, publicar }: CrearLineaProps) => {
  const { modelo, uiProps, valido } = useModelo(
    metaNuevaLinea,
    nuevaLineaVacia
  );
  const focus = useFocus();

  const crear_ = useCallback(async () => {
    await postLinea(pedidoId, modelo);
    publicar("alta_linea_lista");
  }, [modelo, publicar, pedidoId]);

  const cancelar_ = useCallback(
    () => publicar("crear_linea_cancelado"),
    [publicar]
  );

  const [crear, cancelar] = useForm(crear_, cancelar_);

  return (
    <QModal
      abierto={true}
      nombre="crear_linea_pedido"
      titulo="Crear línea"
      onCerrar={cancelar}
    >
      <div className="CrearLinea">
        <quimera-formulario>
          <Articulo
            {...uiProps("referencia", "descripcion")}
            nombre="referencia_nueva_linea_pedido"
            ref={focus}
          />
          <QInput label="Cantidad" {...uiProps("cantidad")} />
        </quimera-formulario>
        <div className="botones">
          <QBoton onClick={crear} deshabilitado={!valido}>
            Crear
          </QBoton>
        </div>
      </div>
    </QModal>
  );
};
