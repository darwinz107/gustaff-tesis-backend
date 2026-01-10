# Actualización de Items Solicitados - Guía de Implementación

## Problema Original
Los items solicitados pueden existir en dos estados:
1. **Con stock disponible** → Se genera 1 campo (`existencia: true`)
2. **Sin stock** → Se genera 1 campo (`existencia: false`)
3. **Stock parcial** → Se generan 2 campos (uno con `existencia: true` y otro con `existencia: false`)

Cuando el usuario edita estos items en el frontend, el backend **valida contra el inventario real** para ajustar correctamente qué cantidad está disponible y qué cantidad debe comprarse.

---

## Cómo Funciona

El backend:
1. ✅ Recibe la nueva cantidad solicitada para UN item específico
2. ✅ Consulta el **stock real en la tabla Inventario**
3. ✅ **Calcula SOLO el cambio** (cantidad nueva - cantidad anterior)
4. ✅ Busca si existe un item complementario para el mismo nombre
5. ✅ Aplica el cambio incremental:
   - Al item editado
   - Al complementario (si existe)
6. ✅ Si un complementario llega a 0, se elimina
7. ✅ Si falta un complementario pero debería existir, lo crea
8. ✅ Todo con transacciones (rollback automático si falla)

---

## Estructura del DTO de Actualización

```typescript
// UPDATE SOLICITUD DE COMPRA - Request Body
{
  "Autoriza": "Juan Pérez",           // Opcional
  "ordenTrabajoId": "OT-001",         // Opcional
  "estadoCompra": "PRO",              // Opcional
  "itemsSolicitados": [
    {
      "id": 5,                        // ID del itemSolicitado a actualizar
      "cantidad": 25,                 // Nueva cantidad total solicitada
      "caracteristica": "Tornillos 1/2", // Opcional
      "Observacion": "Corrección"     // Opcional
    },
    {
      "id": 6,
      "cantidad": 10
    }
  ]
}
```

---

## Casos de Uso

### Caso 1: Item con Stock Completo en Inventario
**Inventario:**
```
| Item          | Stock |
|---------------|-------|
| Tornillos 1/2 | 100   |
```

**Tabla en Frontend (antes):**
```
| ID | Item          | Cantidad | Existencia |
|----|---------------|----------|-----------|
| 5  | Tornillos 1/2 | 50       | true      |
```

**Usuario edita a 30:**
```
| ID | Item          | Cantidad | Existencia |
|----|---------------|----------|-----------|
| 5  | Tornillos 1/2 | 30       | true      |
```

**Request:**
```json
{
  "itemsSolicitados": [
    { "id": 5, "cantidad": 30 }
  ]
}
```

**Lógica:**
1. Nueva cantidad: 30
2. Stock en inventario: 100
3. Comparación: 30 ≤ 100 → **TODO DISPONIBLE**

**Resultado:**
```
| ID | Item          | Cantidad | Existencia |
|----|---------------|----------|-----------|
| 5  | Tornillos 1/2 | 30       | true      |
```
✅ Sin complementario porque hay stock suficiente

---

## Caso Especial: Edición Incremental (El que enviaste)

Este es el caso más común: **editas SOLO uno de los dos items complementarios**.

### Escenario Inicial

**Inventario:**
```
| Item          | Stock |
|---------------|-------|
| Tornillos 1/2 | 15    |
```

**Tabla en Frontend:**
```
| ID | Item          | Cantidad | Existencia | Descripción        |
|----|---------------|----------|------------|------------------|
| 5  | Tornillos 1/2 | 10       | true       | En stock         |
| 6  | Tornillos 1/2 | 30       | false      | Por comprar      |
```

### Usuario Edita ID 5 (El que está EN STOCK)

Antes: 10 unidades
Después: 20 unidades

**Request:**
```json
{
  "itemsSolicitados": [
    { "id": 5, "cantidad": 20 }
  ]
}
```

### Procesamiento Incremental

```
1. Item actual (ID 5): cantidad: 10, existencia: true
2. Nueva cantidad: 20
3. Diferencia: 20 - 10 = +10 (aumentó en 10)
4. Stock en inventario: 15
5. Cantidad nueva en stock: min(20, 15) = 15
6. Cambio real: 15 - 10 = +5 (solo 5 unidades más disponibles)
7. Complementario: 30 - 5 = 25 (se resta el cambio)
```

### Resultado Final

```
| ID | Item          | Cantidad | Existencia |
|----|---------------|----------|-----------|
| 5  | Tornillos 1/2 | 15       | true      |
| 6  | Tornillos 1/2 | 25       | false     |
```

✅ **No se recalcula todo, solo se suma/resta el cambio al complementario**

