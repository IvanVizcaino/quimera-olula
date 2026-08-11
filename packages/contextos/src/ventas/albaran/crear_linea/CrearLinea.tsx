import { Articulo } from "#/ventas/comun/componentes/articulo.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { useFocus } from "@olula/lib/useFocus.js";
import { useForm } from "@olula/lib/useForm.js";
import { ProcesarEvento } from "@olula/lib/useMaquina.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback } from "react";
import { postLinea } from "../infraestructura.ts";
import "./CrearLinea.css";
import { metaNuevaLineaAlbaran, nuevaLineaAlbaranVacia } from "./dominio.ts";

export const CrearLinea = ({
  albaranId,
  publicar,
}: {
  albaranId: string;
  publicar: ProcesarEvento;
}) => {
  const { modelo, uiProps, valido } = useModelo(
    metaNuevaLineaAlbaran,
    nuevaLineaAlbaranVacia
  );
  const focus = useFocus();

  const crear_ = useCallback(async () => {
    await postLinea(albaranId, modelo);
    publicar("alta_linea_lista");
  }, [modelo, publicar, albaranId]);

  const cancelar_ = useCallback(
    () => publicar("crear_linea_cancelado"),
    [publicar]
  );

  const [crear, cancelar] = useForm(crear_, cancelar_);

  return (
    <QModal
      abierto={true}
      nombre="crear_linea_albaran"
      titulo="Crear línea"
      onCerrar={cancelar}
    >
      <div className="CrearLinea">
        <quimera-formulario>
          <Articulo
            {...uiProps("referencia", "descripcion")}
            nombre="referencia_nueva_linea_albaran"
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
