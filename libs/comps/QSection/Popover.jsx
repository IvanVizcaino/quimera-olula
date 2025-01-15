import PropTypes from "prop-types";
import React from "react";

import { Box, Popover } from "../";

function VariantPopover({ activeSection, anchorEl, className, id, onClose, open, popoverProps }) {
  return (
    <Popover
      id={id}
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: "top", horizontal: "left" }}
      transformOrigin={{ vertical: "top", horizontal: "left" }}
      {...popoverProps}
      // elevation={0}
    >
      <Box className={className} p={0.5}>
        {activeSection}
      </Box>
    </Popover>
    //
  );
}

VariantPopover.propTypes = {
  /** Nodo de sección activa a renderizar dentro del popover */
  activeSection: PropTypes.element,
};

VariantPopover.defaultProps = {};

export default VariantPopover;
