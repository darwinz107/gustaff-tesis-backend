# Payloads de Prueba - Listos para Postman/Insomnia

**Base URL:** `http://localhost:3000/solicitud-de-compra/1`  
**Método:** PATCH  
**Reemplazar ID con el ID real del item**

---

## Caso 1: Existencia TRUE - Cantidad <= Stock (No sobra)
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

---

## Caso 2: Existencia TRUE - Cantidad > Stock (Crea FALSE)
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

---

## Caso 3: Existencia TRUE - Actualiza FALSE existente
```json
{
  "itemsSolicitados": [
    {
      "id": 3,
      "cantidad": 14,
      "caracteristica": "ISO 4014 MEJORADO",
      "Observacion": "Actualizado"
    }
  ]
}
```

---

## Caso 4: Existencia TRUE - Elimina FALSE
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

---

## Caso 5: Existencia FALSE - Stock=0 (Solo actualiza)
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

---

## Caso 6: Existencia FALSE - Stock>0, Diferencia>0
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

---

## Caso 7: Existencia FALSE - Stock>0, Diferencia<=0
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

---

## Caso 8: Solo cambio de características (sin cantidad)
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

---

## Query de Verificación rápida
Después de cada caso, ejecutar en la BD:
```sql
SELECT id, item, cantidad, caracteristica, observacion, existencia, ordenCompra_id 
FROM items_solicitados 
WHERE item = 'TUERCA_M8' 
ORDER BY existencia DESC, id ASC;
```

Este query muestra:
- TRUE (existencia) primero (por ordenar DESC)
- FALSE después
- Facilita verificar si los registros son los esperados

