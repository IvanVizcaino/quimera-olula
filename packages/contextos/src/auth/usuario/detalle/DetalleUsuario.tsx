import { EmpresasUsuario } from "#/auth/comun/componentes/empresas_usuario.tsx";
import { Grupo } from "#/auth/comun/componentes/grupo.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { Detalle, QDate, QModal } from "@olula/componentes/index.ts";
import { ContextoError } from "@olula/lib/contexto.ts";
import { EmitirEvento, Entidad } from "@olula/lib/diseño.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useContext, useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import { BorrarUsuario } from "../borrar/BorrarUsuario";
import { Usuario } from "../diseño";
import { metaUsuario, usuarioVacio } from "../dominio";
import {
  generarTokenUsuario,
  getTokenUsuario,
  getUsuario,
} from "../infraestructura";
import "./DetalleUsuario.css";
import { ContextoDetalleUsuario } from "./diseño.ts";
import { getMaquina } from "./maquina.ts";

const titulo = (usuario: Entidad) => usuario.id as string;

export const DetalleUsuario = ({
  usuarioInicial = null,
  publicar = async () => {},
}: {
  usuarioInicial?: Usuario | null;
  publicar?: EmitirEvento;
}) => {
  const params = useParams();
  const usuarioId = usuarioInicial?.id ?? params.id;
  const usuarioIdCargadoRef = useRef<string | null>(null);
  const { intentar } = useContext(ContextoError);

  const contextoInicial: ContextoDetalleUsuario = {
    estado: "INICIAL",
    usuario: usuarioInicial || usuarioVacio,
    usuarioInicial: usuarioInicial || null,
  };

  const { ctx, emitir } = useMaquina(getMaquina, contextoInicial, publicar);

  const usuario = useModelo(metaUsuario, ctx.usuario ?? usuarioVacio);
  const { uiProps, modificado, valido } = usuario;

  const [expiracion, setExpiracion] = useState("");
  const [tokenGenerado, setTokenGenerado] = useState<string | null>(null);

  // Expresión regular ISO: YYYY-MM-DD, opcionalmente T[HH:MM[:SS]]Z
  const isoRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2})?Z)?$/;

  const validarExpiracion = (valor: string) => {
    if (!valor) return "";
    return isoRegex.test(valor)
      ? ""
      : "Formato inválido. Debe ser YYYY-MM-DDTHH:MMZ o YYYY-MM-DDTHH:MM:SSZ";
  };

  const onExpiracionChange = (valor: string) => {
    setExpiracion(valor);
  };

  const onGenerar = async () => {
    if (validarExpiracion(expiracion)) return;
    if (!ctx.usuario?.id) return;
    const token = await intentar(() =>
      generarTokenUsuario(ctx.usuario!.id, expiracion)
    );
    setTokenGenerado(token);
    setExpiracion("");
    emitir("token_generado");
  };

  const guardar = () => {
    emitir("edicion_de_usuario_lista", usuario.modelo);
  };

  const abrirGenerarToken = () => {
    setTokenGenerado(null);
    emitir("generar_token_solicitado");
  };

  const abrirConsultaToken = async () => {
    if (!ctx.usuario?.id) return;
    emitir("consultar_token_solicitado");
    const token = await getTokenUsuario(ctx.usuario.id);
    setTokenGenerado(token);
  };

  useEffect(() => {
    if (usuarioId && usuarioId !== usuarioIdCargadoRef.current) {
      usuarioIdCargadoRef.current = usuarioId;
      emitir("usuario_id_cambiada", usuarioId, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuarioId]);

  const { estado } = ctx;

  return (
    <Detalle
      id={usuarioId}
      obtenerTitulo={titulo}
      setEntidad={() => {}}
      entidad={ctx.usuario ?? usuarioVacio}
      cargar={getUsuario}
      cerrarDetalle={() => publicar("seleccion_cancelada")}
    >
      {!!usuarioId && (
        <div className="DetalleUsuario">
          <div className="maestro-botones ">
            <QBoton onClick={abrirGenerarToken}>Generar Token</QBoton>
            <QBoton onClick={abrirConsultaToken}>Token Refresco</QBoton>
            <QBoton onClick={() => emitir("borrar_solicitado")}>Borrar</QBoton>
          </div>

          <quimera-formulario>
            <QInput label="Nombre" {...uiProps("nombre")} />
            <QInput label="Email" {...uiProps("email")} />
            <Grupo {...uiProps("grupo_id")} />
            <EmpresasUsuario {...uiProps("empresas")} />
          </quimera-formulario>

          {modificado && (
            <div className="botones maestro-botones">
              <QBoton onClick={guardar} deshabilitado={!valido}>
                Guardar
              </QBoton>
              <QBoton
                tipo="reset"
                variante="texto"
                onClick={() => emitir("edicion_de_usuario_cancelada")}
              >
                Cancelar
              </QBoton>
            </div>
          )}
          <BorrarUsuario
            publicar={emitir}
            abierto={estado === "BORRANDO"}
            usuario={ctx.usuario ?? usuarioVacio}
          />
          <QModal
            nombre="generarToken"
            abierto={estado === "GENERANDO_TOKEN"}
            onCerrar={() => {
              emitir("generacion_cancelada");
              setExpiracion("");
              setTokenGenerado(null);
            }}
          >
            <h2>Generar token refresco</h2>
            <QDate
              nombre="expiracion"
              label="Expiración"
              valor={expiracion}
              onChange={onExpiracionChange}
            />
            <div className="botones">
              <QBoton
                onClick={onGenerar}
                deshabilitado={!!validarExpiracion(expiracion)}
              >
                Guardar
              </QBoton>
              <QBoton
                tipo="reset"
                variante="texto"
                onClick={() => {
                  emitir("generacion_cancelada");
                  setExpiracion("");
                  setTokenGenerado(null);
                }}
              >
                Cancelar
              </QBoton>
            </div>
            {tokenGenerado && (
              <div className="token-generado">
                <label htmlFor="token-generado">Token refresco generado</label>
                <textarea
                  id="token-generado"
                  className="token-textarea"
                  name="token"
                  value={tokenGenerado}
                  readOnly
                  onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                />
              </div>
            )}
          </QModal>
          <QModal
            nombre="generarToken"
            abierto={estado === "CONSULTANDO_TOKEN"}
            onCerrar={() => {
              emitir("consulta_cancelada");
              setExpiracion("");
              setTokenGenerado(null);
            }}
          >
            <h2>Token refresco</h2>
            {tokenGenerado && (
              <div className="token-generado">
                <textarea
                  id="token-generado"
                  className="token-textarea"
                  name="token"
                  value={tokenGenerado}
                  readOnly
                  onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                />
              </div>
            )}
          </QModal>
        </div>
      )}
    </Detalle>
  );
};
