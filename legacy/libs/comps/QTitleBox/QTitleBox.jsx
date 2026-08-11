import { useWidth } from "quimera";
import { Box, Typography } from "../";

function QTitleBox({ children, titulo, ...props }) {
  const width = useWidth();
  const mobile = ["xs", "sm"].includes(width);
  return (
    <Box mb={1} {...props}>
      <Box ml={mobile ? 1 : null}>
        <Typography variant="overline">{titulo}</Typography>
      </Box>
      {children}
    </Box>
  );
}

export default QTitleBox;
