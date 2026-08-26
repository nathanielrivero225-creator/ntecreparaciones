-- Ejecutar en Supabase SQL Editor
-- Fix 1: Agregar columna venta
ALTER TABLE presupuestos ADD COLUMN IF NOT EXISTS venta jsonb DEFAULT NULL;

-- Fix 2: Reemplazar check constraint de ns para aceptar 'venta'
DO $$
DECLARE conname text;
BEGIN
  SELECT c.conname INTO conname
  FROM pg_constraint c
  JOIN pg_class t ON c.conrelid = t.oid
  WHERE t.relname = 'presupuestos' AND c.contype = 'c'
    AND pg_get_constraintdef(c.oid) LIKE '%ns%';
  IF conname IS NOT NULL THEN
    EXECUTE 'ALTER TABLE presupuestos DROP CONSTRAINT ' || conname;
  END IF;
END $$;

ALTER TABLE presupuestos ADD CONSTRAINT presupuestos_ns_check CHECK (ns IN ('cel','pc','venta'));
