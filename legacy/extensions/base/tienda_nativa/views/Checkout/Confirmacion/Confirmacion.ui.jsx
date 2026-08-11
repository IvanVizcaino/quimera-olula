import { Button, Grid, Typography } from "@quimera/comps";
import { Dialog, DialogActions, DialogContent, DialogTitle, useTranslation } from "@quimera/thirdparty";
import Quimera, { navigate, useStateValue } from "quimera";

function Confirmacion({ useStyles }) {
  const [, dispatch] = useStateValue();
  // const classes = useStyles()
  const { t } = useTranslation();

  return (
    <Quimera.Template id="Confirmacion">
      <Dialog
        open={true}
        keepMounted
        minWidth="sm" fullWidth
      >
        <DialogTitle>
          <Grid container alignItems="center" justifyContent="space-between">
            {t("pedidoConfirmado.titulo")}
          </Grid>
        </DialogTitle>
        <DialogContent dividers={true}>
          <Typography>{t("pedidoConfirmado.parrafo1")}</Typography>
        </DialogContent>
        <DialogActions>
          <Button
            id="confirmacionVolver"
            text={t("pedidoConfirmado.aceptar")}
            color="primary"
            variant="contained"
            onClick={() => navigate("/")}
          />
        </DialogActions>
      </Dialog>

    </Quimera.Template>
  );
}

export default Confirmacion;
