-- Crea prueba_crud en PostgreSQL y ejecuta este archivo dentro de esa base.
-- Si ya existe estudiante con otro esquema, no se modifica automáticamente.
CREATE TABLE IF NOT EXISTS estudiante (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    first_name VARCHAR(80) NOT NULL,
    year INTEGER NOT NULL,
    birth_year INTEGER NOT NULL,
    documento VARCHAR(100) NOT NULL
);

-- Datos ficticios. Ejecuta estos INSERT una sola vez.
INSERT INTO estudiante (first_name, year, birth_year, documento) VALUES
    ('Ana Torres', 2026, 2003, '001234'),
    ('Carlos Ruiz', 2026, 2001, '009876'),
    ('Laura Díaz', 2025, 2004, '004321');
