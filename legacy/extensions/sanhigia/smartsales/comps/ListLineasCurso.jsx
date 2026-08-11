import { Box, QListItem, QTitleBox, Typography } from "@quimera/comps";
import { makeStyles } from "@quimera/styles";

// import { SkewedListItem } from ".";

const useStyles = makeStyles(theme => ({
  box: {
    display: "flex",
    flexDirection: "column",
    gap: "0.03em",
    paddingRight: "10px",
  },
}));

export default function ListLineasCurso({ lineas }) {
  const classes = useStyles();

  // const dataLineas = lineas.idList
  //   .map(id => lineas.dict[id]);

  return (
    <Box className={classes.box}>
      <QTitleBox titulo="Productos">
        {lineas.idList.length > 0 ? (


          Object.values(lineas?.dict ?? {})
            ?.map(curso => {
              return (
                <QListItem
                  key={curso?.idlineaEvento}
                  avatar={{
                    icon: "handyman",
                    color: "",
                  }}
                  tr={curso?.cantidad ?? ""}
                  br={curso?.referencia}
                  // tr={util.formatDate(curso?.fechaIni)}
                  tl={curso?.descripcion}
                />
              );
            })

        ) : (
          <Typography variant="spam" style={{ textAlign: "center", padding: "20px" }}>
            No hay productos
          </Typography>
        )}
        {/* {dataLineas?.map(linea => (
        <SkewedListItem
          key={linea?.referencia}
          text={linea?.descripcion}
          data1={["", `${linea?.referencia}`]}
          type="flex"
        />
      ))} */}
      </QTitleBox>
    </Box>
  );
}
