import { Cliente } from "#/ventas/comun/componentes/cliente.tsx";
import { DirCliente } from "#/ventas/comun/componentes/dirCliente.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useFocus } from "@olula/lib/useFocus.js";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback } from "react";
import { metaNuevoAlbaran, nuevoAlbaranVacio } from "../dominio.ts";
import { getAlbaran, postAlbaran } from "../infraestructura.ts";
import "./CrearAlbaran.css";

export const CrearAlbaran = ({
  publicar = async () => {},
}: {
  publicar?: EmitirEvento;
}) => {
  const nuevoAlbaran = useModelo(metaNuevoAlbaran, nuevoAlbaranVacio);
  const focus = useFocus();

  const guardar_ = useCallback(async () => {
    const id = await postAlbaran(nuevoAlbaran.modelo);
    const albaranCreado = await getAlbaran(id);
    publicar("albaran_creado", albaranCreado);
  }, [nuevoAlbaran.modelo, publicar]);

  const cancelar_ = useCallback(() => {
    publicar("creacion_cancelada");
    nuevoAlbaran.init();
  }, [publicar, nuevoAlbaran]);

  const [guardar, cancelar] = useForm(guardar_, cancelar_);

  return (
    <div className="CrearAlbaran">
      <quimera-formulario>
        <Cliente
          {...nuevoAlbaran.uiProps("cliente_id", "nombre")}
          nombre="albaran_cliente_id"
          ref={focus}
        />
        <DirCliente
          clienteId={nuevoAlbaran.modelo.cliente_id}
          {...nuevoAlbaran.uiProps("direccion_id")}
        />
      </quimera-formulario>
      <div className="botones">
        <QBoton onClick={guardar} deshabilitado={!nuevoAlbaran.valido}>
          Guardar
        </QBoton>
        <QBoton onClick={cancelar} variante="texto">
          Cancelar
        </QBoton>
      </div>
    </div>
  );
};
