import { Box, DeleteButton, Field, Grid, Icon, QBox, QSection, Typography } from "@quimera/comps";
import Quimera, { getSchemas, useStateValue, useWidth } from "quimera";

import SelectGroup from "../../../comps/SelectGroup";

function DetalleUsers({ useStyles }) {
  const [{ users, usersBuffer }] = useStateValue();
  const classes = useStyles();
  const width = useWidth();

  const schemas = getSchemas();

  const user = users.dict[users.current] ?? {};

  const mobile = ["xs", "sm"].includes(width);
  const anchoDetalle = mobile ? 1 : 0.5;

  return (
    <Quimera.Template id="DetalleUsers">
      {usersBuffer && (
        <QBox
          width={anchoDetalle}
          titulo={`Usuario ${user.id}`}
          botonesCabecera={[{ icon: "arrow_back", id: "atras", text: "Atrás" }]}
        >
          <Box px={0} my={1}>
            <QSection
              title="Usuario"
              actionPrefix="nombre"
              dynamicComp={() => (
                <Box m={1}>
                  <Field.Schema
                    id="usersBuffer.id"
                    schema={schemas.user}
                    fullWidth
                    autoFocus
                    disabled
                  />
                  <Field.Schema id="usersBuffer.nombre" schema={schemas.user} fullWidth autoFocus />
                </Box>
              )}
              saveDisabled={() => usersBuffer.id === "" || usersBuffer.nombre === ""}
            >
              <Box display="flex" alignItems="center" m={1}>
                <Icon color="action" fontSize="default" style={{ marginRight: "5px" }}>
                  person
                </Icon>
                <Typography variant="h5">{user.nombre}</Typography>
              </Box>
            </QSection>
            <QSection
              title="Correo electrónico"
              actionPrefix="email"
              dynamicComp={() => (
                <Box m={1}>
                  <Field.Schema id="usersBuffer.email" schema={schemas.user} fullWidth autoFocus />
                </Box>
              )}
              saveDisabled={() => usersBuffer.email === ""}
            >
              <Box display="flex" alignItems="center" m={1}>
                <Icon color="action" fontSize="default" style={{ marginRight: "5px" }}>
                  mail_outline
                </Icon>
                <Typography>{user.email}</Typography>
              </Box>
            </QSection>
          </Box>

          <Quimera.Block id="extraDataUser" />

          <SelectGroup id="usersBuffer.idgroup" value={usersBuffer?.idgroup ?? 0} />

          <Grid container size={12} justifyContent="center">
            <Grid size={4}>
              <QSection
                actionPrefix="eliminarUsuario"
                title="Eliminar usuario"
                focusStyle="button"
                dynamicComp={() => (
                  <Box display="flex" flexDirection="column" px={2} py={1}>
                    <Typography variant="subtitle2" className={classes.deleteText}>
                      Se va a eliminar el usuario.
                    </Typography>
                    <Typography variant="subtitle2">¿Desea continuar?</Typography>
                  </Box>
                )}
                cancel={{
                  className: classes.deleteCancelButton,
                }}
                save={{
                  icon: <Icon>delete</Icon>,
                  text: "Eliminar",
                  className: classes.deleteText,
                }}
              >
                <Box display="flex" justifyContent="center" p={1}>
                  <DeleteButton variant="outlined" />
                </Box>
              </QSection>
            </Grid>
          </Grid>
        </QBox>
      )}
    </Quimera.Template>
  );
}

export default DetalleUsers;
