import { formatearMoneda } from "@olula/lib/dominio.ts";
import { max, scaleLinear } from "d3";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import {
  cargarModeloWidgetPrevision,
  ModeloWidgetPrevision,
  modeloWidgetPrevisionInicial,
} from "./dominio.ts";
import "./WidgetPrevisionOportunidades.css";

export const WidgetPrevisionOportunidades = () => {
  const [modelo, setModelo] = useState<ModeloWidgetPrevision>(
    modeloWidgetPrevisionInicial
  );

  useEffect(() => {
    let cancelado = false;

    cargarModeloWidgetPrevision()
      .then((siguienteModelo) => {
        if (cancelado) return;
        setModelo(siguienteModelo);
      })
      .catch((error) => {
        if (cancelado) return;
        console.error("Error cargando prevision de oportunidades", error);
        setModelo((previo) => ({ ...previo, estado: "listo" }));
      });

    return () => {
      cancelado = true;
    };
  }, []);

  const textoPrevision = formatearMoneda(modelo.previsionPotencial, "EUR");
  const maximoPrevision =
    max(modelo.seriePorEstado, (item) => item.prevision) ?? 0;

  const escalaAncho = useMemo(
    () =>
      scaleLinear<number, number>()
        .domain([0, maximoPrevision || 1])
        .range([6, 100]),
    [maximoPrevision]
  );

  if (modelo.estado === "cargando") {
    return <div>Cargando previsión de oportunidades...</div>;
  }

  if (modelo.oportunidadesAbiertas === 0) {
    return (
      <div className="widget-prevision-oportunidades">
        <h3 className="widget-prevision-oportunidades__titulo">CRM</h3>
        <div>No tienes oportunidades abiertas</div>
      </div>
    );
  }
  return (
    <div className="widget-prevision-oportunidades">
      <h3 className="widget-prevision-oportunidades__titulo">Oportunidades</h3>
      <div className="widget-prevision-oportunidades__valor">
        Prevision de ventas potencial <strong>{textoPrevision}</strong>
      </div>

      <div className="widget-prevision-oportunidades__serie" role="list">
        {modelo.seriePorEstado.map((estado) => {
          const ancho = `${Math.round(escalaAncho(estado.prevision))}%`;

          return (
            <div
              key={estado.estadoId}
              className="widget-prevision-oportunidades__fila"
              role="listitem"
            >
              <div
                className="widget-prevision-oportunidades__estado"
                title={estado.estadoDescripcion}
              >
                {estado.estadoDescripcion}
              </div>
              <div className="widget-prevision-oportunidades__barra-fondo">
                <div
                  className="widget-prevision-oportunidades__barra-valor"
                  style={{ width: ancho }}
                />
              </div>
              <div className="widget-prevision-oportunidades__importe">
                {formatearMoneda(estado.prevision, "EUR")}
              </div>
            </div>
          );
        })}
      </div>

      <div className="widget-prevision-oportunidades__acciones">
        <Link
          className="widget-prevision-oportunidades__enlace"
          to={modelo.urlVer}
        >
          Ver
        </Link>
      </div>
    </div>
  );
};
