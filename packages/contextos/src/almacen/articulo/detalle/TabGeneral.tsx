import { Familia } from "#/almacen/comun/componentes/Familia.tsx";
import { SubfamiliaSelector } from "#/almacen/comun/componentes/Subfamilia.tsx";
import { UnidadMedidaSelector } from "#/almacen/comun/componentes/UnidadMedida.tsx";
import { TipoCodBarras } from "#/comun/componentes/tipoCodBarras.tsx";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QTextArea } from "@olula/componentes/atomos/qtextarea.tsx";
import { FormModelo, plugin } from "@olula/lib/dominio.ts";
import { pluginActivo } from "@olula/lib/plugins.tsx";
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
  const conSubfamilias = pluginActivo("subfamilias");
  const conPesosMedidas = pluginActivo("pesos_medidas");
  const conDisponible = pluginActivo("disponible_art");
  
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
        {conSubfamilias && (
          <SubfamiliaSelector
            {...uiProps("subfamiliaId")}
            familiaId={articulo.familiaId}
            nombre="subfamilia_id"
            label="Subfamilia"
          />
        )}
        {conPesosMedidas && (
          <UnidadMedidaSelector
            {...uiProps("unidadId")}
            nombre="unidad_id"
            label="Unidad de medida"
          />
        )}
        <QInput label="Código de barras" {...uiProps("codbarras")} />
        <TipoCodBarras {...uiProps("tipoCodBarras")} />
        <QCheckbox label="No controla stock" {...uiProps("noStock")} />
        {conDisponible && (
          <QInput
            label="Disponible"
            nombre="total_disponible"
            valor={String(articulo.totalDisponible ?? 0)}
            soloLectura
          />
        )}
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
