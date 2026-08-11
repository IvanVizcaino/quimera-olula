import { makeStyles } from "@quimera/styles";
import { useStateValue, util } from "quimera";

import { Collapse, ListItem } from "../";

const useStyles = makeStyles(theme => ({
  card: {
    borderBottom: `1px solid ${theme.palette.grey[400]}`,
    paddingLeft: "5px", paddingRight: "5px"
  },
  cardSelected: {
    borderBottom: `2px solid ${theme.palette.secondary.main}`,
    borderTop: `2px solid ${theme.palette.secondary.main}`,
    paddingLeft: "5px", paddingRight: "5px"
  },
}));

function QListItemModel({ children, model, modelName, selected, ...props }) {
  const [_, dispatch] = useStateValue();
  const classes = useStyles();

  return (
    <Collapse in={model?._status !== "deleted"} appear={model?._status === "new"}>
      <ListItem
        className={selected ? classes.cardSelected : classes.card}
        disableGutters
        onClick={() =>
          dispatch({ type: `on${util.camelId(modelName)}ItemSelected`, payload: { item: model } })
        }
        {...props}
      >
        {children}
      </ListItem>
    </Collapse>
  );
}

export default QListItemModel;
