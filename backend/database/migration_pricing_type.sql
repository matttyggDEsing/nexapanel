-- migration_pricing_type.sql
-- Agrega pricing_type para diferenciar servicios x1000 vs por unidad
ALTER TABLE services
  ADD COLUMN pricing_type ENUM('per_1000','per_unit') NOT NULL DEFAULT 'per_1000'
  COMMENT 'per_1000 = precio por cada 1000 unidades, per_unit = precio por unidad'
  AFTER seller_visible;

-- Los servicios Package y Custom Comments Package son por unidad
UPDATE services SET pricing_type = 'per_unit' WHERE type IN ('Package', 'Custom Comments Package');
