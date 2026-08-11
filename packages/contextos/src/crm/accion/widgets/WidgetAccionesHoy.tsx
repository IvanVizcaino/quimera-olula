import { useEffect, useState } from "react";
import { Link } from "react-router";
import "../../widgets/WidgetCrmLista.css";
import { TarjetaAccion } from "../maestro/TarjetaAccion.tsx";
import {
  cargarModeloWidgetAccionesHoy,
  FiltroAccionesWidget,
  ModeloWidgetAccionesHoy,
  modeloWidgetAccionesHoyInicial,
} from "./dominio_acciones_hoy.ts";

export const WidgetAccionesHoy = () => {
  const [modelo, setModelo] = useState<ModeloWidgetAccionesHoy>(
    modeloWidgetAccionesHoyInicial
  );
  const [filtroActivo, setFiltroActivo] = useState<FiltroAccionesWidget>("hoy");

  useEffect(() => {
    let cancelado = false;

    cargarModeloWidgetAccionesHoy()
      .then((siguienteModelo) => {
        if (cancelado) return;
        setModelo(siguienteModelo);
      })
      .catch((error) => {
        if (cancelado) return;
        console.error("Error cargando acciones de hoy", error);
        setModelo((previo) => ({ ...previo, estado: "listo" }));
      });

    return () => {
      cancelado = true;
    };
  }, []);

  if (modelo.estado === "cargando") {
    return <div>Cargando acciones de hoy...</div>;
  }

  const gruposVisibles =
    filtroActivo === "pendientes"
      ? modelo.gruposPendientes
      : filtroActivo === "retrasadas"
        ? modelo.gruposRetrasadas
        : modelo.gruposHoy;

  const totalVisible =
    filtroActivo === "pendientes"
      ? modelo.totalPendientes
      : filtroActivo === "retrasadas"
        ? modelo.totalRetrasadas
        : modelo.totalAcciones;

  const urlVerFiltro =
    filtroActivo === "pendientes"
      ? modelo.urlVerPendientes
      : filtroActivo === "retrasadas"
        ? modelo.urlVerRetrasadas
        : modelo.urlVerHoy;

  return (
    <div className="widget-crm-lista">
      <div className="widget-crm-lista__cabecera">
        <h3 className="widget-crm-lista__titulo">Acciones de hoy</h3>
        <div className="widget-acciones-situacion">
          <button
            type="button"
            className={`widget-situacion-item widget-situacion-pendientes ${
              filtroActivo === "pendientes" ? "activo" : ""
            }`.trim()}
            onClick={() => setFiltroActivo("pendientes")}
          >
            {modelo.totalPendientes} pendientes
          </button>
          {modelo.totalRetrasadas > 0 && (
            <button
              type="button"
              className={`widget-situacion-item widget-situacion-retrasadas ${
                filtroActivo === "retrasadas" ? "activo" : ""
              }`.trim()}
              onClick={() => setFiltroActivo("retrasadas")}
            >
              {modelo.totalRetrasadas} retrasadas
            </button>
          )}
          <button
            type="button"
            className={`widget-situacion-item widget-situacion-hoy ${
              filtroActivo === "hoy" ? "activo" : ""
            }`.trim()}
            onClick={() => setFiltroActivo("hoy")}
          >
            {modelo.totalAcciones} para hoy
          </button>
        </div>
      </div>

      {totalVisible === 0 ? (
        <div className="widget-crm-lista__vacio">
          {filtroActivo === "pendientes"
            ? "No tienes acciones pendientes"
            : filtroActivo === "retrasadas"
              ? "No tienes acciones retrasadas"
              : "No tienes acciones para hoy"}
        </div>
      ) : (
        <div className="widget-crm-lista__grupos">
          {gruposVisibles.map((grupo) => (
            <section key={grupo.tipo} className="widget-crm-lista__grupo">
              <div className="widget-crm-lista__grupo-titulo">{grupo.tipo}</div>
              <div className="widget-crm-lista__lista">
                {grupo.acciones.map((accion) => (
                  <Link
                    key={accion.id}
                    className="widget-crm-lista__tarjeta-enlace"
                    to={`/crm/accion?id=${accion.id}`}
                  >
                    <TarjetaAccion {...accion} />
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <div className="widget-crm-lista__acciones">
        <Link className="widget-crm-lista__enlace" to={urlVerFiltro}>
          Ver todas
        </Link>
      </div>
    </div>
  );
};
