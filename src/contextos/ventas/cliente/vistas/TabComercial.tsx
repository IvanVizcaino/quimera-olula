import { useState } from "react";
import { QBoton } from "../../../../componentes/atomos/qboton.tsx";
import { QDate } from "../../../../componentes/atomos/qdate.tsx";
import { QInput } from "../../../../componentes/atomos/qinput.tsx";
import { QSelect } from "../../../../componentes/atomos/qselect.tsx";
import {
  Accion,
  entidadModificada,
  EstadoObjetoValor,
  puedoGuardarObjetoValor,
} from "../../../comun/dominio.ts";
import { opcionesTipoIdFiscal } from "../../../valores/idfiscal.ts";
import { Cliente } from "../diseño.ts";
import { getCliente, patchCliente } from "../infraestructura.ts";
import "./TabComercial.css";

interface TabComercialProps {
  getProps: (campo: string) => Record<string, unknown>;
  setCampo: (campo: string) => (valor: unknown) => void;
  cliente: EstadoObjetoValor<Cliente>;
  dispatch: (action: Accion<Cliente>) => void;
  onEntidadActualizada: (entidad: Cliente) => void;
}

export const TabComercial = ({
  getProps,
  setCampo,
  cliente,
  dispatch,
  onEntidadActualizada,
}: TabComercialProps) => {
  const [_, setGuardando] = useState<boolean>(false);

  const onGuardarClicked = async () => {
    setGuardando(true);
    await patchCliente(cliente.valor.id, cliente.valor);
    const cliente_guardado = await getCliente(cliente.valor.id);
    dispatch({ type: "init", payload: { entidad: cliente_guardado } });
    setGuardando(false);
    onEntidadActualizada(cliente.valor);
  };

  return (
    <div className="container">
      <div style={{ gridColumn: "span 12" }}>
        <QInput
          nombre="nombre"
          label="Nombre"
          onChange={setCampo("nombre")}
          {...getProps("nombre")}
        />
      </div>
      <div style={{ gridColumn: "span 12" }}>
        <QInput
          nombre="nombre_comercial"
          label="Nombre Comercial"
          onChange={setCampo("nombre_comercial")}
          {...getProps("nombre_comercial")}
        />
      </div>
      <div style={{ gridColumn: "span 1" }}>
        <QSelect
          nombre="tipo_id_fiscal"
          label="Tipo Id Fiscal"
          opciones={opcionesTipoIdFiscal}
          onChange={setCampo("tipo_id_fiscal")}
          {...getProps("tipo_id_fiscal")}
        />
      </div>
      <div style={{ gridColumn: "span 2" }}>
        <QInput
          nombre="id_fiscal"
          label="Id Fiscal"
          onChange={setCampo("id_fiscal")}
          {...getProps("id_fiscal")}
        />
      </div>
      <div style={{ gridColumn: "span 8" }}></div>
      <div style={{ gridColumn: "span 2" }}>
        <QInput
          nombre="agente_id"
          label="Agente"
          onChange={setCampo("agente_id")}
          {...getProps("agente_id")}
        />
      </div>
      <div style={{ gridColumn: "span 10" }}>
        <QInput
          nombre="nombre_agente"
          label="Nombre"
          {...getProps("nombre_agente")}
        />
      </div>
      <div style={{ gridColumn: "span 1" }}>
        <QInput
          nombre="divisa_id"
          label="Divisa"
          onChange={setCampo("divisa_id")}
          {...getProps("divisa_id")}
        />
      </div>
      <div style={{ gridColumn: "span 3" }}>
        <QDate
          nombre="fecha_baja"
          label="Fecha Baja"
          onChange={setCampo("fecha_baja")}
          {...getProps("fecha_baja")}
        />
      </div>
      {/* <div style={{ gridColumn: "span 3" }}>
        <QCheckbox
          label="De Baja"
          nombre="de_baja"
          onChange={setCampo("de_baja")}
          {...getProps("de_baja")}
        />
      </div> */}
      <div style={{ gridColumn: "span 5" }}></div>
      <div style={{ gridColumn: "span 12" }}>
        <div className="botones">
          <QBoton
            onClick={onGuardarClicked}
            deshabilitado={!puedoGuardarObjetoValor(cliente)}
          >
            Guardar
          </QBoton>
          <QBoton
            tipo="reset"
            variante="texto"
            onClick={() => {
              dispatch({
                type: "init",
                payload: { entidad: cliente.valor_inicial },
              });
            }}
            deshabilitado={!entidadModificada(cliente)}
          >
            Cancelar
          </QBoton>
        </div>
      </div>
    </div>
  );
};
