import { makeStyles } from "@quimera/styles";
import { useStateValue, util } from "quimera";

import { Box, Icon } from "../";
import TableCell from "./TableCell";

const useStyles = makeStyles(_theme => ({
  headerWithOrder: {
    cursor: "pointer",
  },
}));

function TableColumn({ align = "left", clickMode, columnType, data = {}, dataDrivenProps, format = value => value, isHeader = false, id, header, height, href, order, orderColumn, tableName, tooltip, value, index, array, ...props }) {
  const classes = useStyles();
  const [, dispatch] = useStateValue();
  // const dispatch = () => { }

  const orderableColumns = ["TextColumn", "DateColumn"];

  const dataDependentProps = dataDrivenProps ? dataDrivenProps(data) : {};
  const hrefProp = dataDependentProps.href || href;
  const valueProp = dataDependentProps.value || (value ? value(data, index, array) : data[id]);
  const tooltipProp =
    dataDependentProps.tooltip ||
    (columnType === "TextColumn" && !tooltip ? format(valueProp) : tooltip);
  const orderProp = order || (orderableColumns.includes(columnType) && id);

  function handleClick() {
    if (!hrefProp && columnType !== "ActionColumn") {
      clickMode === "line"
        ? dispatch({
          type: `on${util.camelId(tableName)}RowClicked`,
          payload: data,
        })
        : dispatch({
          type: `on${util.camelId(tableName)}${util.camelId(id)}Clicked`,
          payload: data,
        });
    }
  }

  const flexAlign = align === "left" ? "flex-start" : align === "right" ? "flex-end" : align;

  return isHeader ? (
    <TableCell
      isHeader={true}
      align={align}
      onClick={() =>
        dispatch({
          type: `on${util.camelId(tableName)}ColumnClicked`,
          payload: { data: { id, order: orderProp } },
        })
      }
      className={orderProp ? classes.headerWithOrder : ""}
      tooltip={header}
      {...props}
    >
      <Box
        component="div"
        height="2em"
        display="flex"
        alignItems="center"
        justifyContent={align}
        width="100%"
      >
        <strong
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {header}
        </strong>
        {orderProp && orderColumn && orderColumn.field === orderProp ? (
          orderColumn.direction === "ASC" ? (
            <Icon fontSize="small">arrow_drop_down</Icon>
          ) : (
            <Icon fontSize="small">arrow_drop_up</Icon>
          )
        ) : null}
      </Box>
    </TableCell>
  ) : (
    <TableCell
      isHeader={false}
      height={height}
      align={align}
      href={href}
      tooltip={tooltipProp}
      onClick={() => handleClick()}
      {...dataDependentProps}
      {...props}
    >
      {format(valueProp)}
    </TableCell>
  );
}

export default TableColumn;