---

### Otro Ejemplo: Editas el que NO tiene Stock

**Estado anterior:**
```
| ID | Item          | Cantidad | Existencia |
|----|---------------|----------|-----------|
| 5  | Tornillos 1/2 | 15       | true      |
| 6  | Tornillos 1/2 | 25       | false     |
```

**Usuario edita ID 6 (El que está POR COMPRAR) de 25 a 40:**

**Request:**
```json
{
  "itemsSolicitados": [
    { "id": 6, "cantidad": 40 }
  ]
}
```

### Procesamiento

```
1. Item actual (ID 6): cantidad: 25, existencia: false
2. Nueva cantidad: 40
3. Diferencia: 40 - 25 = +15
4. Complementario (ID 5): 15 - 15 = 0
5. Como llega a 0, se ELIMINA
```

### Resultado Final

```
| ID | Item          | Cantidad | Existencia |
|----|---------------|----------|-----------|
| 6  | Tornillos 1/2 | 40       | false     |
```

✅ **El item complementario se elimina porque desaparece**

---

### Tercer Ejemplo: Disminuir Cantidad

**Estado anterior:**
```
| ID | Item          | Cantidad | Existencia |
|----|---------------|----------|-----------|
| 5  | Tornillos 1/2 | 15       | true      |
| 6  | Tornillos 1/2 | 25       | false     |
```

**Usuario edita ID 5 de 15 a 8:**

**Request:**
```json
{
  "itemsSolicitados": [
    { "id": 5, "cantidad": 8 }
  ]
}
```

### Procesamiento

```
1. Item actual (ID 5): cantidad: 15, existencia: true
2. Nueva cantidad: 8
3. Diferencia: 8 - 15 = -7 (disminuyó en 7)
4. Stock en inventario: 15
5. Cantidad nueva en stock: min(8, 15) = 8
6. Cambio real: 8 - 15 = -7
7. Complementario: 25 - (-7) = 25 + 7 = 32 (se suma el cambio negativo)
```

### Resultado Final

```
| ID | Item          | Cantidad | Existencia |
|----|---------------|----------|-----------|
| 5  | Tornillos 1/2 | 8        | true      |
| 6  | Tornillos 1/2 | 32       | false     |
```

✅ **La cantidad por comprar aumenta porque el stock disponible disminuyó**

---

## Cálculo Incremental vs Recalculado

### Con Lógica Incremental (Actual)
```
Edito ID 5 de 10 → 20
  → Stock disponible: min(20, 15) = 15
  → Cambio real: 15 - 10 = +5
  → Aplicar +5 al complementario
  
RESULTADO FINAL: 15 en stock + 25 por comprar = 40 total
```

### Con Lógica Recalculada (Anterior - ❌ Incorrecto)
```
Edito ID 5 a 20
  → Inventario: 15
  → Distribuir: 15 + 5 = 20
  
RESULTADO: 15 en stock + 5 por comprar = 20 total
❌ PROBLEMA: Perdería el complementario que ya tenía 30
```

---

**Inventario:**
```
| Item          | Stock |
|---------------|-------|
| Tornillos 1/2 | 20    |
```

**Tabla en Frontend (antes):**
```
| ID | Item          | Cantidad | Existencia |
|----|---------------|----------|-----------|
| 5  | Tornillos 1/2 | 50       | false     |
```

**Usuario edita a 80:**
```json
{
  "itemsSolicitados": [
    { "id": 5, "cantidad": 80 }
  ]
}
```

**Lógica:**
1. Nueva cantidad: 80
2. Stock en inventario: 20
3. Comparación: 80 > 20 → **STOCK PARCIAL**
   - Disponible: 20
   - Por comprar: 60

**Resultado:**
```
| ID | Item          | Cantidad | Existencia |
|----|---------------|----------|-----------|
| 5  | Tornillos 1/2 | 20       | true      |
| 6  | Tornillos 1/2 | 60       | false     |
```
✅ Se crea automáticamente el complementario

---

### Caso 3: Item SIN Stock en Inventario

**Inventario:**
```
| Item          | Stock |
|---------------|-------|
| Tornillos 1/2 | 0     |
```

**Tabla en Frontend (antes):**
```
| ID | Item          | Cantidad | Existencia |
|----|---------------|----------|-----------|
| 5  | Tornillos 1/2 | 30       | true      |
```

**Usuario edita a 50:**
```json
{
  "itemsSolicitados": [
    { "id": 5, "cantidad": 50 }
  ]
}
```

**Lógica:**
1. Nueva cantidad: 50
2. Stock en inventario: 0
3. Comparación: 50 > 0 → **NADA DISPONIBLE**
   - Disponible: 0
   - Por comprar: 50

