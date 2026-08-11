import { Articulo } from "#/ventas/comun/componentes/articulo.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useFocus } from "@olula/lib/useFocus.js";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback } from "react";
import { postLinea } from "../infraestructura.ts";
import "./CrearLinea.css";
import { metaNuevaLinea, nuevaLineaVacia } from "./dominio.ts";

export const CrearLinea = ({
  presupuestoId,
  publicar,
}: {
  presupuestoId: string;
  publicar: EmitirEvento;
}) => {
  const { modelo, uiProps, valido } = useModelo(
    metaNuevaLinea,
    nuevaLineaVacia
  );
  const focus = useFocus();

  const crear_ = useCallback(async () => {
    const idLinea = await postLinea(presupuestoId, modelo);
    publicar("linea_creada", idLinea);
  }, [modelo, publicar, presupuestoId]);

  const cancelar_ = useCallback(
    () => publicar("crear_linea_cancelado"),
    [publicar]
  );

  const [crear, cancelar] = useForm(crear_, cancelar_);

  return (
    <QModal
      abierto={true}
      nombre="crear_linea_presupuesto"
      titulo="Crear línea"
      onCerrar={cancelar}
    >
      <div className="CrearLinea">
        <quimera-formulario>
          <Articulo
            {...uiProps("referencia", "descripcion")}
            nombre="referencia_nueva_linea_presupuesto"
            ref={focus}
          />
          <QInput label="Cantidad" {...uiProps("cantidad")} />
        </quimera-formulario>
        <div className="botones maestro-botones ">
          <QBoton onClick={crear} deshabilitado={!valido}>
            Crear
          </QBoton>
        </div>
      </div>
    </QModal>
  );
};
