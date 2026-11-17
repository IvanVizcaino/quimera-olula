import { ClaseAlmacenamiento } from "#/almacen/comun/componentes/ClaseAlmacenamiento.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { FormModelo } from "@olula/lib/dominio.ts";
import { ListaPickingFijoArticulo } from "./ListaPickingFijoArticulo.tsx";
import "./TabAlmacenaje.css";

export const TabAlmacenaje = ({ form, articuloId }: { form: FormModelo; articuloId: string }) => {
  const { uiProps } = form;

  return (
    <div className="TabAlmacenaje">
      <quimera-formulario>
        <ClaseAlmacenamiento {...uiProps("claseAlmacenamientoId")} />
        <QInput label="Largo (m)" {...uiProps("largo")} />
        <QInput label="Ancho (m)" {...uiProps("ancho")} />
        <QInput label="Alto (m)" {...uiProps("alto")} />
      </quimera-formulario>
      <ListaPickingFijoArticulo articuloId={articuloId} />
    </div>
  );
};
