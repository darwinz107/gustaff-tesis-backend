-- =====================================================
-- SCRIPT DE PREPARACIÓN PARA PRUEBAS
-- =====================================================
-- Ejecutar esto antes de las pruebas para resetear

-- 1. Limpiar items solicitados anteriores
DELETE FROM items_solicitados WHERE item = 'TUERCA_M8';

-- 2. Asegurar que el item existe en inventario con stock=10
-- (Si no existe, ajustar según tu BD)
UPDATE inventario SET stock = 10 WHERE nombre = 'TUERCA_M8';

-- Si no existe, descomentar:
-- INSERT INTO inventario (nombre, stock, ...) VALUES ('TUERCA_M8', 10, ...);

-- =====================================================
-- PRUEBA CASO 1: Existencia TRUE - Cantidad <= Stock (No sobra)
-- =====================================================
-- Preparación
INSERT INTO items_solicitados (item, cantidad, caracteristica, observacion, existencia, ordenCompra_id) 
VALUES ('TUERCA_M8', 5, 'ISO 4014', 'Normal', 1, 1);

-- Obtener el ID del item insertado y actualizar a cantidad=8
-- SELECT id FROM items_solicitados WHERE item='TUERCA_M8' AND cantidad=5 LIMIT 1;

-- POST /solicitud-de-compra/1 con payload:
-- { "itemsSolicitados": [{ "id": <id>, "cantidad": 8, "caracteristica": "ISO 4014", "Observacion": "Normal" }] }

-- Verificación esperada: 1 registro, existencia=TRUE, cantidad=8


-- =====================================================
-- PRUEBA CASO 2: Existencia TRUE - Cantidad > Stock (Crea FALSE)
-- =====================================================
-- Limpiar
DELETE FROM items_solicitados WHERE item = 'TUERCA_M8';

-- Preparación
INSERT INTO items_solicitados (item, cantidad, caracteristica, observacion, existencia, ordenCompra_id) 
VALUES ('TUERCA_M8', 5, 'ISO 4014', 'Normal', 1, 1);

-- POST /solicitud-de-compra/1 con payload:
-- { "itemsSolicitados": [{ "id": <id>, "cantidad": 15, "caracteristica": "ISO 4014", "Observacion": "Normal" }] }

-- Verificación esperada:
-- 2 registros:
--   - existencia=1 (TRUE), cantidad=10
--   - existencia=0 (FALSE), cantidad=5


-- =====================================================
-- PRUEBA CASO 3: Existencia TRUE - Actualiza FALSE existente
-- =====================================================
-- Limpiar
DELETE FROM items_solicitados WHERE item = 'TUERCA_M8';

-- Preparación
INSERT INTO items_solicitados (item, cantidad, caracteristica, observacion, existencia, ordenCompra_id) 
VALUES ('TUERCA_M8', 5, 'ISO 4014', 'Normal', 1, 1);
INSERT INTO items_solicitados (item, cantidad, caracteristica, observacion, existencia, ordenCompra_id) 
VALUES ('TUERCA_M8', 3, 'ISO 4014', 'Normal', 0, 1);

-- POST /solicitud-de-compra/1 con payload (usar ID del primer item):
-- { "itemsSolicitados": [{ "id": <id_true>, "cantidad": 14, "caracteristica": "ISO 4014 MEJORADO", "Observacion": "Actualizado" }] }

-- Verificación esperada:
-- 2 registros:
--   - existencia=1, cantidad=10, caracteristica='ISO 4014 MEJORADO'
--   - existencia=0, cantidad=4, caracteristica='ISO 4014 MEJORADO'


-- =====================================================
-- PRUEBA CASO 4: Existencia TRUE - Elimina FALSE
-- =====================================================
-- Limpiar
DELETE FROM items_solicitados WHERE item = 'TUERCA_M8';

-- Preparación
INSERT INTO items_solicitados (item, cantidad, caracteristica, observacion, existencia, ordenCompra_id) 
VALUES ('TUERCA_M8', 10, 'ISO 4014', 'Normal', 1, 1);
INSERT INTO items_solicitados (item, cantidad, caracteristica, observacion, existencia, ordenCompra_id) 
VALUES ('TUERCA_M8', 5, 'ISO 4014', 'Normal', 0, 1);

