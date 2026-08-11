import { ContactoSelector } from "#/ventas/comun/componentes/contacto.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { useEffect, useState } from "react";
import { CrearCrmContactos } from "./CrearCrmContactos.tsx";
import { EdicionCrmContactos } from "./EdicionCrmContactos.tsx";
import { TabCrmContactosLista } from "./TabCrmContactosLista.tsx";
import { getMaquina } from "./maquina.ts";

export const TabCrmContactos = ({ clienteId }: { clienteId: string }) => {
  const { ctx, emitir } = useMaquina(getMaquina, {
    estado: "lista",
    contactos: [],
    contactoActivo: null,
    cargando: true,
    clienteId,
  });

  useEffect(() => {
    if (clienteId) emitir("cargar_contactos", clienteId, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clienteId]);

  const estado = ctx.estado;
  const [contactoSeleccionado, setContactoSeleccionado] = useState<{
    valor: string;
    descripcion: string;
  } | null>(null);

  const acciones = [
    {
      texto: "Asociar Contacto",
      onClick: () => emitir("asociar_solicitado"),
    },
    {
      texto: "Eliminar asociación",
      onClick: () => emitir("eliminar_asociacion"),
      deshabilitado: !ctx.contactoActivo,
    },
    {
      icono: "eliminar",
      texto: "Borrar",
      advertencia: true,
      onClick: () => emitir("borrado_solicitado"),
      deshabilitado: !ctx.contactoActivo,
    },
  ];

  return (
    <div className="CrmContactos">
      <>
        <TabCrmContactosLista
          contactos={ctx.contactos}
          seleccionado={ctx.contactoActivo}
          emitir={emitir}
          cargando={ctx.cargando}
          acciones={acciones}
        />
      </>

      <QModalConfirmacion
        nombre="confirmacionBorrarContacto"
        abierto={estado === "confirmar_borrado"}
        titulo="Confirmar borrar"
        mensaje="¿Está seguro de que desea borrar este contacto?"
        onCerrar={() => emitir("borrado_cancelado")}
        onAceptar={() => emitir("borrado_confirmado")}
      />

      <QModalConfirmacion
        nombre="confirmacionEliminarAsociacion"
        abierto={estado === "confirmar_eliminar_asociacion"}
        titulo="Confirmar eliminación de asociación"
        mensaje="¿Está seguro de que desea eliminar la asociación de este contacto?"
        onCerrar={() => emitir("eliminacion_cancelada")}
        onAceptar={() => emitir("eliminacion_solicitada")}
      />

      <QModal
        nombre="altaCrmContacto"
        abierto={estado === "alta"}
        onCerrar={() => emitir("alta_cancelada")}
        titulo="Nuevo Contacto CRM"
      >
        <CrearCrmContactos emitir={emitir} />
      </QModal>

      <QModal
        nombre="edicionCrmContacto"
        abierto={estado === "edicion"}
        onCerrar={() => emitir("edicion_cancelada")}
        titulo="Editar Contacto CRM"
      >
        {ctx.contactoActivo && (
          <EdicionCrmContactos contacto={ctx.contactoActivo} emitir={emitir} />
        )}
      </QModal>

      <QModal
        nombre="asociarCrmContacto"
        abierto={estado === "asociar"}
        onCerrar={() => emitir("asociacion_cancelada")}
        titulo="Asociar Contacto"
      >
        <ContactoSelector
          valor={contactoSeleccionado?.valor || ""}
          descripcion=""
          nombre="cliente/contacto_id"
          label="Seleccionar contacto"
          onChange={(contacto) => setContactoSeleccionado(contacto)}
        />
        <div className="botones">
          <QBoton
            onClick={() => {
              if (contactoSeleccionado) {
                emitir("vinculacion_solicitada", contactoSeleccionado.valor);
              }
            }}
            deshabilitado={!contactoSeleccionado}
          >
            Guardar
          </QBoton>
          <QBoton
            tipo="reset"
            variante="texto"
            onClick={() => emitir("asociacion_cancelada")}
          >
            Cancelar
          </QBoton>
        </div>
      </QModal>
    </div>
  );
};
