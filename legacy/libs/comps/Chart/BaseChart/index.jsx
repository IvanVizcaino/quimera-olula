import { Chart, ChartAnnotation } from "@quimera/thirdparty";
import React, { useEffect, useRef } from "react";

const SIN_DATOS = [];
const SIN_PROPS = {};

function BaseChart({ type = "bar", labels = SIN_DATOS, data = SIN_DATOS, title = "", color = "#771111", chartProps = SIN_PROPS, ...props }) {
  const chartRef = useRef(null);
  const chartActual = useRef(null);

  useEffect(() => {
    if (!chartRef.current) {
      return undefined;
    }

    chartActual.current = new Chart(chartRef.current, {
      type,
      data: {
        labels,
        datasets: [
          {
            label: title,
            data,
            backgroundColor: color,
          },
        ],
      },
      ...chartProps,
      plugins: [ChartAnnotation],
    });

    return () => {
      chartActual.current?.destroy();
      chartActual.current = null;
    };
  }, [data, chartProps]);

  return (
    <div className="chart-container" style={{ height: "100%", width: "100%" }}>
      <canvas id="chart" ref={chartRef} {...props}>
        {"No se cargaron los datos"}
      </canvas>
    </div>
  );
}

export default BaseChart;
