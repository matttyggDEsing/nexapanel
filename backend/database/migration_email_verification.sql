-- migration_email_verification.sql
-- Agrega columna para token de verificacion de email
ALTER TABLE users
  ADD COLUMN email_verification_token VARCHAR(64) DEFAULT NULL
  COMMENT 'Token unico para verificar el email' AFTER email_verified;
