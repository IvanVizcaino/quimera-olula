import { Box, Grid, Typography } from "@quimera/comps";
import { clsx, makeStyles } from "@quimera/styles";
import Quimera, { useStateValue, util } from "quimera";
import { useEffect } from "react";

const useStyles = makeStyles(theme => ({
  root: {
    marginTop: "0px",
  },
  gridItems: {
    padding: "20px 40px 20px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  header: {
    height: "8vh",
    background: "linear-gradient(60deg, #ab47bc, #8e24aa)",
    color: "#FFF",
  },
  body: {
    height: "86vh",
    // background: "linear-gradient(60deg, #ab47bc, #8e24aa)",
    // color: "#FFF",
  },
  footer: {
    height: "6vh",
    background: "linear-gradient(60deg, #ab47bc, #8e24aa)",
    color: "#FFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "40px",
  },
  typography: {
    fontWeight: "700",
  },
  logo: {
    filter: "brightness(0) invert(1)",
    transform: "scale(0.7)",
  },
  login: {
    "color": "#FFF",
    "textDecoration": "none",
    "transform": "scale(1.25)",
    "transition": "all .4s ease-in-out",
    "border": "1px solid #FFF",
    "padding": "5px 10px",
    "borderRadius": "5px",
    "&:hover": {
      transform: "scale(1.35)",
      cursor: "pointer",
    },
  },
  link: {
    "color": "#FFF",
    "textDecoration": "none",
    "transform": "scale(1.25)",
    "transition": "all .4s ease-in-out",
    "&:hover": {
      transform: "scale(1.35)",
      cursor: "pointer",
    },
  },
}));

function Welcome({ onLogin, ...props }) {
  const [{ autenticado, autenticando, error, loginUser }, dispatch] = useStateValue();
  useEffect(() => {
    dispatch({
      type: "onInit",
      payload: {
        onLogin,
        ...props,
      },
    });
  }, []);

  useEffect(() => {
    autenticado && !!onLogin && onLogin();
  }, [autenticado]);
  const classes = useStyles();
  const environment = util.getEnvironment();
  const linkPoliticaPrivacidad = environment?.loginLinks?.politicaPrivacidad;
  const linkTerminosCondiciones = environment?.loginLinks?.terminosCondiciones;

  return (
    <Quimera.Template id="Welcome">
      <Grid container justifyContent="center" className={classes.root}>
        <Grid size={12}>
          <Grid container direction="column">
            <Grid className={clsx(classes.gridItems, classes.header)}>
              <img
                width="150px"
                src="/img/logo.png"
                alt="SmartSales logo"
                className={classes.logo}
                style={{
                  marginLeft: "-20px",
                }}
              />
              <Box onClick={() => dispatch({ type: "onLinkClicked", payload: { link: "/login" } })}>
                <Typography variant="h2" className={classes.login}>
                  Inicio de sesión
                </Typography>
              </Box>
            </Grid>
            <Grid className={clsx(classes.gridItems, classes.body)}></Grid>
            <Grid className={classes.footer}>
              {linkPoliticaPrivacidad && (
                <Grid>
                  <Box
                    onClick={() =>
                      dispatch({ type: "onLinkClicked", payload: { link: linkPoliticaPrivacidad } })
                    }
                  >
                    <Typography variant="h2" className={classes.link}>
                      Política de privacidad
                    </Typography>
                  </Box>
                </Grid>
              )}
              {linkTerminosCondiciones && (
                <Grid>
                  <Box
                    onClick={() =>
                      dispatch({
                        type: "onLinkClicked",
                        payload: { link: linkTerminosCondiciones },
                      })
                    }
                  >
                    <Typography variant="h2" className={classes.link}>
                      Aviso legal
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Quimera.Template>
  );
}

export default Welcome;
