-- Crea primero la base prueba_crud desde pgAdmin o psql.
-- Luego ejecuta este archivo dentro de esa base.
CREATE TABLE IF NOT EXISTS estudiante (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    first_name VARCHAR(80) NOT NULL,
    email VARCHAR(160) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

-- Datos ficticios para practicar (ejecutar una sola vez).
INSERT INTO estudiante (first_name, email, activo) VALUES
    ('Ana Torres', 'ana@example.com', TRUE),
    ('Carlos Ruiz', 'carlos@example.com', TRUE),
    ('Laura Díaz', 'laura@example.com', FALSE);
