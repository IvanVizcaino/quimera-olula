import { useEffect, useState } from "react";
import { Link } from "react-router";
import "../../widgets/WidgetCrmLista.css";
import { TarjetaOportunidadVenta } from "../maestro/TarjetaOportunidadVenta.tsx";
import {
  cargarModeloWidgetUltimasOportunidades,
  ModeloWidgetUltimasOportunidades,
  modeloWidgetUltimasOportunidadesInicial,
} from "./dominio_ultimas_oportunidades.ts";

export const WidgetUltimasOportunidades = () => {
  const [modelo, setModelo] = useState<ModeloWidgetUltimasOportunidades>(
    modeloWidgetUltimasOportunidadesInicial
  );

  useEffect(() => {
    let cancelado = false;

    cargarModeloWidgetUltimasOportunidades()
      .then((siguienteModelo) => {
        if (cancelado) return;
        setModelo(siguienteModelo);
      })
      .catch((error) => {
        if (cancelado) return;
        console.error(
          "Error cargando oportunidades que requieren atención",
          error
        );
        setModelo((previo) => ({ ...previo, estado: "listo" }));
      });

    return () => {
      cancelado = true;
    };
  }, []);

  if (modelo.estado === "cargando") {
    return <div>Cargando oportunidades que requieren atención...</div>;
  }

  return (
    <div className="widget-crm-lista">
      <div className="widget-crm-lista__cabecera">
        <h3 className="widget-crm-lista__titulo">
          Oportunidades que requieren atención
        </h3>
        <div className="widget-crm-lista__subtitulo">
          Priorizadas por vencimiento y urgencia comercial
        </div>
      </div>

      {modelo.oportunidades.length === 0 ? (
        <div className="widget-crm-lista__vacio">
          No hay oportunidades urgentes ahora mismo
        </div>
      ) : (
        <div className="widget-crm-lista__lista">
          {modelo.oportunidades.map((oportunidad) => (
            <Link
              key={oportunidad.id}
              className="widget-crm-lista__tarjeta-enlace"
              to={`/crm/oportunidadventa?id=${oportunidad.id}`}
            >
              <TarjetaOportunidadVenta {...oportunidad} />
            </Link>
          ))}
        </div>
      )}

      <div className="widget-crm-lista__acciones">
        <Link className="widget-crm-lista__enlace" to={modelo.urlVer}>
          Ver todas
        </Link>
      </div>
    </div>
  );
};
