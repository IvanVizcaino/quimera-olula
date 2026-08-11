import "./NewInventario.style.scss";

import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { Button, Field, Grid } from "@quimera/comps";
import { navigate } from "hookrouter";
import Quimera, { PropValidation, useStateValue } from "quimera";
import { useCallback, useEffect, useState } from "react";
import { useDbState } from "use-db-state";

const getDbInstance = (dbName, storeName) => {
  return new Promise((resolve, reject) => {
    // const storageVersion = localStorage.getItem("indexDbVersion");
    // const version = storageVersion === null ? 1 : parseInt(storageVersion, 10) + 1;
    // localStorage.setItem("indexDbVersion", version);

    const request = indexedDB.open(dbName, 1);

    request.onupgradeneeded = event => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: "id" });
      }
    };

    request.onsuccess = event => {
      resolve(event.target.result);
    };

    request.onerror = event => {
      reject(event.target.error);
    };
  });
};

const getDbValue = async (dbName, storeName, key) => {
  const db = await getDbInstance(dbName, storeName);

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], "readonly");
    const objectStore = transaction.objectStore(storeName);
    const request = objectStore.get(key);

    request.onsuccess = event => {
      resolve(event.target.result ? event.target.result.value : undefined);
    };

    request.onerror = event => {
      reject(event.target.error);
    };
  });
};