**Resultado:**
```
| ID | Item          | Cantidad | Existencia |
|----|---------------|----------|-----------|
| 5  | Tornillos 1/2 | 50       | false     |
```
✅ Item complementario (existencia: true) se ELIMINA si existía

---

### Caso 4: Actualización que cubre la cantidad faltante

**Inventario:**
```
| Item          | Stock |
|---------------|-------|
| Tornillos 1/2 | 40    |
```

**Tabla en Frontend (antes):**
```
| ID | Item          | Cantidad | Existencia |
|----|---------------|----------|-----------|
| 5  | Tornillos 1/2 | 20       | true      |
| 6  | Tornillos 1/2 | 30       | false     |
```

**Usuario edita a 40 (exactamente lo disponible):**
```json
{
  "itemsSolicitados": [
    { "id": 5, "cantidad": 40 }
  ]
}
```

**Lógica:**
1. Nueva cantidad: 40
2. Stock en inventario: 40
3. Comparación: 40 ≤ 40 → **TODO DISPONIBLE**

**Resultado:**
```
| ID | Item          | Cantidad | Existencia |
|----|---------------|----------|-----------|
| 5  | Tornillos 1/2 | 40       | true      |
```
✅ El complementario (ID 6) se ELIMINA automáticamente

---

## Ejemplo de Implementación en Frontend (React)

```typescript
const handleUpdateItems = async (solicitudId: number, itemsActualizados: UpdateItemSolicitado[]) => {
  try {
    const response = await fetch(`${API_URL}/solicitud-de-compra/${solicitudId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        itemsSolicitados: itemsActualizados
      })
    });

    const data = await response.json();
    if (data.validate) {
      alert('Actualización exitosa');
      // ⚠️ IMPORTANTE: Recargar los datos de la solicitud
      // Porque el backend puede haber creado o eliminado items complementarios
      await recargarSolicitud(solicitudId);
    }
  } catch (error) {
    console.error('Error al actualizar:', error);
  }
};

// Cuando el usuario edita un campo en la tabla
const handleItemChange = (itemId: number, newCantidad: number) => {
  const itemsActualizados = [{
    id: itemId,
    cantidad: newCantidad
  }];
  
  handleUpdateItems(solicitudId, itemsActualizados);
};
```

---

## Notas Importantes

1. **El ID es obligatorio**: Siempre envía el `id` del `itemSolicitado`
2. **Cantidad total**: Es la cantidad TOTAL que necesitas, no el incremento
3. **Validación automática**: El backend verifica el inventario real
4. **Campos opcionales**: Solo envía los que cambiaron (cantidad, característica, observación)
5. **Transacciones**: Si algo falla, se revierte TODO (rollback automático)
6. **Crea/Elimina automáticamente**: Si resulta en stock parcial, crea el complementario; si se elimina, lo borra

---

## Errores Posibles

| Error | Causa | Solución |
|-------|-------|----------|
| `No se encontró la solicitud de compra` | ID inválido | Verifica el ID de la solicitud |
| `No se encontró el item solicitado con ID X` | Item ya eliminado | Recarga la página |
| `No se encontró un estado de compra válido` | Estado inválido en estadoCompra | Usa: PRO, PAU, PAR, LIS, ENT |
| Item no existe en Inventario | El item no está registrado en inventario | Crear primero el item en inventario |

## Dos Estrategias Según lo que Envíes

### Estrategia 1: Editar UN SOLO Item (Lógica Incremental)

Envías solo el que editaste en el frontend:

```json
{
  "itemsSolicitados": [
    { "id": 5, "cantidad": 20 }
  ]
}
```

**El backend:**
- ✅ Busca si existe complementario
- ✅ Calcula cambio incremental
- ✅ Ajusta/crea/elimina automáticamente el complementario

---

### Estrategia 2: Editar AMBOS Items (Actualización Directa)

Si editas ambos a la vez, envías ambos IDs:

```json
{
  "itemsSolicitados": [
    { "id": 5, "cantidad": 15 },
    { "id": 6, "cantidad": 25 }
  ]
}
```

**El backend:**
- ✅ Detecta que se están actualizando ambos complementarios
- ✅ NO hace búsqueda incremental
- ✅ Solo actualiza ambos directamente con los valores que envías
- ✅ No hay ajuste automático porque tú estás siendo explícito

---

## Ejemplos por Estrategia

### Ejemplo 1: Editar Solo UN Item (Incremental)

**Estado anterior:**
```
| ID | Item          | Cantidad | Existencia |
|----|---------------|----------|-----------|
| 5  | Tornillos 1/2 | 10       | true      |
| 6  | Tornillos 1/2 | 30       | false     |
```

**Inventario:** 15 unidades disponibles

**Usuario edita ID 5 de 10 a 20:**
```json
PATCH /solicitud-de-compra/10
{
  "itemsSolicitados": [
    { "id": 5, "cantidad": 20 }
  ]
}
```

**Procesamiento incremental:**
```
1. Detecta: se edita SOLO ID 5 (1 item)
2. No se edita el complementario → lógica incremental
3. Diferencia: 20 - 10 = +10
4. Nuevo stock en inventario: min(20, 15) = 15
5. Cambio real: 15 - 10 = +5
6. Aplicar al complementario: 30 - 5 = 25
```

**Resultado:**
```
| ID | Item          | Cantidad | Existencia |
|----|---------------|----------|-----------|
| 5  | Tornillos 1/2 | 15       | true      |
| 6  | Tornillos 1/2 | 25       | false     |
```
✅ El complementario se ajustó automáticamente

---

### Ejemplo 2: Editar AMBOS Items (Directo)

**Estado anterior:**
```
| ID | Item          | Cantidad | Existencia |
|----|---------------|----------|-----------|
| 5  | Tornillos 1/2 | 15       | true      |
| 6  | Tornillos 1/2 | 25       | false     |
```

**Usuario edita ambos a nuevos valores:**
```json
PATCH /solicitud-de-compra/10
{
  "itemsSolicitados": [
    { "id": 5, "cantidad": 12 },
    { "id": 6, "cantidad": 20 }
  ]
}
```

**Procesamiento directo:**
```
1. Detecta: se editan AMBOS (ID 5 y 6)
2. Son complementarios del mismo item → actualización directa
3. No hay búsqueda incremental
4. Solo actualiza los valores exactos que enviaste
```

**Resultado:**
```
| ID | Item          | Cantidad | Existencia |
|----|---------------|----------|-----------|
| 5  | Tornillos 1/2 | 12       | true      |
| 6  | Tornillos 1/2 | 20       | false     |
```
✅ Se respetan exactamente los valores que enviaste

---

```
Frontend: Usuario edita UN item de la tabla
    ↓
