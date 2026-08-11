import { EstadoOportunidad } from "#/crm/comun/componentes/estado_oportunidad_venta.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { HookModelo } from "@olula/lib/useModelo.ts";
import { OportunidadVenta } from "../../diseño.ts";
import "./TabDatos.css";

export const TabDatos = ({
  oportunidad,
}: {
  oportunidad: HookModelo<OportunidadVenta>;
}) => {
  const { uiProps, modelo } = oportunidad;
  const tieneCliente = Boolean(modelo.cliente_id);
  const tieneTarjeta = Boolean(modelo.tarjeta_id);
  const tieneContacto = Boolean(modelo.contacto_id);

  return (
    <div className="TabDatos">
      <quimera-formulario>
        <QInput label="Descripción" {...uiProps("descripcion")} />

        {tieneCliente && (
          <QInput
            label="Cliente"
            nombre="cliente"
            soloTexto
            valor={modelo.nombre_cliente ?? modelo.cliente_id ?? ""}
          />
        )}

        {tieneTarjeta && (
          <QInput
            label="Lead"
            nombre="lead"
            soloTexto
            valor={
              modelo.nombre_cliente ??
              modelo.nombre_tarjeta ??
              modelo.tarjeta_id ??
              ""
            }
          />
        )}

        {tieneContacto && (
          <QInput
            label="Contacto"
            nombre="contacto"
            soloTexto
            valor={modelo.nombre_contacto ?? modelo.contacto_id ?? ""}
          />
        )}

        <EstadoOportunidad label="Estado" {...uiProps("estado_id")} />

        <QInput label="Probabilidad (%)" {...uiProps("probabilidad")} />
        <QInput label="Fecha Cierre" {...uiProps("fecha_cierre")} />
        <QInput label="Total" {...uiProps("importe")} />
      </quimera-formulario>
    </div>
  );
};
