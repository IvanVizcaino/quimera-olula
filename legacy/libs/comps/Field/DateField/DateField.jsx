import { /* DatePicker, */ KeyboardDatePicker } from "@quimera/thirdparty";
import { util } from "quimera";
import { useEffect, useState } from "react";

function DateField({ value, onChange, ...props }) {
  const [showedValue, setShowedValue] = useState(parseValue(value));

  function parseValue(value) {
    return value ? Date.parse(value) : null;
  }

  function isValidDate(d) {
    return (d instanceof Date && !isNaN(d)) || d === null; // null si pulsamos a borrar
  }

  function handleDateChange(value) {
    setShowedValue(value);
    if (!isValidDate(value)) {
      return;
    }

    // Validación adicional: ignorar años obviamente incorrectos (< 1900)
    // Esto previene que se ejecute onChange mientras el usuario está escribiendo el año
    if (value instanceof Date) {
      const year = value.getFullYear();
      if (year < 1900) {
        return;
      }
    }

    // convertir a timestamp, agregar timezone offset, después convertir de nuevo a date object y por útimo usar toISOString()
    const localDateTime = value
      ? new Date(value.getTime() - value.getTimezoneOffset() * 60000).toISOString().substr(0, 10)
      : null;

    return onChange({
      target: {
        value: value ? /* value.toISOString().substr(0, 10) */ localDateTime : value,
      },
    });
  }

  useEffect(() => {
    setShowedValue(parseValue(value));
  }, [value]);

  return (
    <KeyboardDatePicker
      value={showedValue}
      // autoOk={false}
      // inputVariant='outlined'
      format={util.getFormatWordsDate()} /* 'dd/MM/yyyy' */
      onChange={handleDateChange}
      cancelLabel="CANCELAR"
      clearLabel="BORRAR"
      okLabel="ACEPTAR"
      margin="dense"
      clearable
      KeyboardButtonProps={{
        size: "small",
      }}
      invalidDateMessage="Formato de fecha no válida"
      {...props}
    />
  );
}

export default DateField;
