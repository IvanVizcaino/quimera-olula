import { QBoton, QInput } from "@olula/componentes/index.ts";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useContext } from "react";
import { EmpresasUsuario } from "../../comun/componentes/empresas_usuario.tsx";
import { Grupo } from "../../comun/componentes/grupo.tsx";
import { Usuario } from "../diseño.ts";
import { metaNuevoUsuario, nuevoUsuarioVacio } from "../dominio.ts";
import { getUsuario, postUsuario } from "../infraestructura.ts";
import "./CrearUsuario.css";

export const CrearUsuario = ({
  activo = false,
  publicar = async () => {},
}: {
  activo: boolean;
  publicar?: EmitirEvento;
}) => {
  const { intentar } = useContext(ContextoError);
  const usuario = useModelo(metaNuevoUsuario, nuevoUsuarioVacio);

  const crear = async () => {
    const id = await intentar(() =>
      postUsuario(usuario.modelo as Partial<Usuario>)
    );
    const usuarioCreado = await getUsuario(id);
    publicar("usuario_creado", usuarioCreado);
    usuario.init();
  };

  const cancelar = () => {
    usuario.init();
    publicar("creacion_de_usuario_cancelada");
  };

  return (
    <QModal nombre="crearUsuario" abierto={activo} onCerrar={cancelar}>
      <div className="CrearUsuario">
        <h2>Nuevo Usuario</h2>
        <quimera-formulario>
          <QInput label="Identificador" {...usuario.uiProps("id")} />
          <QInput label="Nombre" {...usuario.uiProps("nombre")} />
          <QInput label="Email" {...usuario.uiProps("email")} />
          <Grupo {...usuario.uiProps("grupo_id")} />
          <EmpresasUsuario {...usuario.uiProps("empresas")} />
        </quimera-formulario>
        <div className="botones">
          <QBoton onClick={crear} deshabilitado={!usuario.valido}>
            Guardar
          </QBoton>
          <QBoton onClick={cancelar} variante="texto">
            Cancelar
          </QBoton>
        </div>
      </div>
    </QModal>
  );
};
