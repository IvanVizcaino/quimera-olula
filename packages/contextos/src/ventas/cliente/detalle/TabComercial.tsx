import { Agente } from "#/ventas/comun/componentes/agente.tsx";
import { Divisa } from "#/ventas/comun/componentes/divisa.tsx";
import { FormaPago } from "#/ventas/comun/componentes/formapago.tsx";
import { GrupoIvaNegocio } from "#/ventas/comun/componentes/grupo_iva_negocio.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { ProcesarEvento } from "@olula/lib/useMaquina.js";
import { HookModelo } from "@olula/lib/useModelo.ts";
import { Cliente } from "../diseño.ts";
import "./TabComercial.css";

interface TabComercialProps {
  form: HookModelo<Cliente>;
  cliente: Cliente;
  emitirCliente: ProcesarEvento;
}

export const TabComercial = ({ form }: TabComercialProps) => {
  const { uiProps } = form;

  return (
    <div className="TabComercial">
      <quimera-formulario>
        <Agente
          {...uiProps("agente_id", "nombre_agente")}
          nombre="cliente/agente_id"
        />
        <QInput
          label="Serie"
          {...uiProps("serie_id")}
          nombre="cliente/serie_id"
        />
        <Divisa {...uiProps("divisa_id")} nombre="cliente/divisa_id" />
        <FormaPago
          {...uiProps("forma_pago_id", "nombre_forma_pago")}
          nombre="cliente/forma_pago_id"
        />
        <GrupoIvaNegocio
          label="Grupo IVA"
          {...uiProps("grupo_iva_negocio_id")}
          nombre="cliente/grupo_iva_negocio_id"
        />
      </quimera-formulario>
    </div>
  );
};
