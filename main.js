// Seleccionamos el elemento HTML donde se mostrará el consejo del día.
const consejoDelDiaElemento = document.querySelector("#consejo-del-dia p");

// Función para obtener un consejo aleatorio del servidor.
function obtenerConsejoDelServidor() {
  // Hacemos una solicitud al servidor para obtener los consejos.
  fetch("/api/consejos")
    .then((response) => {
      if (!response.ok) {
        // Si hay un problema con la respuesta, lanzamos un error.
        throw new Error("Error en la respuesta del servidor");
      }
      return response.json(); // Convertimos la respuesta en JSON.
    })
    .then((consejos) => {
      if (consejos.length === 0) {
        // Si no hay consejos en el servidor, mostramos un mensaje.
        consejoDelDiaElemento.textContent = "No hay consejos disponibles en este momento.";
        return;
      }

      // Seleccionamos un consejo aleatorio.
      const indiceAleatorio = Math.floor(Math.random() * consejos.length);
      const consejo = consejos[indiceAleatorio].texto; // Asegúrate de que cada consejo tenga la propiedad 'texto'.

      // Mostramos el consejo en el elemento correspondiente.
      consejoDelDiaElemento.textContent = consejo;
    })
    .catch((error) => {
      // Si ocurre algún error, lo mostramos en la consola y en la página.
      console.error("Error al cargar el consejo del día:", error);
      consejoDelDiaElemento.textContent = "No se pudo cargar el consejo del día. Por favor, inténtalo más tarde.";
    });
}

// Llamamos a la función para mostrar el consejo del día cuando la página carga.
document.addEventListener("DOMContentLoaded", obtenerConsejoDelServidor);
