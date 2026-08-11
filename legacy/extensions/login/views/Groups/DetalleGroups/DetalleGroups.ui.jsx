import { Box, DeleteButton, Field, Grid, Icon, QBox, QSection, Typography } from "@quimera/comps";
import Quimera, { useStateValue, useWidth } from "quimera";

import AccessRule from "../../../comps/AccessRule";
import schemas from "../../../static/schemas";

function DetalleGroups({ useStyles }) {
  const [{ groups, groupsBuffer, groupedRules }] = useStateValue();
  const width = useWidth();
  const classes = useStyles();

  const group = groups.dict[groups.current] ?? {};

  const mobile = ["xs", "sm"].includes(width);
  const anchoDetalle = mobile ? 1 : 0.5;

  return (
    <Quimera.Template id="DetalleGroups">
      {groupsBuffer && (
        <QBox
          width={anchoDetalle}
          titulo={`Grupo ${group.id}`}
          botonesCabecera={[{ icon: "arrow_back", id: "atras", text: "Atrás" }]}
        >
          <Box px={0} my={1}>
            <QSection
              title="Grupo"
              actionPrefix="descripcion"
              dynamicComp={() => (
                <Box m={1}>
                  <Field.Schema
                    id="groupsBuffer.id"
                    schema={schemas.group}
                    fullWidth
                    autoFocus
                    disabled
                  />
                  <Field.Schema
                    id="groupsBuffer.descripcion"
                    schema={schemas.group}
                    fullWidth
                    autoFocus
                  />
                </Box>
              )}
              saveDisabled={() => groupsBuffer.id === "" || groupsBuffer.nombre === ""}
            >
              <Box display="flex" alignItems="center" m={1}>
                <Icon color="action" fontSize="default" style={{ marginRight: "5px" }}>
                  people
                </Icon>
                <Typography variant="h5">{group.descripcion}</Typography>
              </Box>
            </QSection>
          </Box>

          <Field.Text
            id="filtroReglas"
            placeholder="Filtrar"
            fullWidth
            startAdornment={<Icon>filter_alt</Icon>}
            style={{ marginBottom: "7.5px" }}
          />

          <AccessRule rule={groupedRules?.general?.[0]} heading={true} general={true} />
          <hr />
          {Object.keys(groupedRules ?? {})
            ?.filter(grupo => grupo !== "general" && groupedRules[grupo].length > 1)
            ?.map(grupo => (
              <details key={grupo}>
                <summary style={{ listStyle: "none" }}>
                  <AccessRule
                    key={grupo}
                    rule={groupedRules?.[grupo]?.find(rule => rule.idRegla === rule.grupo)}
                    heading={true}
                  />
                  <hr />
                </summary>
                {groupedRules?.[grupo]
                  ?.filter(regla => regla.idRegla !== regla.grupo)
                  ?.map(regla => (
                    <AccessRule key={regla.idRegla} rule={regla} />
                  ))}
                <hr />
              </details>
            ))}

          <Grid container size={12} justifyContent="center">
            <Grid size={4}>
              <QSection
                actionPrefix="eliminarGrupo"
                title="Eliminar grupo"
                focusStyle="button"
                dynamicComp={() => (
                  <Box display="flex" flexDirection="column" px={2} py={1}>
                    <Typography variant="subtitle2" className={classes.deleteText}>
                      Se va a eliminar el grupo.
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

export default DetalleGroups;
