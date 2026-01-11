# Casos de Prueba - Update Items Solicitados

## Contexto General
- Todos los casos usan un item llamado "TUERCA_M8"
- Stock en inventario: **10 unidades**
- Orden de compra ID: 1
- Solicitud de compra ID: 1

---

## **CASO 1: Existencia TRUE - Cantidad nueva <= Stock (No sobra)**

**Escenario:**
- Item actual: existencia=TRUE, cantidad=5
- Editar a: cantidad=8 (8 <= 10 stock)

**Esperado:**
- Item TRUE: cantidad=8 ✓
- Item FALSE: Se elimina (si existía) ✓
- Características: Se sincronizan ✓

**SQL a ejecutar antes:**
```sql
INSERT INTO items_solicitados (item, cantidad, caracteristica, observacion, existencia, ordenCompra_id) 
VALUES ('TUERCA_M8', 5, 'ISO 4014', 'Normal', true, 1);
```

**Llamada al endpoint:**
```json
{
  "itemsSolicitados": [
    {
      "id": 1,
      "cantidad": 8,
      "caracteristica": "ISO 4014",
      "Observacion": "Normal"
    }
  ]
}
```

**Verificación:**
- `SELECT * FROM items_solicitados WHERE item='TUERCA_M8' AND ordenCompra_id=1;`
- Debe mostrar 1 registro con cantidad=8, existencia=TRUE

---

## **CASO 2: Existencia TRUE - Cantidad nueva > Stock (Sobra, Crea FALSE)**

**Escenario:**
- Item actual: existencia=TRUE, cantidad=5
- Editar a: cantidad=15 (15 > 10 stock, sobra 5)
- No existe registro FALSE previo

**Esperado:**
- Item TRUE: cantidad=10 ✓
- Item FALSE: Se crea con cantidad=5 ✓
- Ambos sincronizados en características ✓

**SQL a ejecutar antes:**
```sql
INSERT INTO items_solicitados (item, cantidad, caracteristica, observacion, existencia, ordenCompra_id) 
VALUES ('TUERCA_M8', 5, 'ISO 4014', 'Normal', true, 1);
```

**Llamada al endpoint:**
```json
{
  "itemsSolicitados": [
    {
      "id": 2,
      "cantidad": 15,
      "caracteristica": "ISO 4014",
      "Observacion": "Normal"
    }
  ]
}
```

**Verificación:**
- `SELECT * FROM items_solicitados WHERE item='TUERCA_M8' AND ordenCompra_id=1;`
- Debe mostrar 2 registros:
  - existencia=TRUE, cantidad=10
  - existencia=FALSE, cantidad=5

---

## **CASO 3: Existencia TRUE - Cantidad nueva > Stock (Sobra, Actualiza FALSE existente)**

**Escenario:**
- Item TRUE: existencia=TRUE, cantidad=5
- Item FALSE EXISTENTE: existencia=FALSE, cantidad=3
- Editar TRUE a: cantidad=14 (sobra 4)

**Esperado:**
- Item TRUE: cantidad=10 ✓
- Item FALSE: Se actualiza a cantidad=4 ✓
- Características: Se sincronizan ✓

**SQL a ejecutar antes:**
```sql
INSERT INTO items_solicitados (item, cantidad, caracteristica, observacion, existencia, ordenCompra_id) 
VALUES ('TUERCA_M8', 5, 'ISO 4014', 'Normal', true, 1);
INSERT INTO items_solicitados (item, cantidad, caracteristica, observacion, existencia, ordenCompra_id) 
VALUES ('TUERCA_M8', 3, 'ISO 4014', 'Normal', false, 1);
```

**Llamada al endpoint:**
```json
{
  "itemsSolicitados": [
    {
      "id": 3,
      "cantidad": 14,
      "caracteristica": "ISO 4014 MEJORADO",
      "Observacion": "Actualizadas"
    }
  ]
}
```

**Verificación:**
- Item FALSE debe tener: cantidad=4, caracteristica='ISO 4014 MEJORADO'

---

## **CASO 4: Existencia TRUE - Disminución de cantidad (Elimina FALSE)**

**Escenario:**
- Item TRUE: existencia=TRUE, cantidad=10
- Item FALSE EXISTENTE: existencia=FALSE, cantidad=5
- Editar TRUE a: cantidad=8

**Esperado:**
- Item TRUE: cantidad=8 ✓
- Item FALSE: Se elimina (ya no necesario) ✓

**SQL a ejecutar antes:**
```sql
INSERT INTO items_solicitados (item, cantidad, caracteristica, observacion, existencia, ordenCompra_id) 
VALUES ('TUERCA_M8', 10, 'ISO 4014', 'Normal', true, 1);
INSERT INTO items_solicitados (item, cantidad, caracteristica, observacion, existencia, ordenCompra_id) 
VALUES ('TUERCA_M8', 5, 'ISO 4014', 'Normal', false, 1);
```

**Llamada al endpoint:**
```json
{
  "itemsSolicitados": [
    {
      "id": 5,
      "cantidad": 8,
      "caracteristica": "ISO 4014",
      "Observacion": "Normal"
    }
  ]
}
```

