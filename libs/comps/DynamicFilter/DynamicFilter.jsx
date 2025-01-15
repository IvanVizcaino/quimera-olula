import { Autocomplete, Box, Chip, TextField } from "@quimera/thirdparty";
import PropTypes from "prop-types";
import { useStateValue, util } from "quimera";
import React, { useEffect, useState } from "react";

import { Icon, IconButton } from "../";
import { ChipAPIField, ChipDate } from "./Chips";
import { ChipLabel } from "./Chips/ChipLabel";
import {
  cargarFiltro,
  filtrosPredAFiltrosAdaptados,
  generarFiltro,
  volcarFiltro,
} from "./funciones";
import {
  PopoverAPIField,
  PopoverBoolean,
  PopoverCheckBoxMultiple,
  PopoverDate,
  PopoverNumber,
  PopoverTexto,
} from "./Popovers";

function DynamicFilter({
  id,
  propiedades,
  valores,
  filtrosPredefinidos,
  textFieldProps,
  disabled,
  InputProps,
  maxChipWidth,
  ...props
}) {
  const [, dispatch] = useStateValue();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [autocompleteValue, setAutocompleteValue] = useState([]);
  const [opcionesAutocomplete, setOpcionesAutocomplete] = useState(propiedades);
  const [textFieldAutocompleteValue, setTextFieldAutocompleteValue] = useState("");

  const handleChipClick = (event, option) => {
    setAnchorEl(event.currentTarget);
    setSelectedOption(option);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
    setSelectedOption(null);
  };

  const hacerYAplicarFiltro = (opciones, _action) => {
    const filtroAGuardar = opciones.length === 0 ? null : volcarFiltro(opciones, propiedades);
    util.setLastFilter(`${id}`, filtroAGuardar);
    // opciones.length === 0 ? util.setLastFilter(`${id}`, null) : util.setLastFilter(`${id}`, opciones)
    const filtro = generarFiltro(opciones, propiedades);
    dispatch({
      type: `on${util.camelId(id)}Changed`,
      payload: { field: util.lastStateField(id), value: filtro },
    });
  };

  const handleAutocompleteChange = (event, value, _reason) => {
    event.preventDefault();
    // SI seleccionamos un campo de DynamicFilter (solo dailyjob)
    const newVAl = value.filter(e => !autocompleteValue.find(a => e.key === a.key))[0];
    if (newVAl && newVAl.tipo !== "normal") {
      // para filtros predefinidos de dailyjob
      setAutocompleteValue(newVAl.propiedades);
      hacerYAplicarFiltro(newVAl.propiedades, "aplicar_filtro_de_filtros");

      return;
    }

    // NEW IN TESTING: si queremos que se puedan borrar los chips con el teclado:
    if (value.length < autocompleteValue.length) {
      setAutocompleteValue(value);
      hacerYAplicarFiltro(value, "borrar con tecla");
      document.getElementById(`${id}Autocomplete`).blur();

      return;
    }
    // estamos añadiendo uno:
    setAnchorEl(/* event.currentTarget */ document.getElementById(`${id}Autocomplete`));
    // setSelectedOption(autocompleteValue.filter(x => value.includes(x)[0]))
    // alert(value.filter(e => !autocompleteValue.find(a => e.nombreCampo === a.nombreCampo))[0].nombreCampo)
    // setAutocompleteValue(value)
    setSelectedOption(
      value.filter(e => !autocompleteValue.find(a => e.nombreCampo === a.nombreCampo))[0],
    );
  };

  const handleChipDelete = (_event, option) => {
    setAnchorEl(null);
    setSelectedOption(null);
    const newAutocompleteValue = autocompleteValue.filter(
      el => el.nombreCampo !== option.nombreCampo,
    );
    setAutocompleteValue(newAutocompleteValue); // borramos la option del chip
    hacerYAplicarFiltro(newAutocompleteValue, "borrar");
  };

  const alAplicar = value => {
    if (value === "") {
      setAnchorEl(null);
      setSelectedOption(null);

      return;
    }
    const foundOption = autocompleteValue.filter(
      el => el.nombreCampo === selectedOption.nombreCampo,
    )[0];
    const aCambiar = Object.assign({}, selectedOption); // copiamos la option que vamos a cambiar
    const nuevosValores = autocompleteValue.slice(); // copiamos

    switch (selectedOption.tipoCampo) {
      case "string":
        aCambiar.value = value;
        break;

      case "checkboxmultiple":
        aCambiar.value = value.chipValue;
        aCambiar.opciones = value.opciones;
        break;

      case "notnull":
      case "null":
      case "boolean":
        aCambiar.value = value;
        break;

      case "apiselect":
        aCambiar.value = value;
        break;

      case "date":
        aCambiar.value = value;
        break;

      case "number":
        aCambiar.value = value.value;
        aCambiar.signo = value.signo;
        break;

      default:
        alert("Error en DynamicFilter, tipoCampo incorrecto.");
        break;
    }

    if (foundOption !== undefined) {
      // si estamos editando un chip existente
      nuevosValores[nuevosValores.findIndex(el => el.nombreCampo === selectedOption.nombreCampo)] =
        aCambiar;
    } else {
      // si estamos añadiendo un nuevo chip
      nuevosValores.push(aCambiar);
    }
    setAutocompleteValue(nuevosValores);
    setAnchorEl(null);
    setSelectedOption(null);
    hacerYAplicarFiltro(nuevosValores, "aplicar");
  };

  const handleTextFieldKey = event => {
    // si pulsamos intro al escribir algo y tenemos option de por defecto, filtra por ese campo
    if (
      event.keyCode === 13 &&
      !autocompleteValue.find(prop => prop.porDefecto === true) &&
      event.target.value.length > 0
    ) {
      // const newOption = Object.assign({}, propiedades.find(prop => prop.porDefecto === true)) // copiamos el objeto
      const newOption = { ...propiedades.find(prop => prop.porDefecto === true) }; // copiamos el objeto
      newOption.value = textFieldAutocompleteValue;
      const nuevosValores = autocompleteValue.slice();
      nuevosValores.push(newOption);
      setAutocompleteValue(nuevosValores);
      setTextFieldAutocompleteValue("");
      hacerYAplicarFiltro(nuevosValores, "introDefault");
      document.getElementById(`${id}Autocomplete`).blur(); // para perder el foco en el autocomplete cuando demos enter, queda mejor
    }
  };

  const filtrarOpcionesSeleccionadas = (selectedOptions, state) => {
    // si buscamos que nos filtre por lo que buscamos y quite las ya seleccionadas
    const { inputValue } = state;
    // para cuando ya tengamos una option seleccionada esta no salga en la lista de nuevo
    let nonSelectedOptions = selectedOptions.filter(
      op => autocompleteValue.findIndex(op2 => op2.key === op.key) === -1,
    );
    // filtramos por el input
    nonSelectedOptions =
      inputValue !== ""
        ? nonSelectedOptions.filter(op =>
            op.labelNombre.toUpperCase().includes(inputValue.toUpperCase()),
          )
        : nonSelectedOptions;

    return nonSelectedOptions;
  };

  useEffect(() => {
    // convertimos los filtros predefinidos de la tabla sisfilter (solo para dailyjob)
    const filtrosPredefinidosAdaptados = filtrosPredAFiltrosAdaptados(
      propiedades,
      filtrosPredefinidos,
    );
    filtrosPredefinidosAdaptados.forEach(v => {
      v.tipo = "filtroDeFiltros";
    });
    filtrosPredefinidosAdaptados.forEach(v => {
      propiedades.unshift(v);
    });
    propiedades.map((prop, index) => {
      prop.key = index; /* ; prop.value = '' */
    });
    setOpcionesAutocomplete(propiedades);
  }, [filtrosPredefinidos]);

  useEffect(() => {
    if (valores) {
      const filtro = cargarFiltro(valores, propiedades);
      setAutocompleteValue(filtro);
      hacerYAplicarFiltro(filtro, "memoria");
    } else {
      const filtroGuardado = util.getLastFilter(`${id}`);
      if (filtroGuardado) {
        const filtro = Array.isArray(filtroGuardado)
          ? filtroGuardado
          : cargarFiltro(filtroGuardado, propiedades);
        setAutocompleteValue(filtro);
        hacerYAplicarFiltro(filtro, "memoria");
      }
    }
  }, []);

  return (
    <>
      <Box display="flex" alignItems="flex-end">
        <Box flexGrow={0}>
          <IconButton
            id={`${id}Icono`}
            size="small"
            onClick={() => {
              document.getElementById(`${id}Autocomplete`).click();
            }}
          >
            <Icon style={{ color: "#293333" }}>filter_alt</Icon>
          </IconButton>
        </Box>
        <Box flexGrow={1}>
          <Autocomplete
            value={autocompleteValue}
            multiple
            id={`${id}Autocomplete`}
            variant="standard"
            disableClearable
            options={opcionesAutocomplete}
            onChange={handleAutocompleteChange}
            noOptionsText={
              opcionesAutocomplete.find(prop => prop.porDefecto === true)
                ? autocompleteValue.find(prop => prop.porDefecto === true)
                  ? ""
                  : `${
                      opcionesAutocomplete.find(prop => prop.porDefecto === true).labelChip
                    } ${textFieldAutocompleteValue} (Pulsa intro)`
                : ""
            }
            getOptionLabel={option => option.labelNombre}
            renderOption={option =>
              option.tipo === "filtroDeFiltros" ? (
                <div
                  style={
                    option.labelNombre.substring(0, 1) !== "*"
                      ? { color: "black", fontStyle: "italic" }
                      : { color: "black", fontWeight: 1000 }
                  }
                >
                  {option.labelNombre.substring(0, 1) !== "*"
                    ? `*${option.labelNombre}`
                    : `${option.labelNombre}`}
                </div>
              ) : (
                <div style={{ color: "black" }}>{`${option.labelNombre}`}</div>
              )
            }
            filterOptions={filtrarOpcionesSeleccionadas}
            renderTags={(value, getTagProps) =>
              value.map((option, index) =>
                option.tipoCampo === "apiselect" ? (
                  <ChipAPIField
                    option={option}
                    onClick={handleChipClick}
                    alEliminar={handleChipDelete}
                    key={index}
                    clave={index}
                    getTagProps={getTagProps}
                    disabled={disabled}
                    maxWidth={maxChipWidth}
                  />
                ) : option.tipoCampo === "date" ? (
                  <ChipDate
                    option={option}
                    onClick={handleChipClick}
                    alEliminar={handleChipDelete}
                    key={index}
                    clave={index}
                    getTagProps={getTagProps}
                    disabled={disabled}
                    maxWidth={maxChipWidth}
                  />
                ) : (
                  <Chip
                    variant="outlined"
                    key={index}
                    {...getTagProps({ index })}
                    label={
                      <ChipLabel maxWidth={maxChipWidth}>
                        {option.tipoCampo === "string" || option.tipoCampo === "checkboxmultiple"
                          ? option.value === ""
                            ? [option.nombreCampo]
                            : [`${option.labelChip} ${option.value}`]
                          : option.tipoCampo === "boolean" ||
                            option.tipoCampo === "null" ||
                            option.tipoCampo === "notnull"
                          ? `${option.labelChip} ${
                              option.value ? option.textoTrue ?? "Sí" : option.textoFalse ?? "No"
                            }`
                          : option.tipoCampo === "number"
                          ? `${option.labelChip}  ${option.signo}  ${option.value}`
                          : ""}
                      </ChipLabel>
                    }
                    onClick={event => handleChipClick(event, option)}
                    onDelete={!disabled && (event => handleChipDelete(event, option))}
                    disabled={disabled && false}
                  />
                ),
              )
            }
            renderInput={params => (
              <TextField
                value={textFieldAutocompleteValue}
                onChange={event => setTextFieldAutocompleteValue(event.target.value)}
                onKeyDown={handleTextFieldKey}
                id={`${id}Input`}
                inputProps={{ id: `${id}InputInput` }}
                fullWidth
                label="Busca"
                variant="standard"
                {...textFieldProps}
                {...params}
                InputProps={{ ...params.InputProps, ...InputProps }}
              />
            )}
            disabled={disabled}
            {...props} // Importante a tener en cuenta para personalización
          />
        </Box>
      </Box>

      {selectedOption && selectedOption.tipoCampo === "string" ? (
        <PopoverTexto
          alAplicar={alAplicar}
          option={selectedOption}
          handlePopoverClose={handlePopoverClose}
          anchorEl={anchorEl}
          idPadre={id}
        />
      ) : selectedOption && selectedOption.tipoCampo === "checkboxmultiple" ? (
        <PopoverCheckBoxMultiple
          alAplicar={alAplicar}
          option={selectedOption}
          handlePopoverClose={handlePopoverClose}
          anchorEl={anchorEl}
          idPadre={id}
        />
      ) : selectedOption &&
        (selectedOption.tipoCampo === "boolean" ||
          selectedOption.tipoCampo === "null" ||
          selectedOption.tipoCampo === "notnull") ? (
        <PopoverBoolean
          alAplicar={alAplicar}
          option={selectedOption}
          handlePopoverClose={handlePopoverClose}
          anchorEl={anchorEl}
          idPadre={id}
        />
      ) : selectedOption && selectedOption.tipoCampo === "apiselect" ? (
        <PopoverAPIField
          alAplicar={alAplicar}
          option={selectedOption}
          handlePopoverClose={handlePopoverClose}
          anchorEl={anchorEl}
          idPadre={id}
          componente={selectedOption.componente}
        />
      ) : selectedOption && selectedOption.tipoCampo === "date" ? (
        <PopoverDate
          alAplicar={alAplicar}
          option={selectedOption}
          handlePopoverClose={handlePopoverClose}
          anchorEl={anchorEl}
          idPadre={id}
        />
      ) : selectedOption && selectedOption.tipoCampo === "number" ? (
        <PopoverNumber
          alAplicar={alAplicar}
          option={selectedOption}
          handlePopoverClose={handlePopoverClose}
          anchorEl={anchorEl}
          idPadre={id}
        />
      ) : null}
    </>
  );
}

DynamicFilter.propTypes = {
  id: PropTypes.string,
  propiedades: PropTypes.array,
  valores: PropTypes.any,
  filtrosPredefinidos: PropTypes.array, // solo disponible para dailyjob
  textFieldProps: PropTypes.object,
  disabled: PropTypes.bool,
  InputProps: PropTypes.any,
  maxChipWidth: PropTypes.number,
};

DynamicFilter.defaultProps = {
  propiedades: [],
  filtrosPredefinidos: [],
};

export default DynamicFilter;
