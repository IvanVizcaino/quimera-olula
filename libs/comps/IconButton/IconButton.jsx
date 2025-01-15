import { IconButton as IconButtonMUI, Tooltip } from "@quimera/thirdparty";
import PropTypes from "prop-types";
import { useStateValue, util } from "quimera";
import React from "react";

// ForwardRef es necesario para que el tooltip pueda escuchar en los elementos interiores del componente
const IconButton = React.forwardRef(function IconButton(iconButtonProps, ref) {
  const { id, data, tooltip, ...props } = iconButtonProps;
  const [, dispatch] = useStateValue();

  const handleClick = e => {
    dispatch({
      type: `on${util.camelId(id)}Clicked`,
      payload: {
        data,
        event: e,
      },
    });
  };

  const iB = <IconButtonMUI id={id} onClick={handleClick} {...props} ref={ref} />;

  // El span garantiza que el tooltip se verá aunque el botón esté inhabilitado
  return tooltip ? (
    <Tooltip title={tooltip}>
      <span>{iB}</span>
    </Tooltip>
  ) : (
    iB
  );
});

IconButton.propTypes = {
  /** Id for reference */
  id: PropTypes.string.isRequired,
  /** Datos enviados a través de dispatch en el click */
  data: PropTypes.any,
  /** Tooltip text */
  tooltip: PropTypes.string,
};

IconButton.defaultProps = {
  data: null,
};

export default IconButton;
