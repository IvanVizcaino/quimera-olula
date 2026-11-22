import { useAplicarImpuestoDefecto } from "#/almacen/config/useImpuestoDefecto.ts";
import { GrupoIvaProducto } from "#/ventas/comun/componentes/grupo_iva_producto.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useFocus } from "@olula/lib/useFocus.ts";
import { useForm } from "@olula/lib/useForm.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo } from "react";
import { postArticulo } from "../infraestructura.ts";
import { metaNuevoArticulo, nuevoArticuloInicial } from "./crear.ts";

export const CrearArticulo = ({ publicar }: { publicar: EmitirEvento }) => {
  const inicial = useMemo(nuevoArticuloInicial, []);

  const formulario = useModelo(metaNuevoArticulo, inicial);
  const { modelo: articulo, uiProps, valido } = formulario;
  useAplicarImpuestoDefecto(formulario, "grupoIvaProductoId", "articulo");

  const crear_ = useCallback(async () => {
    const id = await postArticulo(articulo);
    publicar("articulo_creado", id);
  }, [articulo, publicar]);

  const cancelar_ = useCallback(
    () => publicar("alta_de_articulo_cancelada"),
    [publicar]
  );

  const [crear, cancelar] = useForm(crear_, cancelar_);
  const focus = useFocus();

  return (
    <QModal
      abierto={true}
      nombre="crearArticulo"
      titulo="Crear artículo"
      onCerrar={cancelar}
    >
      <div className="CrearArticulo">
        <quimera-formulario>
          <QInput label="Referencia" {...uiProps("id")} ref={focus} />
          <QInput label="Descripción" {...uiProps("descripcion")} />
          <GrupoIvaProducto {...uiProps("grupoIvaProductoId")} />
        </quimera-formulario>
        <div className="botones maestro-botones">
          <QBoton onClick={crear} deshabilitado={!valido}>
            Crear
          </QBoton>
        </div>
      </div>
    </QModal>
  );
};
