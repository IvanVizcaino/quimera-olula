import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { listaEntidadesInicial } from "@olula/lib/ListaEntidades.js";
import { useEffect } from "react";
import { Cliente, CuentaBanco } from "../../diseño.ts";
import { BorrarCuentaBanco } from "./BorrarCuentaBanco.tsx";
import { CrearCuentaBanco } from "./CrearCuentaBanco.tsx";
import { EdicionCuentaBanco } from "./EdicionCuentaBanco.tsx";
import { SeleccionarRemesa } from "./SeleccionarRemesa.tsx";
import { getMaquina } from "./maquina.ts";
import { TabCuentasBancoLista } from "./TabCuentasBancoLista.tsx";

export const TabCuentasBanco = ({
  cliente,
  publicar,
}: {
  cliente: Cliente;
  publicar: EmitirEvento;
}) => {
  const clienteId = cliente.id;

  const { ctx, emitir } = useMaquina(
    getMaquina,
    {
      estado: "lista",
      cuentas: listaEntidadesInicial<CuentaBanco>(),
      cargando: true,
      clienteId,
    },
    publicar
  );

  useEffect(() => {
    if (clienteId) emitir("cargar_cuentas", clienteId, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clienteId]);

  const estado = ctx.estado;

  const acciones = [
    {
      texto: "Desmarcar domiciliación",
      onClick: () => emitir("desmarcar_domiciliacion"),
    },
    {
      texto: "Cuenta de domiciliación",
      onClick: () => emitir("domiciliar_solicitada"),
      deshabilitado: !ctx.cuentas.activo,
    },
    {
      icono: "eliminar",
      texto: "Borrar",
      advertencia: true,
      onClick: () => emitir("borrado_solicitado"),
      deshabilitado: !ctx.cuentas.activo,
    },
  ];

  return (
    <div className="CuentasBanco">
      <TabCuentasBancoLista
        clienteId={clienteId}
        cuentas={ctx.cuentas.lista}
        seleccionada={ctx.cuentas.activo}
        emitir={emitir}
        cargando={ctx.cargando}
        cuentaDomiciliadaId={cliente.cuenta_domiciliada ?? ""}
        acciones={acciones}
        descripcionCuentaRemesa={cliente.descripcion_cuenta_remesa ?? ""}
        onSeleccionarRemesa={() => emitir("seleccionar_remesa_solicitada")}
      />
      <QModal
        nombre="altaCuentaBanco"
        abierto={estado === "alta"}
        onCerrar={() => emitir("alta_cancelada")}
      >
        <CrearCuentaBanco clienteId={clienteId} emitir={emitir} />
      </QModal>

      <QModal
        nombre="edicionCuentaBanco"
        abierto={estado === "edicion"}
        onCerrar={() => emitir("edicion_cancelada")}
      >
        {ctx.cuentas.activo && (
          <EdicionCuentaBanco
            clienteId={clienteId}
            cuenta={ctx.cuentas.activo}
            emitir={emitir}
          />
        )}
      </QModal>

      {ctx.cuentas.activo && (
        <BorrarCuentaBanco
          clienteId={clienteId}
          cuenta={ctx.cuentas.activo}
          abierto={estado === "confirmar_borrado"}
          emitir={emitir}
        />
      )}

      <QModal
        nombre="seleccionarRemesa"
        abierto={estado === "remesa"}
        titulo="Cuenta de remesa"
        onCerrar={() => emitir("remesa_cancelada")}
      >
        <SeleccionarRemesa
          cuentaRemesaId={cliente.cuenta_remesa ?? ""}
          descripcionCuentaRemesa={cliente.descripcion_cuenta_remesa ?? ""}
          emitir={emitir}
        />
      </QModal>
    </div>
  );
};
