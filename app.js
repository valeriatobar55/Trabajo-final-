const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Base de datos SQLite
const db = new sqlite3.Database(path.join(__dirname, "../database.db"), (err) => {
  if (err) {
    console.error("Error al conectar con la base de datos:", err.message);
  } else {
    console.log("Conectado a la base de datos SQLite.");
  }
});

// Verificar y actualizar la tabla 'consejos' si falta la columna 'fecha'
db.serialize(() => {
  db.all("PRAGMA table_info(consejos)", [], (err, columns) => {
    if (err) {
      console.error("Error al verificar la tabla 'consejos':", err.message);
    } else {
      const columnNames = columns.map((col) => col.name);
      if (!columnNames.includes("fecha")) {
        console.log("Se mete la columna fecha");
        db.serialize(() => {
          // Renombrar la tabla existente
          db.run("ALTER TABLE consejos RENAME TO old_consejos");

          // Crear la nueva tabla con la columna 'fecha'
          db.run(`
            CREATE TABLE consejos (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              texto TEXT NOT NULL,
              categoria TEXT NOT NULL,
              fecha TEXT DEFAULT (datetime('now', 'localtime'))
            )
          `);

          // Migrar los datos a la nueva tabla
          db.run(`
            INSERT INTO consejos (id, texto, categoria)
            SELECT id, texto, categoria FROM old_consejos
          `);

          // Eliminar la tabla antigua
          db.run("DROP TABLE old_consejos");

          console.log("Tabla actualizada");
        });
      }
    }
  });
});

// Crear tablas si no existen
db.serialize(() => {
  // Tabla 'foro'
  db.run(`
    CREATE TABLE IF NOT EXISTS foro (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario TEXT NOT NULL,
      comentario TEXT NOT NULL,
      fecha TEXT DEFAULT (datetime('now', 'localtime'))
    )
  `);

  // Tabla 'respuestas'
  db.run(`
    CREATE TABLE IF NOT EXISTS respuestas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      comentarioId INTEGER NOT NULL,
      usuario TEXT NOT NULL,
      respuesta TEXT NOT NULL,
      fecha TEXT DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (comentarioId) REFERENCES foro(id)
    )
  `);
});

// Rutas para la API

// Ruta para obtener todos los consejos
app.get("/api/consejos", (req, res) => {
  db.all("SELECT * FROM consejos ORDER BY fecha DESC", [], (err, rows) => {
    if (err) {
      console.error("Error al obtener consejos:", err.message);
      res.status(500).json({ error: "Error al obtener los consejos" });
    } else {
      res.json(rows);
    }
  });
});

// Ruta para insertar un nuevo consejo
app.post("/api/consejos", (req, res) => {
  const { texto, categoria } = req.body;
  if (!texto || !categoria) {
    return res.status(400).json({ error: "Texto y categoría son obligatorios" });
  }

  const sql = "INSERT INTO consejos (texto, categoria) VALUES (?, ?)";
  db.run(sql, [texto, categoria], function (err) {
    if (err) {
      console.error("Error al insertar consejo:", err.message);
      res.status(500).json({ error: "Error al insertar el consejo" });
    } else {
      res.status(201).json({
        id: this.lastID,
        texto,
        categoria,
        fecha: new Date().toISOString(),
      });
    }
  });
});

// Ruta para eliminar un consejo
app.delete("/api/consejos/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM consejos WHERE id = ?";
  db.run(sql, id, function (err) {
    if (err) {
      console.error("Error al eliminar consejo:", err.message);
      res.status(500).json({ error: "Error al eliminar el consejo" });
    } else {
      res.status(200).json({ message: "Consejo eliminado con éxito" });
    }
  });
});

// Ruta para el foro
app.get("/api/foro", (req, res) => {
  db.all("SELECT * FROM foro ORDER BY fecha DESC", [], (err, rows) => {
    if (err) {
      console.error("Error al obtener comentarios del foro:", err.message);
      res.status(500).json({ error: "Error al obtener comentarios del foro" });
    } else {
      res.json(rows);
    }
  });
});

// Ruta para insertar un comentario en el foro
app.post("/api/foro", (req, res) => {
  const { usuario, comentario } = req.body;
  if (!usuario || !comentario) {
    return res.status(400).json({ error: "Usuario y comentario son obligatorios" });
  }

  const sql = "INSERT INTO foro (usuario, comentario) VALUES (?, ?)";
  db.run(sql, [usuario, comentario], function (err) {
    if (err) {
      console.error("Error al insertar comentario en el foro:", err.message);
      res.status(500).json({ error: "Error al insertar comentario en el foro" });
    } else {
      res.status(201).json({
        id: this.lastID,
        usuario,
        comentario,
        fecha: new Date().toISOString(),
      });
    }
  });
});

// Rutas para respuestas en el foro
app.get("/api/foro/respuestas/:comentarioId", (req, res) => {
  const { comentarioId } = req.params;

  db.all(
    "SELECT * FROM respuestas WHERE comentarioId = ? ORDER BY fecha ASC",
    [comentarioId],
    (err, rows) => {
      if (err) {
        console.error("Error al obtener las respuestas:", err.message);
        res.status(500).json({ error: "Error al obtener las respuestas" });
      } else {
        res.json(rows);
      }
    }
  );
});

app.post("/api/foro/respuestas", (req, res) => {
  const { comentarioId, usuario, respuesta } = req.body;

  if (!comentarioId || !usuario || !respuesta) {
    return res
      .status(400)
      .json({ error: "Comentario ID, usuario y respuesta son obligatorios" });
  }

  const sql = "INSERT INTO respuestas (comentarioId, usuario, respuesta) VALUES (?, ?, ?)";
  db.run(sql, [comentarioId, usuario, respuesta], function (err) {
    if (err) {
      console.error("Error al insertar respuesta:", err.message);
      res.status(500).json({ error: "Error al insertar respuesta" });
    } else {
      res.status(201).json({
        id: this.lastID,
        comentarioId,
        usuario,
        respuesta,
        fecha: new Date().toISOString(),
      });
    }
  });
});

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, "../")));

// Ruta principal
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../index.html"));
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
