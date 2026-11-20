import { Familia } from "#/almacen/comun/componentes/Familia.tsx";
import { PesoMedida } from "#/almacen/comun/componentes/PesoMedida.tsx";
import { TipoCodBarras } from "#/comun/componentes/tipoCodBarras.tsx";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QTextArea } from "@olula/componentes/atomos/qtextarea.tsx";
import { FormModelo, plugin } from "@olula/lib/dominio.ts";
import { Articulo } from "../diseño.ts";
// import { UsoArticulo } from "../UsoArticulo.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { ProveedoresArticulo } from "./proveedores/ProveedoresArticulo.tsx";
import "./TabGeneral.css";

export const TabGeneral = ({
  form,
  articulo,
  publicar,
}: {
  form: FormModelo;
  articulo: Articulo;
  publicar: EmitirEvento;
}) => {
  const { uiProps } = form;
  const sgaActivo = plugin("sga") === "activo";
  const pesosMedidasActivo = plugin("pesos_medidas") === "activo";
  
  return (
    <div className="TabGeneral">
      {/* <div className="uso">{UsoArticulo(articulo)}</div> */}
      <quimera-formulario>
        <QInput
          label="Referencia"
          nombre="id"
          valor={articulo.id}
          soloLectura
        />
        <QInput label="Descripción" {...uiProps("descripcion")} />
        <Familia {...uiProps("familiaId")} />
        {pesosMedidasActivo && <PesoMedida {...uiProps("unidadId")} />}
        <QInput label="Código de barras" {...uiProps("codbarras")} />
        <TipoCodBarras {...uiProps("tipoCodBarras")} />
        <QCheckbox label="No controla stock" {...uiProps("noStock")} />
        <QTextArea label="Observaciones" {...uiProps("observaciones")} />
        {
        sgaActivo && (
        <ProveedoresArticulo
          articulo={articulo}
          publicar={publicar}
        />
        )}
      </quimera-formulario>
    </div>
  );
};
