-- Paso 1: Ver todos los check constraints actuales
SELECT conname, pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'presupuestos'::regclass AND contype = 'c';

-- Paso 2: Dropear TODOS los check constraints de la tabla
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT conname FROM pg_constraint
           WHERE conrelid = 'presupuestos'::regclass AND contype = 'c'
  LOOP
    EXECUTE 'ALTER TABLE presupuestos DROP CONSTRAINT ' || r.conname;
    RAISE NOTICE 'Dropped constraint: %', r.conname;
  END LOOP;
END $$;

-- Paso 3: Recrear el constraint con 'venta'
ALTER TABLE presupuestos
  ADD CONSTRAINT presupuestos_ns_check CHECK (ns IN ('cel','pc','venta'));

-- Paso 4: Agregar columna venta si no existe
ALTER TABLE presupuestos ADD COLUMN IF NOT EXISTS venta jsonb DEFAULT NULL;

-- Paso 5: Verificar que quedó bien
SELECT conname, pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'presupuestos'::regclass AND contype = 'c';
