import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { ClienteVentaNoRegistrado } from "@olula/ctx/ventas/comun/componentes/moleculas/ClienteVenta/ClienteVentaNoRegistrado.tsx";
import { ClienteVentaRegistrado } from "@olula/ctx/ventas/comun/componentes/moleculas/ClienteVenta/ClienteVentaRegistrado.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { HookModelo, useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useContext, useState } from "react";
import { getFactura } from "../infraestructura.ts";
import "./CrearFactura.css";
import {
  ModeloAltaFacturaNoRegistrada,
  ModeloAltaFacturaRegistrada,
  altaFacturaNoRegistradaVacia,
  altaFacturaRegistradaVacia,
  crearFacturaNoRegistrada,
  crearFacturaRegistrada,
  metaModeloAltaFacturaNoRegistrada,
  metaModeloAltaFacturaRegistrada,
} from "./dominio.ts";

export const CrearFactura = ({
  publicar = async () => {},
  activo = false,
  onCancelar = () => {},
}: {
  publicar?: EmitirEvento;
  activo?: boolean;
  onCancelar?: () => void;
}) => {
  const [modoNoRegistrado, setModoNoRegistrado] = useState(false);
  const facturaRegistrada = useModelo(
    metaModeloAltaFacturaRegistrada,
    altaFacturaRegistradaVacia
  );
  const facturaNoRegistrada = useModelo(
    metaModeloAltaFacturaNoRegistrada,
    altaFacturaNoRegistradaVacia
  );

  const toggleModoCliente = () => {
    const nuevoModo = !modoNoRegistrado;
    setModoNoRegistrado(nuevoModo);

    facturaRegistrada.init(altaFacturaRegistradaVacia);
    facturaNoRegistrada.init(altaFacturaNoRegistradaVacia);
  };

  const cancelar = () => {
    facturaRegistrada.init(altaFacturaRegistradaVacia);
    facturaNoRegistrada.init(altaFacturaNoRegistradaVacia);
    setModoNoRegistrado(false);
    onCancelar();
  };

  return (
    <QModal
      abierto={activo}
      nombre="crear_factura"
      titulo="Nueva Factura"
      onCerrar={cancelar}
    >
      <FormAltaFactura
        publicar={publicar}
        facturaRegistrada={facturaRegistrada}
        facturaNoRegistrada={facturaNoRegistrada}
        modoNoRegistrado={modoNoRegistrado}
        onToggleModoCliente={toggleModoCliente}
      />
    </QModal>
  );
};

const FormAltaFactura = ({
  publicar = async () => {},
  facturaRegistrada,
  facturaNoRegistrada,
  modoNoRegistrado,
  onToggleModoCliente,
}: {
  publicar?: EmitirEvento;
  facturaRegistrada: HookModelo<ModeloAltaFacturaRegistrada>;
  facturaNoRegistrada: HookModelo<ModeloAltaFacturaNoRegistrada>;
  modoNoRegistrado: boolean;
  onToggleModoCliente: () => void;
}) => {
  const { intentar } = useContext(ContextoError);

  const crear = useCallback(async () => {
    let id: string;

    if (modoNoRegistrado) {
      id = await intentar(() =>
        crearFacturaNoRegistrada(facturaNoRegistrada.modelo)
      );
    } else {
      id = await intentar(() =>
        crearFacturaRegistrada(facturaRegistrada.modelo)
      );
    }

    const facturaCreada = await getFactura(id);
    publicar("factura_creada", facturaCreada);

    facturaRegistrada.init(altaFacturaRegistradaVacia);
    facturaNoRegistrada.init(altaFacturaNoRegistradaVacia);
  }, [
    modoNoRegistrado,
    facturaRegistrada,
    facturaNoRegistrada,
    publicar,
    intentar,
  ]);

  const cancelarModal = useCallback(() => {
    publicar("creacion_factura_cancelada");
    facturaRegistrada.init(altaFacturaRegistradaVacia);
    facturaNoRegistrada.init(altaFacturaNoRegistradaVacia);
  }, [publicar, facturaRegistrada, facturaNoRegistrada]);

  const actual = modoNoRegistrado ? facturaNoRegistrada : facturaRegistrada;

  return (
    <>
      <div className="modo-cliente">
        <QBoton onClick={onToggleModoCliente} variante="texto" tipo="button">
          {modoNoRegistrado ? "Cliente no registrado" : "Cliente registrado"}
        </QBoton>
      </div>
      <quimera-formulario>
        {modoNoRegistrado ? (
          <ClienteVentaNoRegistrado cliente={facturaNoRegistrada} />
        ) : (
          <ClienteVentaRegistrado cliente={facturaRegistrada} />
        )}
      </quimera-formulario>
      <div className="botones">
        <QBoton onClick={crear} deshabilitado={!actual.valido}>
          Guardar
        </QBoton>
        <QBoton onClick={cancelarModal} variante="texto">
          Cancelar
        </QBoton>
      </div>
    </>
  );
};