-- POST /solicitud-de-compra/1 con payload (usar ID del item TRUE):
-- { "itemsSolicitados": [{ "id": <id_true>, "cantidad": 8, "caracteristica": "ISO 4014", "Observacion": "Normal" }] }

-- Verificación esperada: 1 registro, existencia=1, cantidad=8


-- =====================================================
-- PRUEBA CASO 5: Existencia FALSE - Stock=0
-- =====================================================
-- Preparación
UPDATE inventario SET stock = 0 WHERE nombre = 'TUERCA_M8';
DELETE FROM items_solicitados WHERE item = 'TUERCA_M8';

INSERT INTO items_solicitados (item, cantidad, caracteristica, observacion, existencia, ordenCompra_id) 
VALUES ('TUERCA_M8', 5, 'ISO 4014', 'Sin stock', 0, 1);

-- POST /solicitud-de-compra/1 con payload:
-- { "itemsSolicitados": [{ "id": <id>, "cantidad": 7, "caracteristica": "ISO 4014", "Observacion": "Sin stock actualizado" }] }

-- Verificación esperada: 1 registro, existencia=0, cantidad=7
-- Luego restaurar stock
UPDATE inventario SET stock = 10 WHERE nombre = 'TUERCA_M8';


-- =====================================================
-- PRUEBA CASO 6: Existencia FALSE - Stock>0, Diferencia>0
-- =====================================================
-- Preparación
UPDATE inventario SET stock = 10 WHERE nombre = 'TUERCA_M8';
DELETE FROM items_solicitados WHERE item = 'TUERCA_M8';

INSERT INTO items_solicitados (item, cantidad, caracteristica, observacion, existencia, ordenCompra_id) 
VALUES ('TUERCA_M8', 8, 'ISO 4014', 'Por comprar', 0, 1);

-- POST /solicitud-de-compra/1 con payload (usar ID del item FALSE):
-- { "itemsSolicitados": [{ "id": <id>, "cantidad": 14, "caracteristica": "ISO 4014", "Observacion": "Actualizado" }] }

-- Verificación esperada:
-- 2 registros:
--   - existencia=1, cantidad=10
--   - existencia=0, cantidad=4


-- =====================================================
-- PRUEBA CASO 7: Existencia FALSE - Stock>0, Diferencia<=0
-- =====================================================
-- Preparación
DELETE FROM items_solicitados WHERE item = 'TUERCA_M8';

INSERT INTO items_solicitados (item, cantidad, caracteristica, observacion, existencia, ordenCompra_id) 
VALUES ('TUERCA_M8', 8, 'ISO 4014', 'Por comprar', 0, 1);

-- POST /solicitud-de-compra/1 con payload:
-- { "itemsSolicitados": [{ "id": <id>, "cantidad": 8, "caracteristica": "ISO 4014", "Observacion": "Normal" }] }

-- Verificación esperada: 1 registro, existencia=1, cantidad=8


-- =====================================================
-- PRUEBA CASO 8: Cambio de características (sin cantidad)
-- =====================================================
-- Preparación
DELETE FROM items_solicitados WHERE item = 'TUERCA_M8';

INSERT INTO items_solicitados (item, cantidad, caracteristica, observacion, existencia, ordenCompra_id) 
VALUES ('TUERCA_M8', 10, 'ISO 4014', 'Viejo', 1, 1);
INSERT INTO items_solicitados (item, cantidad, caracteristica, observacion, existencia, ordenCompra_id) 
VALUES ('TUERCA_M8', 5, 'ISO 4014', 'Viejo', 0, 1);

-- POST /solicitud-de-compra/1 con payload (usar ID del item TRUE):
-- { "itemsSolicitados": [{ "id": <id_true>, "caracteristica": "ISO 8.8", "Observacion": "Mejorada" }] }

-- Verificación esperada:
-- Ambos items con: caracteristica='ISO 8.8', Observacion='Mejorada'
-- Cantidades sin cambios (10 y 5)