**Verificación:**
- Debe quedar solo 1 registro con existencia=TRUE, cantidad=8

---

## **CASO 5: Existencia FALSE - Stock=0 (Solo actualiza)**

**Escenario:**
- Item FALSE: existencia=FALSE, cantidad=5
- Stock en inventario: 0
- Editar a: cantidad=7

**Esperado:**
- Item FALSE: Se actualiza solo cantidad=7 ✓
- Nada más ocurre ✓

**SQL a ejecutar antes:**
```sql
UPDATE inventario SET stock=0 WHERE nombre='TUERCA_M8';
INSERT INTO items_solicitados (item, cantidad, caracteristica, observacion, existencia, ordenCompra_id) 
VALUES ('TUERCA_M8', 5, 'ISO 4014', 'Sin stock', false, 1);
```

**Llamada al endpoint:**
```json
{
  "itemsSolicitados": [
    {
      "id": 6,
      "cantidad": 7,
      "caracteristica": "ISO 4014",
      "Observacion": "Sin stock actualizado"
    }
  ]
}
```

**Verificación:**
- Debe existir solo 1 registro con existencia=FALSE, cantidad=7

---

## **CASO 6: Existencia FALSE - Stock>0, Diferencia>0 (Mantiene FALSE, Crea/Actualiza TRUE)**

**Escenario:**
- Item FALSE: existencia=FALSE, cantidad=8
- Stock inventario: 10
- Editar a: cantidad=14 (sobra 4 que no cabe en stock)

**Esperado:**
- Item FALSE: Se mantiene con cantidad=4 ✓
- Item TRUE: Se crea con cantidad=10 ✓
- Características: Se sincronizan en ambos ✓

**SQL a ejecutar antes:**
```sql
UPDATE inventario SET stock=10 WHERE nombre='TUERCA_M8';
INSERT INTO items_solicitados (item, cantidad, caracteristica, observacion, existencia, ordenCompra_id) 
VALUES ('TUERCA_M8', 8, 'ISO 4014', 'Por comprar', false, 1);
```

**Llamada al endpoint:**
```json
{
  "itemsSolicitados": [
    {
      "id": 7,
      "cantidad": 14,
      "caracteristica": "ISO 4014",
      "Observacion": "Actualizado"
    }
  ]
}
```

**Verificación:**
- existencia=FALSE, cantidad=4
- existencia=TRUE, cantidad=10
- Ambos con misma característica y observación

---

## **CASO 7: Existencia FALSE - Stock>0, Diferencia<=0 (Elimina FALSE, Actualiza TRUE)**

**Escenario:**
- Item FALSE: existencia=FALSE, cantidad=8
- Stock inventario: 10
- Editar a: cantidad=8 (todo cabe en stock, no sobra)

**Esperado:**
- Item FALSE: Se elimina ✓
- Item TRUE: Se crea/actualiza con cantidad=8 ✓

**SQL a ejecutar antes:**
```sql
UPDATE inventario SET stock=10 WHERE nombre='TUERCA_M8';
INSERT INTO items_solicitados (item, cantidad, caracteristica, observacion, existencia, ordenCompra_id) 
VALUES ('TUERCA_M8', 8, 'ISO 4014', 'Por comprar', false, 1);
```

**Llamada al endpoint:**
```json
{
  "itemsSolicitados": [
    {
      "id": 8,
      "cantidad": 8,
      "caracteristica": "ISO 4014",
      "Observacion": "Normal"
    }
  ]
}
```

**Verificación:**
- Debe quedar solo 1 registro con existencia=TRUE, cantidad=8

---

## **CASO 8: Cambio de Características y Observación (Sin cambio de cantidad)**

**Escenario:**
- Item TRUE: existencia=TRUE, cantidad=10
- Item FALSE EXISTENTE: existencia=FALSE, cantidad=5
- Editar: Solo características y observación (sin cambiar cantidad)

**Esperado:**
- Ambos items se actualizan con nuevas características y observación ✓
- Cantidades se mantienen ✓

**SQL a ejecutar antes:**
```sql
INSERT INTO items_solicitados (item, cantidad, caracteristica, observacion, existencia, ordenCompra_id) 
VALUES ('TUERCA_M8', 10, 'ISO 4014', 'Viejo', true, 1);
INSERT INTO items_solicitados (item, cantidad, caracteristica, observacion, existencia, ordenCompra_id) 
VALUES ('TUERCA_M8', 5, 'ISO 4014', 'Viejo', false, 1);
```

**Llamada al endpoint:**
```json
{
  "itemsSolicitados": [
    {
      "id": 9,
      "caracteristica": "ISO 8.8",
      "Observacion": "Mejorada"
    }
  ]
}
```

**Verificación:**
- Ambos registros deben tener: caracteristica='ISO 8.8', Observacion='Mejorada'
- Cantidades sin cambios (10 y 5)

---

## Checklist de Verificación

Después de cada caso:
- [ ] No hay errores en la transacción
- [ ] Los registros tienen los valores esperados
- [ ] Las características se sincronizaron (si aplica)
- [ ] El inventario no fue modificado (solo lectura)
- [ ] Los registros que se debían eliminar desaparecieron

