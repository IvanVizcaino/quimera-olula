import { TabCrmContactos } from "#/ventas/cliente/detalle/crm_contactos/TabCrmContactos.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { Detalle, QBoton, Tab, Tabs } from "@olula/componentes/index.js";
import { QuimeraAcciones } from "@olula/componentes/moleculas/qacciones.tsx";
import { EmitirEvento, Entidad } from "@olula/lib/diseño.js";
import { useModelo } from "@olula/lib/useModelo.js";
import { useEffect } from "react";
import { useParams } from "react-router";
import { BorrarCliente } from "../borrar/BorrarCliente.tsx";
import { Acciones } from "./acciones/Acciones.tsx";
import { clienteVacio, metaCliente } from "./detalle.ts";
import "./DetalleCliente.css";
import { getMaquina } from "./maquina.ts";
import { Oportunidades } from "./oportunidades/Oportunidades.tsx";
import { TabGeneral } from "./tabs/TabGeneral.tsx";

export const DetalleCliente = ({
  id,
  publicar,
}: {
  id?: string;
  publicar: EmitirEvento;
}) => {
  const params = useParams();

  const clienteId = id ?? params.id;
  const titulo = (cliente: Entidad) => cliente.nombre as string;

  const { ctx, emitir } = useMaquina(
    getMaquina,
    {
      estado: "INICIAL",
      cliente: clienteVacio,
    },
    publicar
  );

  const cliente = useModelo(metaCliente, ctx.cliente);
  const { modelo, modificado, valido } = cliente;

  useEffect(() => {
    if (clienteId) {
      emitir("cliente_id_cambiado", clienteId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clienteId]);

  return (
    <Detalle
      id={clienteId}
      obtenerTitulo={titulo}
      setEntidad={() => {}}
      entidad={modelo}
      cerrarDetalle={() => emitir("edicion_cliente_cancelada", null)}
    >
      {!!clienteId && (
        <div className="DetalleCliente">
          <QuimeraAcciones
            vertical
            acciones={[
              {
                texto: "Borrar",
                onClick: () => emitir("borrado_cliente_solicitado"),
                advertencia: true,
              },
            ]}
          />

          <Tabs>
            <Tab label="General">
              <TabGeneral cliente={cliente} emitir={publicar} />
            </Tab>

            <Tab label="Contactos">
              <TabCrmContactos clienteId={clienteId} />
            </Tab>

            <Tab label="Oportunidades">
              <Oportunidades cliente={cliente} />
            </Tab>

            <Tab label="Acciones">
              <Acciones cliente={cliente} />
            </Tab>
          </Tabs>

          {modificado && (
            <div className="botones maestro-botones">
              <QBoton
                onClick={() => emitir("cliente_cambiado", modelo)}
                deshabilitado={!valido}
              >
                Guardar
              </QBoton>
              <QBoton
                tipo="reset"
                variante="texto"
                onClick={() => emitir("edicion_cliente_cancelada")}
              >
                Cancelar
              </QBoton>
            </div>
          )}
          {ctx.estado === "BORRANDO" && (
            <BorrarCliente publicar={emitir} cliente={modelo} />
          )}
        </div>
      )}
    </Detalle>
  );
};
