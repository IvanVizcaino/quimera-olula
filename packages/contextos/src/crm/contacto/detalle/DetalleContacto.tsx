import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { Detalle, QBoton, Tab, Tabs } from "@olula/componentes/index.js";
import { QuimeraAcciones } from "@olula/componentes/moleculas/qacciones.tsx";
import { EmitirEvento, Entidad } from "@olula/lib/diseño.js";
import { useModelo } from "@olula/lib/useModelo.js";
import { useEffect } from "react";
import { useParams } from "react-router";
import { BorrarContacto } from "../borrar/BorrarContacto.tsx";
import { Acciones } from "./acciones/Acciones.tsx";
import { contactoVacio, metaContacto } from "./detalle.ts";
import "./DetalleContacto.css";
import { getMaquina } from "./maquina.ts";
import { Oportunidades } from "./oportunidades/Oportunidades.tsx";
import { TabClientes } from "./tabs/TabClientes.tsx";
import { TabGeneral } from "./tabs/TabGeneral.tsx";

export const DetalleContacto = ({
  id,
  publicar,
}: {
  id?: string;
  publicar: EmitirEvento;
}) => {
  const params = useParams();

  const contactoId = id ?? params.id;
  const titulo = (contacto: Entidad) => contacto.nombre as string;

  const { ctx, emitir } = useMaquina(
    getMaquina,
    {
      estado: "INICIAL",
      contacto: contactoVacio,
    },
    publicar
  );

  const contacto = useModelo(metaContacto, ctx.contacto);
  const { modelo, modificado, valido } = contacto;

  useEffect(() => {
    if (contactoId) {
      emitir("contacto_id_cambiado", contactoId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contactoId]);

  return (
    <Detalle
      id={contactoId}
      obtenerTitulo={titulo}
      setEntidad={() => {}}
      entidad={modelo}
      cerrarDetalle={() => emitir("edicion_contacto_cancelada", null)}
    >
      {!!contactoId && (
        <div className="DetalleContacto">
          <QuimeraAcciones
            vertical
            acciones={[
              {
                texto: "Borrar",
                onClick: () => emitir("borrado_contacto_solicitado"),
                advertencia: true,
              },
            ]}
          />

          <Tabs>
            <Tab label="General">
              <TabGeneral contacto={contacto} />
            </Tab>

            <Tab label="Clientes">
              <TabClientes contacto={contacto} />
            </Tab>

            <Tab label="Oportunidades">
              <Oportunidades contacto={contacto} />
            </Tab>

            <Tab label="Acciones">
              <Acciones contacto={contacto} />
            </Tab>
          </Tabs>

          {modificado && (
            <div className="botones maestro-botones">
              <QBoton
                onClick={() => emitir("contacto_cambiado", modelo)}
                deshabilitado={!valido}
              >
                Guardar
              </QBoton>
              <QBoton
                tipo="reset"
                variante="texto"
                onClick={() => emitir("edicion_contacto_cancelada")}
              >
                Cancelar
              </QBoton>
            </div>
          )}
          {ctx.estado === "BORRANDO" && (
            <BorrarContacto publicar={emitir} contacto={modelo} />
          )}
        </div>
      )}
    </Detalle>
  );
};
