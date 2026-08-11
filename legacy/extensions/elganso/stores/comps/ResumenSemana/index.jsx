/* eslint-disable no-console */
import "./ResumenSemana.style.scss";

import PropTypes from "prop-types";

function ResumenSemana({ _estilos, ...props }) {
  const { state, codtienda } = props;
  const { planificador } = state;

  if (codtienda && planificador) {
    const data = planificador[0]; // Accedemos al objeto de fechas

    let horasTotales = 0;
    let diasTrabajados = 0;
    let diasFestivos = 0;
    let diasVacaciones = 0;

    // Recorremos cada fecha del objeto
    Object.keys(data).forEach((fecha) => {
      const diaInfo = data[fecha];

      // 1. Contar días festivos si viene marcado en el JSON
      if (diaInfo.festivo) {
        diasFestivos++;
      }

      // Recorremos los agentes de ese día
      Object.keys(diaInfo.agentes).forEach((agenteId) => {
        const agente = diaInfo.agentes[agenteId];

        // Si el agente tiene tramos horarios asignados
        if (agente.tramos && agente.tramos.length > 0) {
          diasTrabajados++; // Sumamos un día trabajado si tiene tramos

          agente.tramos.forEach((tramo) => {
            // Calculamos la diferencia entre 'hasta' y 'desde'
            const [horaInicio, minInicio] = tramo.desde.split(':').map(Number);
            const [horaFin, minFin] = tramo.hasta.split(':').map(Number);

            // Convertimos todo a horas (por si hay minutos como 14:30)
            const inicioEnHoras = horaInicio + minInicio / 60;
            const finEnHoras = horaFin + minFin / 60;

            horasTotales += (finEnHoras - inicioEnHoras);
          });
        } else if (agente.vacaciones) {
          diasVacaciones += 1;
        }
      });
    });

    // 3. Calcular la media de horas por día trabajado
    const mediaHoras = diasTrabajados > 0 ? (horasTotales / diasTrabajados).toFixed(2) : 0;

    return (
      <div id="ResumenSemana">
        <div className="itemResumen">
          <div className="tituloItem">Horas Trabajadas</div>
          <div className="resulItem">{horasTotales > 0 ? horasTotales.toFixed(2) : 0}</div>
        </div>

        <div className="itemResumen">
          <div className="tituloItem">Días Trabajados</div>
          <div className="resulItem">{diasTrabajados}</div>
        </div>

        <div className="itemResumen">
          <div className="tituloItem">Media Horas Trabajadas</div>
          <div className="resulItem">{isNaN(mediaHoras) ? 0 : mediaHoras}</div>
        </div>

        <div className="itemResumen">
          <div className="tituloItem">Días Festivos</div>
          <div className="resulItem">{diasFestivos}</div>
        </div>

        <div className="itemResumen">
          <div className="tituloItem">Días Vacaciones</div>
          <div className="resulItem">{diasVacaciones}</div>
        </div>
      </div>
    );
  }

  return null;
}

ResumenSemana.propTypes = {
  estilos: PropTypes.object,
};
ResumenSemana.defaultProps = {};

export default ResumenSemana;
