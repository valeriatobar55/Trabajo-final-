// Seleccionar elementos del DOM
const formCompartir = document.getElementById("form-compartir");
const listaConsejosEnviados = document.getElementById("lista-consejos-enviados");

// Función para cargar los consejos desde el servidor
function cargarConsejos() {
  fetch("/api/consejos")
    .then((response) => response.json())
    .then((consejos) => {
      listaConsejosEnviados.innerHTML = ""; // Limpiar el contenedor antes de agregar nuevos elementos

      consejos.forEach((consejo) => {
        // Crear la tarjeta principal
        const card = document.createElement("div");
        card.classList.add("card");

        // Añadir el texto del consejo
        const texto = document.createElement("p");
        texto.textContent = `${consejo.texto}`;
        card.appendChild(texto);

        // Mostrar la categoría del consejo
        const categoria = document.createElement("span");
        categoria.textContent = `Categoría: ${consejo.categoria}`;
        categoria.classList.add("categoria");
        card.appendChild(categoria);

        // Botón de eliminar
        const botonEliminar = document.createElement("button");
        botonEliminar.textContent = "Eliminar";
        botonEliminar.classList.add("btn-eliminar");
        botonEliminar.addEventListener("click", () => eliminarConsejo(consejo.id));
        card.appendChild(botonEliminar);

        // Añadir la tarjeta al contenedor
        listaConsejosEnviados.appendChild(card);
      });
    })
    .catch((error) => {
      console.error("Error al cargar los consejos:", error);
      alert("Ocurrió un error al cargar los consejos.");
    });
}

// Función para enviar un nuevo consejo al servidor
formCompartir.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(formCompartir);
  const nuevoConsejo = {
    texto: formData.get("texto"),
    categoria: formData.get("categoria"),
  };

  fetch("/api/consejos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(nuevoConsejo),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("No se pudo enviar el consejo.");
      }
      return response.json();
    })
    .then(() => {
      formCompartir.reset(); // Limpiar el formulario
      cargarConsejos(); // Actualizar la lista de consejos
    })
    .catch((error) => {
      console.error("Error al enviar el consejo:", error);
      alert("No se pudo enviar el consejo. Intenta nuevamente.");
    });
});

// Función para eliminar un consejo
function eliminarConsejo(id) {
  fetch(`/api/consejos/${id}`, {
    method: "DELETE",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("No se pudo eliminar el consejo.");
      }
      cargarConsejos(); // Actualizar la lista de consejos
    })
    .catch((error) => {
      console.error("Error al eliminar el consejo:", error);
      alert("No se pudo eliminar el consejo. Intenta nuevamente.");
    });
}

// Cargar los consejos al cargar la página
document.addEventListener("DOMContentLoaded", cargarConsejos);

