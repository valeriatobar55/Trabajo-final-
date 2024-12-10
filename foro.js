const formComentario = document.getElementById("form-comentario");
const listaComentarios = document.getElementById("lista-comentarios");

// Cargar comentarios
function cargarComentarios() {
  fetch("/api/foro")
    .then((response) => {
      if (!response.ok) throw new Error("Error al cargar comentarios");
      return response.json();
    })
    .then((comentarios) => {
      listaComentarios.innerHTML = ""; // Limpiar comentarios previos
      comentarios.forEach((comentario) => {
        const li = document.createElement("li");
        li.classList.add("comentario-item");
        li.innerHTML = `
          <strong>${comentario.usuario}</strong>: ${comentario.comentario}
          <br><small>${new Date(comentario.fecha).toLocaleString()}</small>
          <button class="responder-btn" data-id="${comentario.id}">Responder</button>
          <ul class="respuestas" id="respuestas-${comentario.id}"></ul>
        `;
        listaComentarios.appendChild(li);
        cargarRespuestas(comentario.id);
      });

      document.querySelectorAll(".responder-btn").forEach((btn) =>
        btn.addEventListener("click", (e) => mostrarFormularioRespuesta(e.target.dataset.id))
      );
    })
    .catch((error) => console.error("Error al cargar comentarios:", error));
}

// Cargar respuestas
function cargarRespuestas(comentarioId) {
  fetch(`/api/foro/respuestas/${comentarioId}`)
    .then((response) => {
      if (!response.ok) throw new Error("Error al cargar respuestas");
      return response.json();
    })
    .then((respuestas) => {
      const ulRespuestas = document.getElementById(`respuestas-${comentarioId}`);
      respuestas.forEach((respuesta) => {
        const li = document.createElement("li");
        li.classList.add("respuesta-item");
        li.innerHTML = `
          <strong>${respuesta.usuario}</strong>: ${respuesta.respuesta}
          <br><small>${new Date(respuesta.fecha).toLocaleString()}</small>
        `;
        ulRespuestas.appendChild(li);
      });
    })
    .catch((error) => console.error("Error al cargar respuestas:", error));
}

// Mostrar formulario de respuesta
function mostrarFormularioRespuesta(comentarioId) {
  const ulRespuestas = document.getElementById(`respuestas-${comentarioId}`);
  const formRespuesta = document.createElement("form");
  formRespuesta.classList.add("form-respuesta");
  formRespuesta.innerHTML = `
    <input type="text" placeholder="Usuario" required>
    <textarea rows="2" placeholder="Escribe tu respuesta..." required></textarea>
    <button type="submit">Enviar</button>
  `;
  formRespuesta.addEventListener("submit", (event) => enviarRespuesta(event, comentarioId));
  ulRespuestas.appendChild(formRespuesta);
}

// Enviar respuesta
function enviarRespuesta(event, comentarioId) {
  event.preventDefault();
  const [usuarioInput, respuestaInput] = event.target.elements;

  fetch("/api/foro/respuestas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      usuario: usuarioInput.value,
      comentarioId,
      respuesta: respuestaInput.value,
    }),
  })
    .then((response) => {
      if (!response.ok) throw new Error("Error al enviar la respuesta");
      return response.json();
    })
    .then(() => cargarComentarios())
    .catch((error) => console.error("Error al enviar la respuesta:", error));
}

// Enviar comentario
formComentario.addEventListener("submit", (event) => {
  event.preventDefault();
  const usuario = document.getElementById("usuario").value;
  const comentario = document.getElementById("comentario").value;

  fetch("/api/foro", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ usuario, comentario }),
  })
    .then((response) => {
      if (!response.ok) throw new Error("Error al enviar el comentario");
      return response.json();
    })
    .then(() => {
      formComentario.reset();
      cargarComentarios();
    })
    .catch((error) => console.error("Error al enviar el comentario:", error));
});

// Inicializar
document.addEventListener("DOMContentLoaded", cargarComentarios);
