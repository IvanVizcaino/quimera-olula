import { Box, Dialog, DialogContent, DialogTitle, Grid, Icon, IconButton } from "@quimera/comps";
import { Trans, useTranslation } from "@quimera/thirdparty";
import Quimera, { useAppValue, useStateValue } from "quimera";

function CondicionesVenta({ useStyles, ...props }) {
  const classes = useStyles();
  const [state, appDispatch] = useAppValue();

  const [_, dispatch] = useStateValue();
  const { t } = useTranslation();

  return (
    <Quimera.Template id="CondicionesVenta">
      <Dialog open={true} minWidth="sm" fullWidth>
        <DialogTitle>
          <Grid container alignItems="center" justifyContent="space-between">
            {t("condicionesVenta.titulo")}
            <IconButton
              id="cerrar"
              size="small"
              alt="Cerrar"
              onClick={() =>
                appDispatch({
                  type: "setModalVisible",
                  payload: { name: null },
                })
              }
            // onClick={() => dispatch({ type: "onVerCondicionesVentaClicked" })}
            >
              <Icon title="Cerrar">close</Icon>
            </IconButton>
          </Grid>
        </DialogTitle>
        <DialogContent dividers={true}>
          <Trans i18nKey="condicionesVenta.parrafo1" />
          <Trans i18nKey="condicionesVenta.parrafo2" />
          <Trans i18nKey="condicionesVenta.parrafo3" />
          <Trans i18nKey="condicionesVenta.parrafo4" />
          <Trans i18nKey="condicionesVenta.parrafo5" />
          <Trans i18nKey="condicionesVenta.parrafo6" />
          <Box display={"flex"} justifyContent={"center"} alignItems={"flex-end"}>
            <Trans i18nKey="condicionesVenta.footer" />
          </Box>
        </DialogContent>
      </Dialog>
    </Quimera.Template>
  );
}

export default CondicionesVenta;
