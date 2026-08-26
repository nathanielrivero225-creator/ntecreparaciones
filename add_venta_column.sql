-- ============================================================
-- MIGRACIÓN: Habilitar sección "Venta" en la tabla presupuestos
-- Ejecutar TODO en el SQL Editor de Supabase Dashboard
-- ============================================================

-- 1. Agregar columna 'venta' de tipo JSONB
ALTER TABLE presupuestos
  ADD COLUMN IF NOT EXISTS venta jsonb DEFAULT NULL;

-- 2. Si ns tiene CHECK constraint que solo acepta 'cel' y 'pc',
--    la eliminamos y recreamos para aceptar también 'venta'.
--    (Supabase: Table > Constraints > buscar check constraint de ns)
--    Si usás CHECK (ns IN ('cel','pc')), ejecutá esto:
DO $$
DECLARE
  conname text;
BEGIN
  SELECT c.conname INTO conname
  FROM pg_constraint c
  JOIN pg_class t ON c.conrelid = t.oid
  JOIN pg_namespace n ON t.relnamespace = n.oid
  WHERE t.relname = 'presupuestos'
    AND c.contype = 'c'
    AND pg_get_constraintdef(c.oid) LIKE '%ns%';

  IF conname IS NOT NULL THEN
    EXECUTE 'ALTER TABLE presupuestos DROP CONSTRAINT ' || conname;
    EXECUTE 'ALTER TABLE presupuestos ADD CONSTRAINT presupuestos_ns_check CHECK (ns IN (''cel'', ''pc'', ''venta''))';
    RAISE NOTICE 'Constraint % eliminado y recreado con venta', conname;
  END IF;
END $$;

-- 3. Index para filtrar por ns
CREATE INDEX IF NOT EXISTS idx_presupuestos_ns ON presupuestos (ns);

-- 4. Si tenés RLS activo (INSERT policy que valide ns),
--    verificar que acepte 'venta'. Si no, crear policy:
-- (descomentar si RLS bloquea los inserts de venta)
-- DROP POLICY IF EXISTS "permit_insert" ON presupuestos;
-- CREATE POLICY "permit_insert" ON presupuestos
--   FOR INSERT WITH CHECK (true);