Frontend: Envía SOLO el ID del item editado + nueva cantidad
    ↓
Backend: Inicia transacción
    ↓
Backend: Detecta que se edita 1 item → LÓGICA INCREMENTAL
  1. Calcula diferencia: nueva_cantidad - cantidad_anterior
  
  ¿El item es existencia: true (EN STOCK)?
    SÍ:
      - Calcula: min(nueva_cantidad, stock_inventario)
      - Cambio real = nueva_cantidad_en_stock - cantidad_anterior
      - Aplica cambio al complementario (resta el cambio)
      - Si complementario llega a 0: lo ELIMINA
      - Si no hay complementario pero hay faltante: lo CREA
    
    NO (existencia: false - POR COMPRAR):
      - Actualiza cantidad del item directamente
      - Resta el cambio al complementario (si existe)
      - Si complementario llega a 0: lo ELIMINA
    ↓
Backend: Confirma transacción
    ↓
Frontend: Recibe respuesta de éxito
    ↓
Frontend: ⚠️ IMPORTANTE - Recarga datos de la solicitud

---

Frontend: Usuario edita AMBOS items a la vez
    ↓
Frontend: Envía ambos IDs con nuevas cantidades
    ↓
Backend: Inicia transacción
    ↓
Backend: Detecta que se editan 2 items del mismo nombre → ACTUALIZACIÓN DIRECTA
  1. No busca complementario
  2. No hace cálculos incrementales
  3. Solo actualiza ambos con los valores exactos que enviaste
    ↓
Backend: Confirma transacción
    ↓
Frontend: Recibe respuesta de éxito
    ↓
Frontend: ⚠️ IMPORTANTE - Recarga datos de la solicitud
```

---

## Resumen de Reglas

### Si Editas 1 Item (Incremental)

| Caso | Item Editado | Stock Inventario | Acción |
|------|-------------|-----------------|--------|
| 1 | stock (true), +10 | 15 | Cambio real +5 → Complementario -5 |
| 2 | stock (true), -5 | 15 | Cambio real -5 → Complementario +5 |
| 3 | faltante (false), +10 | N/A | Cambio +10 → Complementario -10 |
| 4 | faltante (false), -10 | N/A | Cambio -10 → Complementario +10 |

**Si el complementario llega a 0 o menos → SE ELIMINA**
**Si el complementario no existe pero debe existir → SE CREA**

### Si Editas 2 Items (Directo)

Solo actualiza los valores exactos que enviaste, sin búsquedas ni cálculos incrementales.

---

