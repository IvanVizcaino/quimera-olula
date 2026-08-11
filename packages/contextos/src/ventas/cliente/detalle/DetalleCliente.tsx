import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { QuimeraAcciones } from "@olula/componentes/moleculas/qacciones.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useModelo } from "@olula/lib/useModelo.js";
import { useCallback, useEffect } from "react";
import { useParams } from "react-router";
import { BorrarCliente } from "../borrar/BorrarCliente.tsx";
import { BajaCliente } from "../dar_de_baja/BajaCliente.tsx";
import { Cliente } from "../diseño.ts";
import { TabCrmContactos } from "./crm_contactos/TabCrmContactos.tsx";
import { TabCuentasBanco } from "./cuentas_banco/TabCuentasBanco.tsx";
import "./DetalleCliente.css";
import { TabDirecciones } from "./direcciones/TabDirecciones.tsx";
import { clienteVacio, metaCliente } from "./dominio.ts";
import { getMaquina } from "./maquina.ts";
import { TabComercial } from "./TabComercial.tsx";
import { TabGeneral } from "./TabGeneral.tsx";

export const DetalleCliente = ({
  id,
  publicar = async () => {},
}: {
  id?: string;
  publicar?: EmitirEvento;
}) => {
  const params = useParams();
  const clienteId = id ?? params.id;

  const { ctx, emitir } = useMaquina(
    getMaquina,
    {
      estado: "INICIAL",
      cliente: clienteVacio(),
      clienteInicial: clienteVacio(),
    },
    publicar
  );

  const autoGuardar = useCallback(
    async (modelo: Cliente) => {
      emitir("edicion_de_cliente_lista", modelo);
    },
    [emitir]
  );

  const cliente = useModelo(metaCliente, ctx.cliente, autoGuardar);

  useEffect(() => {
    emitir("cliente_id_cambiado", clienteId, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clienteId]);

  const { estado } = ctx;

  const titulo = (cliente: Cliente) => cliente.nombre as string;

  if (!ctx.cliente.id) return;

  return (
    <div className="DetalleCliente">
      <Detalle
        id={ctx.cliente.id}
        obtenerTitulo={titulo}
        setEntidad={() => {}}
        entidad={ctx.cliente}
        cerrarDetalle={() => emitir("cliente_deseleccionado", null)}
      >
        {!!ctx.cliente.id && (
          <div className="DetalleCliente-contenido">
            <div className="maestro-botones">
              <QuimeraAcciones
                acciones={[
                  {
                    icono: "eliminar",
                    texto: "Borrar",
                    onClick: () => emitir("borrado_solicitado"),
                    advertencia: true,
                  },
                  ...(!ctx.cliente.de_baja
                    ? [
                        {
                          texto: "Dar de baja",
                          onClick: () => emitir("baja_solicitada"),
                        },
                      ]
                    : [
                        {
                          texto: "Dar de alta",
                          onClick: () => emitir("dar_de_alta_solicitado"),
                        },
                      ]),
                ]}
                vertical
              />
            </div>
            <Tabs
              children={[
                <Tab
                  key="tab-1"
                  label="General"
                  children={
                    <TabGeneral
                      form={cliente}
                      cliente={ctx.cliente}
                      emitirCliente={emitir}
                      recargarCliente={() =>
                        emitir("cliente_id_cambiado", ctx.cliente.id)
                      }
                    />
                  }
                />,
                <Tab
                  key="tab-2"
                  label="Comercial"
                  children={
                    <TabComercial
                      form={cliente}
                      cliente={ctx.cliente}
                      emitirCliente={emitir}
                    />
                  }
                />,
                <Tab
                  key="tab-3"
                  label="Direcciones"
                  children={<TabDirecciones clienteId={ctx.cliente.id} />}
                />,
                <Tab
                  key="tab-4"
                  label="Cuentas Bancarias"
                  children={
                    <TabCuentasBanco cliente={ctx.cliente} publicar={emitir} />
                  }
                />,
                <Tab
                  key="tab-5"
                  label="Agenda"
                  children={
                    <div className="detalle-cliente-tab-contenido">
                      <TabCrmContactos clienteId={ctx.cliente.id} />
                    </div>
                  }
                />,
              ]}
            />
            {estado === "BORRANDO_CLIENTE" && (
              <BorrarCliente
                clienteId={ctx.cliente.id}
                clienteNombre={ctx.cliente.nombre as string}
                publicar={emitir}
                onCancelar={() => emitir("borrado_cancelado")}
              />
            )}

            <QModal
              nombre="modal-baja"
              abierto={estado === "BAJANDO_CLIENTE"}
              titulo="Dar de baja"
              onCerrar={() => emitir("baja_cancelada")}
            >
              <BajaCliente clienteId={ctx.cliente.id} publicar={emitir} />
            </QModal>
          </div>
        )}
      </Detalle>
    </div>
  );
};
