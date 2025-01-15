import Quimera, { PropValidation } from "quimera";
import React from "react";

function Forbidden() {
  return (
    <Quimera.Template id="Forbidden">
      <h1>403 Forbidden</h1>
    </Quimera.Template>
  );
}

Forbidden.propTypes = PropValidation.propTypes;
Forbidden.defaultProps = PropValidation.defaultProps;
export default Forbidden;
