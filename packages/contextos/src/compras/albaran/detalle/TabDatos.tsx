import { Almacen } from "#/almacen/comun/componentes/Almacen.tsx";
import { Divisa } from "#/comun/componentes/divisa.tsx";
import { BotonCambiar } from "#/ventas/comun/componentes/BotonCambiar.tsx";
import { FormaPago } from "#/comun/componentes/formapago.tsx";
import { GrupoIvaNegocio } from "#/comun/componentes/grupo_iva_negocio.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { HookModelo } from "@olula/lib/useModelo.ts";
import { Albaran } from "../diseño.ts";
import { albaranFacturado } from "../dominio.ts";
import "./TabDatos.css";

export const TabDatos = ({
  form,
  publicar,
}: {
  form: HookModelo<Albaran>;
  publicar: EmitirEvento;
}) => {
  const { uiProps, modelo } = form;
  const puedeCambiarDivisa = !albaranFacturado(modelo);

  return (
    <div className="TabDatos">
      <quimera-formulario>
        <Almacen
          {...uiProps("almacenId", "nombreAlmacen")}
          nombre="almacenId"
        />
        <Divisa {...uiProps("divisaId")} nombre="divisaId" />
        <QInput label="T. Conversión" {...uiProps("tasaConversion")} />
        {puedeCambiarDivisa && (
          <div className="TabDatos-accion">
            <BotonCambiar
              titulo="Cambiar divisa y tasa de conversión"
              onClick={() => publicar("cambio_divisa_solicitado")}
            />
          </div>
        )}
        <FormaPago
          {...uiProps("formaPagoId", "nombreFormaPago")}
          nombre="formaPagoId"
        />
        <GrupoIvaNegocio
          {...uiProps("grupoIvaNegocioId")}
          nombre="grupoIvaNegocioId"
        />
        {/* Solo lectura: la serie se fija al crear el documento (ver metaAlbaran). */}
        <QInput label="Serie" {...uiProps("serieId")} />
      </quimera-formulario>
    </div>
  );
};
