// Elementos del DOM
const busquedaInput = document.querySelector("#busqueda-input");
const categoriaSelect = document.querySelector("#categoria-select");
const consejosLista = document.querySelector("#consejos-lista");

let todosLosConsejos = [];

// Función para mostrar un mensaje en la lista de consejos
function mostrarMensaje(mensaje) {
  consejosLista.innerHTML = `<p class="mensaje">${mensaje}</p>`;
}

// Función para generar las estrellas de valoración
function generarEstrellas(rating) {
  const maxStars = 5; // Número máximo de estrellas
  let estrellas = "";

  // Generar estrellas activas (rellenas) y vacías
  for (let i = 1; i <= maxStars; i++) {
    estrellas += `<span class="estrella ${
      i <= rating ? "estrella-activa" : "estrella-inactiva"
    }">★</span>`;
  }

  return estrellas; // Retorna las estrellas generadas como HTML
}

// Función para mostrar los consejos en formato de tarjetas
function mostrarConsejos(consejos) {
  consejosLista.innerHTML = ""; // Limpiar la lista antes de renderizar

  if (consejos.length === 0) {
    mostrarMensaje("No se encontraron consejos.");
    return;
  }

  consejos.forEach((consejo) => {
    // Crear el contenedor para cada consejo
    const card = document.createElement("div");
    card.classList.add("card");

    // Título con la categoría del consejo
    const titulo = document.createElement("h3");
    titulo.textContent = `Categoría: ${consejo.categoria}`;
    card.appendChild(titulo);

    // Texto del consejo con resaltado para búsquedas
    const texto = document.createElement("p");
    texto.innerHTML = consejo.texto.replace(
      new RegExp(busquedaInput.value, "gi"),
      (match) => `<mark>${match}</mark>`
    );
    card.appendChild(texto);

    // Contenedor para mostrar las estrellas y votos
    const ratingContainer = document.createElement("div");
    ratingContainer.classList.add("rating-container");
    ratingContainer.innerHTML = `
      Valoración: ${generarEstrellas(consejo.rating || 0)} (${consejo.votes || 0} votos)
    `;
    card.appendChild(ratingContainer);

    // Formulario para votar por el consejo
    const votarForm = document.createElement("form");
    votarForm.innerHTML = `
      <label for="voto-${consejo.id}">Votar:</label>
      <select id="voto-${consejo.id}">
        ${[1, 2, 3, 4, 5]
          .map((value) => `<option value="${value}">${value}</option>`)
          .join("")}
      </select>
      <button type="button" class="btn-votar" data-id="${consejo.id}">Enviar</button>
    `;
    card.appendChild(votarForm);

    consejosLista.appendChild(card); // Agregar la tarjeta a la lista
  });

  // Añadir eventos a los botones de votar
  document.querySelectorAll(".btn-votar").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.target.dataset.id; // ID del consejo
      const ratingValue = document.querySelector(`#voto-${id}`).value; // Valor del voto
      enviarVoto(id, ratingValue); // Llamar a la función para enviar el voto
    });
  });
}

// Función para cargar todos los consejos desde la API
function cargarConsejos() {
  mostrarMensaje("Cargando consejos..."); // Mostrar mensaje mientras se cargan
  fetch("/api/consejos")
    .then((response) => response.json())
    .then((consejos) => {
      todosLosConsejos = consejos; // Guardar todos los consejos en una variable global
      mostrarConsejos(consejos); // Renderizar los consejos
    })
    .catch((error) => {
      console.error("Error al cargar los consejos:", error);
      mostrarMensaje("Error al cargar los consejos.");
    });
}

// Función para filtrar los consejos por búsqueda y categoría
function filtrarConsejos() {
  const busqueda = busquedaInput.value.toLowerCase();
  const categoria = categoriaSelect.value;

  // Filtrar por texto y categoría
  const filtrados = todosLosConsejos.filter((consejo) => {
    const coincideBusqueda = consejo.texto.toLowerCase().includes(busqueda);
    const coincideCategoria = categoria === "" || consejo.categoria === categoria;
    return coincideBusqueda && coincideCategoria;
  });

  mostrarConsejos(filtrados); // Mostrar los consejos filtrados
}

// Función para enviar un voto a la API
function enviarVoto(id, rating) {
  fetch(`/api/consejos/${id}/votar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rating: parseInt(rating, 10) }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error al enviar el voto");
      }
      return response.json();
    })
    .then(() => {
      cargarConsejos(); // Recargar los consejos para actualizar la vista
    })
    .catch((error) => {
      console.error("Error al enviar el voto:", error);
    });
}

// Eventos para búsqueda y filtrado
busquedaInput.addEventListener("input", filtrarConsejos);
categoriaSelect.addEventListener("change", filtrarConsejos);

// Inicializar la carga de consejos
document.addEventListener("DOMContentLoaded", cargarConsejos);