function NewInventario() {
  const [optionsSuperfamilias, setOptionsSuperfamilias] = useState([]);
  const [optionsFamilias, setOptionsFamilias] = useState([]);
  const [optionsGruposmoda, setOptionsGruposmoda] = useState([]);
  const [optionsAnnos, setOptionsAnnos] = useState([]);
  const [optionsTemporada, setOptionsTemporada] = useState([]);
  const [state, dispatch] = useStateValue();
  const [inventariosDbIndex, setInventariosDbIndex] = useDbState(
    "inventariosDbIndex",
    "",
    "ElGansoAppInv",
    "Inventarios",
  );

  const {
    annos,
    articulos,
    familias,
    gruposmoda,
    inventario,
    inventarioTotal,
    superfamilias,
    temporadas,
  } = state;

  useEffect(() => {
    dispatch({
      type: "init",
    });

    // Guardar funcion actualizar datos en un state
    dispatch({
      type: "setIndexDb",
      payload: {
        inventariosDbIndex,
        setInventariosDbIndex,
      },
    });

    // Obtener inventarios
    getDbValue("ElGansoAppInv", "Inventarios", "inventariosDbIndex").then(inventariosIndexados => {
      setInventariosDbIndex(inventariosIndexados);
      dispatch({
        type: "setInventariosDbIndex",
        payload: {
          inventariosIndexados,
        },
      });
    });
  }, [dispatch]);

  const getOptionsSuperfamilias = useCallback(data => {
    const aux = [];

    if (data && data.length > 0) {
      data.forEach(item => {
        aux.push({
          key: item.codtipoprenda,
          value: `${item.codtipoprenda}-${item.descripcion}`,
          option: item,
        });
      });
    }

    setOptionsSuperfamilias(aux);
  }, []);
  const getOptionsFamilias = useCallback(data => {
    const aux = [];

    if (data && data.length > 0) {
      data.forEach(item => {
        aux.push({
          key: item.codfamilia,
          value: `${item.codfamilia}-${item.descripcion}`,
          option: item,
        });
      });
    }

    setOptionsFamilias(aux);
  }, []);
  const getOptionsGruposmoda = useCallback(data => {
    const aux = [];

    if (data && data.length > 0) {
      data.forEach(item => {
        aux.push({
          key: item.codgrupomoda,
          value: `${item.codgrupomoda}-${item.descripcion}`,
          option: item,
        });
      });
    }

    setOptionsGruposmoda(aux);
  }, []);
  const getOptionsTemporada = useCallback(data => {
    const aux = [];

    if (data && data.length > 0) {
      data.forEach(item => {
        aux.push({
          key: item.codtemporada,
          value: `${item.codtemporada}-${item.descripcion}`,
          option: item,
        });
      });
    }

    setOptionsTemporada(aux);
  }, []);
  const getOptionsAnnos = useCallback(data => {
    const aux = [];

    if (data && data.length > 0) {
      data.forEach(item => {
        aux.push({
          key: item.anno,
          value: item.anno,
          option: item,
        });
      });
    }

    setOptionsAnnos(aux);
  }, []);

  useEffect(() => {
    getOptionsSuperfamilias(superfamilias);
  }, [superfamilias, getOptionsSuperfamilias]);
  useEffect(() => {
    getOptionsFamilias(familias);
  }, [familias, getOptionsFamilias]);
  useEffect(() => {
    getOptionsGruposmoda(gruposmoda);
  }, [gruposmoda, getOptionsGruposmoda]);
  useEffect(() => {
    getOptionsTemporada(temporadas);
  }, [temporadas, getOptionsTemporada]);
  useEffect(() => {
    getOptionsAnnos(annos);
  }, [annos, getOptionsAnnos]);

  const render = () => {
    return (
      <div id="NewInventario" className="page-container">
        <h2 className="main">Nuevo Inventario</h2>

        <div className="form-container">
          <div className="form-content">
            <Grid container spacing={2}>
              <Grid container spacing={2}>
                <Grid size={6}>
                  <Field.Date id="inventario.fecha" label="Fecha" fullWidth disabled />
                </Grid>
                <Grid size={6}>
                  <Field.Time id="inventario.hora" label="Hora" fullWidth disabled />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Field.Text
                    id="inventario.descripcion"
                    label="Descripcion"
                    fullWidth
                    autoFocus={true}
                    required={true}
                    onChange={e =>
                      dispatch({
                        type: "setStateInventarioValue",
                        payload: {
                          key: "descripcion",
                          data: e.target.value,
                        },
                      })
                    }
                  />
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid size={12} className="container-inventario-total">
                  <Field.CheckBox
                    id="inventario.inventarioTotal"
                    label="Inventario Total"
                    checked={inventarioTotal}
                    onClick={() => {
                      dispatch({
                        type: "onCheckboxInventarioClicked",
                      });
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Field.Select
                    id="inventario.superfamilia"
                    getOptions={getOptionsSuperfamilias}
                    onChange={e =>
                      dispatch({
                        type: "setStateInventarioValue",
                        payload: {
                          key: "superfamilia",
                          data: e.target.value === null ? null : e.target.value.key,
                        },
                      })
                    }
                    options={optionsSuperfamilias}
                    translateOptions={false}
                    label="Superfamilia"
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Field.Select
                    id="inventario.familia"
                    getOptions={getOptionsFamilias}
                    onChange={e =>
                      dispatch({
                        type: "setStateInventarioValue",
                        payload: {
                          key: "familia",
                          data: e.target.value === null ? null : e.target.value.key,
                        },
                      })
                    }
                    options={optionsFamilias}
                    translateOptions={false}
                    label="Familia"
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Field.Select
                    id="inventario.grupomoda"
                    getOptions={getOptionsGruposmoda}
                    onChange={e =>
                      dispatch({
                        type: "setStateInventarioValue",
                        payload: {
                          key: "grupomoda",
                          data: e.target.value === null ? null : e.target.value.key,
                        },
                      })
                    }
                    options={optionsGruposmoda}
                    translateOptions={false}
                    label="G.Moda"
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Field.Select
                    id="inventario.anno"
                    getOptions={getOptionsAnnos}
                    onChange={e =>
                      dispatch({
                        type: "setStateInventarioValue",
                        payload: {
                          key: "anno",
                          data: e.target.value === null ? null : e.target.value.key,
                        },
                      })
                    }
                    options={optionsAnnos}
                    translateOptions={false}
                    label="Año"
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Field.Select
                    id="inventario.temporada"
                    getOptions={getOptionsTemporada}
                    onChange={e =>
                      dispatch({
                        type: "setStateInventarioValue",
                        payload: {
                          key: "temporada",
                          data: e.target.value === null ? null : e.target.value.key,
                        },
                      })
                    }
                    options={optionsTemporada}
                    translateOptions={false}
                    label="Temporada"
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Autocomplete
                    disablePortal
                    id="combo-box-standard"
                    options={articulos.map(option => option)}
                    getOptionLabel={option => `${option.referencia}-${option.descripcion}`}
                    renderOption={(props, option) => {
                      return (
                        <li {...props} key={option.referencia}>
                          {`${option.referencia}-${option.descripcion}`}
                        </li>
                      );
                    }}
                    renderInput={params => (
                      <TextField {...params} variant="standard" label="Referencia" />
                    )}
                    isOptionEqualToValue={(option, value) => option.referencia === value.referencia}
                    onChange={(e, option) => {
                      dispatch({
                        type: "setStateInventarioValue",
                        payload: {
                          key: "referencia",
                          data: option === null ? null : option.referencia,
                        },
                      });
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>
          </div>
          <div className="form-buttons">
            <Button
              id="cancelarNuevoInventario"
              color="secondary"
              variant="text"
              text={"Cancelar"}
              onClick={() => {
                navigate("/inventarios");
              }}
            />

            <Button
              id="crearNuevoInventario"
              color="primary"
              variant="text"
              text={"Crear"}
              disabled={!inventario.descripcion}
            />
          </div>
        </div>
      </div>
    );
  };

  return <Quimera.Template id="NewInventario">{render()}</Quimera.Template>;
}

NewInventario.propTypes = PropValidation.propTypes;
NewInventario.defaultProps = PropValidation.defaultProps;
export default NewInventario;
