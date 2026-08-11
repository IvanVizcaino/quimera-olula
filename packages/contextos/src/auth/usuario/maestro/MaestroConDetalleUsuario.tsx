import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { Criteria } from "@olula/lib/diseño.js";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { listaEntidadesInicial } from "@olula/lib/ListaEntidades.js";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { useCallback, useEffect, useState } from "react";
import { CrearUsuario } from "../crear/CrearUsuario.tsx";
import { DetalleUsuario } from "../detalle/DetalleUsuario.tsx";
import { Usuario } from "../diseño.ts";
import { metaTablaUsuario } from "../dominio.ts";
import "./MaestroConDetalleUsuario.css";
import { getMaquina } from "./maquina.ts";

const criteriaBaseUsuarios = {
  ...criteriaDefecto,
  orden: ["nombre", "ASC"],
};

export const MaestroConDetalleUsuario = () => {
  const { id, criteria } = getUrlParams();
  const criteriaInicial = criteria?.orden?.length
    ? { ...criteriaBaseUsuarios, ...criteria }
    : criteriaBaseUsuarios;
  const [criteriaActual, setCriteriaActual] = useState(criteriaInicial);

  const { ctx, emitir } = useMaquina(getMaquina, {
    estado: "INICIAL",
    usuarios: listaEntidadesInicial<Usuario>(),
  });

  useUrlParams(ctx.usuarios.activo?.id, criteriaActual);

  const crear = useCallback(
    () => emitir("creacion_de_usuario_solicitada"),
    [emitir]
  );

  const recargar = useCallback(
    async (criteria: Criteria) => {
      await emitir("recarga_de_usuarios_solicitada", criteria);
    },
    [emitir]
  );

  useEffect(() => {
    if (!id) return;

    const seleccionActivaSigueDisponible = ctx.usuarios.activo
      ? ctx.usuarios.lista.some((item) => item.id === ctx.usuarios.activo?.id)
      : false;

    if (seleccionActivaSigueDisponible) return;

    const usuario = ctx.usuarios.lista.find((item) => item.id === id);
    if (usuario && usuario.id !== ctx.usuarios.activo?.id) {
      emitir("usuario_seleccionado", usuario);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, ctx.usuarios.lista]);

  useEffect(() => {
    setCriteriaActual(criteriaBaseUsuarios);
    emitir("recarga_de_usuarios_solicitada", criteriaBaseUsuarios);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="Usuario">
      <MaestroDetalle<Usuario>
        Maestro={
          <>
            <h2>Usuarios</h2>
            <Listado
              metaTabla={metaTablaUsuario}
              criteriaInicial={criteriaBaseUsuarios}
              criteria={criteriaActual}
              modo="tarjetas"
              entidades={ctx.usuarios.lista}
              totalEntidades={ctx.usuarios.total}
              seleccionada={ctx.usuarios.activo?.id}
              renderAcciones={() => (
                <div className="maestro-botones">
                  <QBoton onClick={crear}>Nuevo Usuario</QBoton>
                </div>
              )}
              onSeleccion={(id) => {
                const usuario = ctx.usuarios.lista.find(
                  (item) => item.id === id
                );
                if (usuario) emitir("usuario_seleccionado", usuario);
              }}
              onCriteriaChanged={(nuevaCriteria) => {
                setCriteriaActual(nuevaCriteria);
                recargar(nuevaCriteria);
              }}
            />
          </>
        }
        Detalle={
          <DetalleUsuario
            usuarioInicial={ctx.usuarios.activo}
            publicar={emitir}
          />
        }
        seleccionada={ctx.usuarios.activo?.id}
      />

      <CrearUsuario
        publicar={emitir}
        activo={ctx.estado === "CREANDO_USUARIO"}
      />
    </div>
  );
};
