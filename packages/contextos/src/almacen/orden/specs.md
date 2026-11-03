# Lógica de lecturas en salidas

La generación de salidas crea líneas para cada combinación SKU / ubicación desde donde hay que sacar la mercancía.

## Glosario

_articulo suelto_: artículo en una ubicación que no está dentro de ninguna caja.
_lote suelto_: material asociado a un  lote en una ubicación que no está dentro de ninguna caja.

## UI
En la ubicación, el usuario puede leer un SKU, un código de lote o una caja
+ Si lee un SKU se comprueba que el artículo vaya por lotes
	+ Si va por lotes > Error
	+ Si no va por lotes, se comprueba si hay artículo suelto
		+ Si hay artículo suelto se crea la línea por min(cantidad pendiente de la línea, cantidad del sku en la ubicación)
		+ Si no hay artículo suelto > Error
+ Si se lee un Lote
	+ Si hay artículo suelto del sku y lote leído, se crea la línea por min(cantidad pendiente de la línea, cantidad del sku en la ubicación)
	+ Si no hay artículo suelto del sku y lote leído > Error
+ Si se lee una Caja
	+ Si el artículo no va por lotes:
		+ Si el artículo está contenido en la caja (primer nivel), se crea la lectura
		+ Si el artículo no está contenido en la caja > Error
	+ Si el artículo va por lotes:
		+ Si el artículo está contenido en la caja (primer nivel) y solo hay un lote para el artículo, se crea la lectura
		+ Si el artículo está contenido en la caja (primer nivel) y solo hay más de un lote para el artículo, se pide al usuario que elija el lote de una lista de lotes
		+ Si el artículo y lote no está contenido en la caja > Error