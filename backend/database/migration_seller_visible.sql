-- ============================================================
-- MIGRATION: Agrega seller_visible a services
-- Ejecutar UNA SOLA VEZ en producción
-- ============================================================

-- Agrega columna para ocultar servicios del catálogo del vendedor
-- sin desactivarlos globalmente
ALTER TABLE services
  ADD COLUMN `seller_visible` TINYINT(1) NOT NULL DEFAULT 1
    COMMENT 'Mostrar en el catálogo del vendedor'
  AFTER `is_active`;

