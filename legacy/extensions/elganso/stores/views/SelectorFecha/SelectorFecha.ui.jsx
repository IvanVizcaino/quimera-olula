import "./SelectorFecha.style.scss";

import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import OutlinedInput from "@mui/material/OutlinedInput";
import Select from "@mui/material/Select";
import { useTheme } from "@mui/material/styles";
import Quimera, { PropValidation, useStateValue } from "quimera";
import { useEffect, useState } from "react";
import { useDbState } from "use-db-state";

import { LoadingGif } from "../../comps";
// import { Grid, Button, Column, Field, Table, Dialog, DialogContent, IconButton, Icon, Typography } from '@quimera/comps'
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

function getStyles(name, yearsSelected, theme) {
  return {
    fontWeight:
      yearsSelected.indexOf(name) === -1
        ? theme.typography.fontWeightRegular
        : theme.typography.fontWeightMedium,
  };
}

function SelectorFecha({ useStyles }) {
  const [state, dispatch] = useStateValue();
  const theme = useTheme();
  const [yearsSelected, setYearsSelected] = useDbState("yearsSelected", "", "ElGansoApp", "Years");
  const [actualYears, setActualYears] = useState([]);
  const { years } = state;

  const getDbInstance = (dbName, storeName) => {
    return new Promise((resolve, reject) => {
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

  useEffect(() => {
    getDbValue("ElGansoApp", "Years", "yearsSelected").then(yearsSelected => {
      setYearsSelected(yearsSelected || []);
      setActualYears(yearsSelected || []);
    });
    dispatch({
      type: "init",
    });
  }, [dispatch]);

  const handleChange = event => {
    const {
      target: { value },
    } = event;
    setActualYears(
      // On autofill we get a stringified value.
      typeof value === "string" ? value.split(",") : value,
    );
  };
  const saveYears = () => {
    setYearsSelected(actualYears);
    dispatch({
      type: "savedYears",
    });
  };
  const render = () => {
    if (years.length <= 0) {
      return <LoadingGif />;
    }

    return (
      <div id="SelectorFecha">
        <div className="content">
          <h2>Cambiar Año</h2>
          <FormControl sx={{ m: 1, width: 300 }}>
            <InputLabel id="year-name-label">Año</InputLabel>
            <Select
              labelId="year-name-label"
              id="multiple-year"
              multiple
              value={actualYears}
              onChange={handleChange}
              input={<OutlinedInput label="Año" />}
              MenuProps={MenuProps}
            >
              {years.map(y => (
                <MenuItem
                  key={y.anno}
                  value={y.anno}
                  style={getStyles(y.anno, yearsSelected, theme)}
                >
                  {y.anno}
                </MenuItem>
              ))}
            </Select>
            <Button variant="contained" onClick={saveYears}>
              Guardar
            </Button>
          </FormControl>
        </div>
      </div>
    );
  };

  return <Quimera.Template id="SelectorFecha">{render()}</Quimera.Template>;
}

SelectorFecha.propTypes = PropValidation.propTypes;
SelectorFecha.defaultProps = PropValidation.defaultProps;
export default SelectorFecha;
