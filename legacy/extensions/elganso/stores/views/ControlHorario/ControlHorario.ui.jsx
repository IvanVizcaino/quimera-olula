import Quimera, { PropValidation } from "quimera";

import { ControlHorarioComp, SemanaControlHorasComp } from "../../comps";

function ControlHorario() {
  const render = () => {
    return (
      <>
        <ControlHorarioComp />
        <SemanaControlHorasComp />
      </>
    );
  };

  return <Quimera.Template id="ControlHorario">{render()}</Quimera.Template>;
}

ControlHorario.propTypes = PropValidation.propTypes;
ControlHorario.defaultProps = PropValidation.defaultProps;
export default ControlHorario;
