import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QIcono } from "@olula/componentes/atomos/qicono.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { QRejilla } from "@olula/componentes/rejilla/QRejilla.tsx";
import { useCallback, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { ComponenteDashboard, Dashboard } from "../../diseño.ts";
import { ALTO_FILA_DASHBOARD, MAX_COMPONENTES } from "../../dominio.ts";
import { crearDashboard } from "../../infraestructura.ts";
import { useIaDisponible } from "../../useIaDisponible.ts";
import { CatalogoComponentes } from "../CatalogoComponentes.tsx";
import { Componente } from "../componentes/Componente.tsx";
import { ConfigurarComponente } from "../ConfigurarComponente.tsx";
import { PreguntarIA } from "../PreguntarIA.tsx";
import "../Dashboard.css";
import { getMaquina } from "./maquina.ts";
import { contextoDashboardInicial } from "./pagina.ts";

/**
 * Página de un dashboard: verlo, editarlo (su propietario), compartirlo, exportarlo.
 * Con `clave`, uno de módulo o la Inicio: la versión del usuario o el de por defecto.
 */
export const PaginaDashboard = ({ clave }: { clave?: string }) => {
  const { id } = useParams();
  const [parametros] = useSearchParams();
  const navegar = useNavigate();
  const conIA = useIaDisponible();

  const publicar = useCallback(
    async (evento: string) => {
      if (evento === "dashboard_borrado") navegar("/comun/dashboard");
    },
    [navegar]
  );

  const { ctx, emitir } = useMaquina(getMaquina, contextoDashboardInicial, publicar);
  const { estado, dashboard, borrador, configurando } = ctx;

  useEffect(() => {
    const editar = parametros.has("editar");
    if (clave) emitir("clave_cambiada", { clave, editar }, true);
    else if (id) emitir("id_cambiado", { id, editar }, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, clave]);

  if (estado === "NO_ENCONTRADO") {
    return (
      <div className="pagina-dashboard">
        <p className="pagina-dashboard-vacio">
          {clave
            ? "No hay un dashboard para esta sección."
            : "Este dashboard no existe o no tienes acceso."}{" "}
          <QBoton variante="texto" enlace="/comun/dashboard">
            Ver mis dashboards
          </QBoton>
        </p>
      </div>
    );
  }
  if (!dashboard) return <div className="pagina-dashboard" aria-busy="true" />;

  const editando = estado === "EDITANDO" || estado === "CONFIGURANDO";
  const componentes = editando ? borrador : dashboard.componentes;

  const duplicar = async () => {
    const nuevo = await crearDashboard({
      nombre: `${dashboard.nombre} (copia)`,
      componentes: dashboard.componentes,
    });
    navegar(`/comun/dashboard/${nuevo}`);
  };

  const renderizar = (componente: ComponenteDashboard) =>
    editando ? (
      <div className="pagina-dashboard-editable">
        <Componente componente={componente} />
        <div className="pagina-dashboard-acciones-componente">
          <button
            type="button"
            aria-label={`Configurar ${componente.titulo || componente.tipo}`}
            title="Configurar"
            onClick={() => emitir("componente_configurado", componente.id)}
          >
            <QIcono nombre="editar" tamaño="sm" />
          </button>
          <button
            type="button"
            data-destructivo
            aria-label={`Quitar ${componente.titulo || componente.tipo}`}
            title="Quitar"
            onClick={() => emitir("componente_quitado", componente.id)}
          >
            <QIcono nombre="eliminar" tamaño="sm" />
          </button>
        </div>
      </div>
    ) : (
      <Componente componente={componente} />
    );

  return (
    <div className="pagina-dashboard" data-editando={editando || undefined}>
      <header className="pagina-dashboard-cabecera">
        <div className="pagina-dashboard-titulo">
          {editando ? (
            <QInput
              label="Nombre del dashboard"
              nombre="nombre_dashboard"
              valor={ctx.nombre}
              maxLength={80}
              onChange={(nombre) => emitir("nombre_cambiado", nombre)}
            />
          ) : (
            <h1>{dashboard.nombre}</h1>
          )}
          <span className="pagina-dashboard-subtitulo">{subtitulo(dashboard)}</span>
        </div>

        <div className="pagina-dashboard-botones">
          {editando ? (
            <>
              <QBoton variante="borde" onClick={() => emitir("edicion_cancelada")}>
                Cancelar
              </QBoton>
              <QBoton onClick={() => emitir("edicion_guardada")}>Guardar</QBoton>
            </>
          ) : (
            <>
              <QBoton variante="borde" onClick={() => window.print()}>
                Exportar PDF
              </QBoton>
              <QBoton variante="borde" onClick={duplicar}>
                Duplicar
              </QBoton>
              {dashboard.esPropio && dashboard.clave === null && (
                <QBoton variante="borde" onClick={() => emitir("compartido_alternado")}>
                  {dashboard.compartido ? "Dejar de compartir" : "Compartir con la empresa"}
                </QBoton>
              )}
              {dashboard.esPropio && dashboard.id !== "" && (
                <QBoton variante="borde" destructivo onClick={() => emitir("borrado_solicitado")}>
                  {dashboard.clave ? "Restaurar por defecto" : "Borrar"}
                </QBoton>
              )}
              {dashboard.esPropio && (
                <QBoton onClick={() => emitir("edicion_iniciada")}>
                  {dashboard.id ? "Editar" : "Personalizar"}
                </QBoton>
              )}
            </>
          )}
        </div>
      </header>

      {dashboard.esPropio && dashboard.componentesOcultos > 0 && (
        <p className="pagina-dashboard-aviso" role="status">
          <QIcono nombre="candado" tamaño="sm" />
          {dashboard.componentesOcultos === 1
            ? "Hay 1 componente que no puedes ver porque no tienes permiso sobre sus datos. Se conserva al guardar."
            : `Hay ${dashboard.componentesOcultos} componentes que no puedes ver porque no tienes permiso sobre sus datos. Se conservan al guardar.`}
        </p>
      )}

      <div className="pagina-dashboard-cuerpo">
        <div className="pagina-dashboard-rejilla">
          {componentes.length === 0 ? (
            <div className="pagina-dashboard-vacio">
              {editando
                ? "Añade componentes desde el panel."
                : "Este dashboard aún no tiene componentes."}
            </div>
          ) : (
            <QRejilla
              elementos={componentes}
              editable={editando}
              altoFila={ALTO_FILA_DASHBOARD}
              renderizar={renderizar}
              etiqueta={(c) => c.titulo || c.tipo}
              onCambiar={(nuevos) => emitir("disposicion_cambiada", nuevos)}
            />
          )}
        </div>

        {editando && (
          <CatalogoComponentes
            lleno={borrador.length >= MAX_COMPONENTES}
            conIA={conIA}
            onElegir={(tipo) => emitir("componente_añadido", tipo)}
          />
        )}
      </div>

      {estado === "CONFIGURANDO" && configurando?.tipo === "pregunta_ia" && (
        <PreguntarIA
          componente={configurando}
          onGuardar={(componente) => emitir("configuracion_aplicada", componente)}
          onAjustar={(componente) => emitir("configuracion_ajustada", componente)}
          onCancelar={() => emitir("configuracion_cancelada")}
        />
      )}

      {estado === "CONFIGURANDO" && configurando && configurando.tipo !== "pregunta_ia" && (
        <ConfigurarComponente
          componente={configurando}
          onGuardar={(componente) => emitir("configuracion_aplicada", componente)}
          onCancelar={() => emitir("configuracion_cancelada")}
        />
      )}

      <QModalConfirmacion
        nombre="borrar-dashboard"
        abierto={estado === "BORRANDO"}
        titulo={dashboard.clave ? "Restaurar por defecto" : "Borrar dashboard"}
        mensaje={
          dashboard.clave
            ? "Se descartará tu versión y volverás a ver el dashboard por defecto."
            : `Se borrará «${dashboard.nombre}»${dashboard.compartido ? " también para el resto de la empresa" : ""}.`
        }
        onCerrar={() => emitir("borrado_cancelado")}
        onAceptar={() => emitir("borrado_confirmado")}
      />
    </div>
  );
};

const subtitulo = (dashboard: Dashboard) => {
  if (dashboard.clave) {
    return dashboard.id
      ? "Tu versión personalizada"
      : "Por defecto · personalízalo y se guardará tu versión";
  }
  if (!dashboard.esPropio) return `Compartido por ${dashboard.propietario}`;
  return dashboard.compartido ? "Compartido con toda la empresa" : "Solo lo ves tú";
};

/** Dashboard de un módulo (`/dashboard/:clave`). */
export const PaginaDashboardModulo = () => {
  const { clave } = useParams();
  return <PaginaDashboard clave={clave} />;
};

/** La Inicio de la app: el dashboard global. */
export const PaginaInicio = () => <PaginaDashboard clave="inicio" />;
