-- Agregar columna 'venta' de tipo JSONB a la tabla presupuestos
-- Ejecutar en el SQL Editor de Supabase Dashboard
-- Permite almacenar datos de compra→reparación→reventa
-- Nota: si ya existen filas, la columna quedará en NULL para esas filas

ALTER TABLE presupuestos
  ADD COLUMN IF NOT EXISTS venta jsonb DEFAULT NULL;

-- Index opcional para filtrar ventas rápido
CREATE INDEX IF NOT EXISTS idx_presupuestos_ns ON presupuestos (ns);
