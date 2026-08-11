import { Button, Field, Grid, Icon, Paper, Typography } from "@quimera/comps";
import { clsx, makeStyles } from "@quimera/styles";
import Quimera from "quimera";

const useStyles = makeStyles(theme => ({
  root: {
    marginTop: "40px",
  },
  gridItems: {
    margin: theme.spacing(2),
    textAlign: "center",
  },
  header: {
    flexBasis: "100px",
    background: "linear-gradient(60deg, #ab47bc, #8e24aa)",
    marginTop: "-40px",
    color: "#FFF",
    boxShadow:
      "0 12px 20px -10px rgba(156, 39, 176, 0.28), 0 4px 20px 0px rgba(0, 0, 0, 0.12), 0 7px 8px -5px rgba(156, 39, 176, 0.2)",
    borderRadius: "3px",
    padding: "40px",
  },
  typography: {
    fontWeight: "700",
  },
}));

function Signup() {
  const classes = useStyles();

  return (
    <Quimera.Template id="Signup">
      <Grid container justifyContent="center" className={classes.root}>
        <Grid size={{ xs: 11, sm: 8, md: 4, lg: 3, xl: 2 }}>
          <Paper>
            <Grid container direction="column">
              <Grid size="grow" className={clsx(classes.gridItems, classes.header)}>
                <Typography className={classes.typography} variant="h5">
                  Suscríbete
                </Typography>
              </Grid>
              <Grid size="grow" className={classes.gridItems}>
                <Field.Text
                  id="user"
                  label="Usuario"
                  fullWidth
                  startAdornment={<Icon>personrounded</Icon>}
                />
              </Grid>
              <Grid size="grow" className={classes.gridItems}>
                <Field.Text
                  id="email"
                  label="E-mail"
                  fullWidth
                  startAdornment={<Icon>emailrounded</Icon>}
                />
              </Grid>
              <Grid size="grow" className={classes.gridItems}>
                <Field.Password
                  id="pass"
                  label="Contraseña"
                  fullWidth
                  startAdornment={<Icon>lockrounded</Icon>}
                />
              </Grid>
              <Grid size={12} className={classes.gridItems}>
                <Button id="registrarLogin" text="REGISTRO" variant="text" />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Quimera.Template>
  );
}

export default Signup;
