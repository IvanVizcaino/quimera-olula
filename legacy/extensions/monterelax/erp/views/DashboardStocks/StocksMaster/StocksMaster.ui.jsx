import { Avatar, Backdrop, Box, CircularProgress, QBox, Typography } from "@quimera/comps";
import { Grid, List, ListItem, ListItemAvatar, ListItemText } from "@quimera/thirdparty";
import Quimera, { useStateValue, useWidth, util } from "quimera";

function StocksMaster({ useStyles }) {
  const [{ cargandoDatos, stocks, stocksPedido }, dispatch] = useStateValue();
  const classes = useStyles();

  const width = useWidth();
  const mobile = ["xs", "sm"].includes(width);
  const anchoDetalle = mobile ? 1 : 0.5;
  const desktop = !mobile;

  const baseImageSrc = util.getEnvironment().getUrlImages();
  const noImage = `${baseImageSrc}/noimage.png`;

  return (
    <Quimera.Template id="StocksMaster">
      <Box width={anchoDetalle} mx={desktop ? 1 : 0}>
        <Backdrop open={cargandoDatos} style={{ zIndex: 999 }}>
          Cargando disponibles&nbsp;&nbsp;
          <CircularProgress color="inherit" />
        </Backdrop>
        <QBox
          titulo="UP de Stock disponibles"
          botones={[
            {
              id: "checkout",
              icon: "shopping_cart",
              disabled: stocksPedido.length === 0,
              badgeVisible: stocksPedido.length > 0,
              badgeContent: stocksPedido.length,
            },
          ]}
        >
          {!cargandoDatos && <Quimera.SubView id="DashboardStocks/FiltroMaster" />}
          <List>
            {stocks.idList.map(idStock => (
              <ListItem
                key={idStock}
                className={idStock === stocks.current ? classes.cardSelected : classes.card}
                divider
                onClick={() =>
                  dispatch({ type: "onStocksClicked", payload: { item: stocks.dict[idStock] } })
                }
              >
                <ListItemAvatar>
                  <Grid container justifyContent="center" spacing={1}>
                    <Grid size="grow">
                      <Avatar className={classes.greenBox}>
                        {stocks.dict[idStock].canterminadas}
                      </Avatar>
                    </Grid>
                    <Grid size="grow">
                      <Avatar className={classes.yellowBox}>
                        {stocks.dict[idStock].cancosidas}
                      </Avatar>
                    </Grid>
                  </Grid>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography>
                      <strong>{stocks.dict[idStock].modelo}</strong>
                      {` ${stocks.dict[idStock].configuracion}`}
                    </Typography>
                  }
                  secondary={<Typography>{stocks.dict[idStock].tela}</Typography>}
                  // secondary={s.telas}
                  style={{ paddingLeft: "12px" }}
                ></ListItemText>
                <ListItemAvatar>
                  <Box
                    border={0}
                    borderColor="blue"
                    style={{ overflow: "hidden", gap: 10 }}
                    display="flex"
                    justifyContent="flex-end"
                    bgColor="red"
                    width={1}
                  >
                    <img
                      src={`${baseImageSrc}/telas/${stocks.dict[idStock].tela}.jpg`}
                      onError={({ currentTarget }) => {
                        currentTarget.onerror = null; // prevents looping
                        currentTarget.src = noImage;
                      }}
                      width={60}
                      alt="poner nombre"
                      loading="lazy"
                    />
                    <img
                      src={`${baseImageSrc}/modelos/${stocks.dict[
                        idStock
                      ].modelo.toUpperCase()}.jpg`}
                      onError={({ currentTarget }) => {
                        currentTarget.onerror = null; // prevents looping
                        currentTarget.src = noImage;
                      }}
                      width={60}
                      alt="poner nombre"
                      loading="lazy"
                    />
                  </Box>
                </ListItemAvatar>
              </ListItem>
            ))}
          </List>
        </QBox>
      </Box>
    </Quimera.Template>
  );
}

export default StocksMaster;
