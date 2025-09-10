//link googlesheet creada para recibir la información sin uso de backend.
const formularioSheet =
  "https://script.google.com/macros/s/AKfycbzII_kvUeSbnxH5Wyf6OWU3vrLikAFRC303ZulPAK1dtdkb5Y3Rx1DP_8G-sYPGJtGy/exec";

//Busqueda del formulario al realizar el evento "enviar"
const form = document.getElementById("formulario__contacto");

form.addEventListener("submit", function (event) {
  event.preventDefault(); //evita que la pg. se recargue al envíar.

  //Objeto que va a tomar información del formulario
  const formData = new FormData(form);

  //envió de la información a la API google por medio de FETCH
  fetch(formularioSheet, {
    method: "POST", //metodo de envio encriptado
    body: formData,
  })
    .then(() => {
      alert("¡Formulario enviado con éxito!");
      form.reset();
    })
    .catch((error) => {
      console.error("Error al enviar el formulario:", error);
      alert("Ocurrió un error al enviar el formulario.");
    });
});
