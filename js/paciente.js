const buttons = document.querySelectorAll(".fadingButton");
const infoTitle = document.querySelector(".blockTittle");
const infoSubtitle = document.querySelector(".sectionTittle");
const infoForm = document.getElementById("patientForm");
const search = document.querySelector(".sectionButton");

//MANTENER ACTIVO (CON COLOR) SOLO EL BOTON PRESIONADO
buttons.forEach((btn) => {
  btn.addEventListener("click", function () {
    // Quita "active" de todos los botones
    buttons.forEach((b) => b.classList.remove("active"));

    // Agrega "active" solo al botón presionado
    this.classList.add("active");

    //CAMBIAR LA INFORMACION DEL CUADRO CUANDO SE PRESIONE EL BOTON
    if (this.textContent === "Ingresar") {
      infoTitle.innerHTML = `<p>Ingreso del paciente</p>`;
      infoSubtitle.innerHTML = `<p>Información del paciente</p>`;
      search.innerHTML = `
      <button class="colorButton" type="submit" value="Ingresar">
          Enviar
        </button>`;
      infoForm.innerHTML = `
            <div class="itemForm">
            <label for="nombrePaciente" title="campo obligatorio"
              >Nombres</label
            >
            <input
              type="text"
              name="nombrePaciente"
              id="nombrePaciente"
              required
              size="50"
            />
          </div>

          <div class="itemForm">
            <label for="apellidoPaciente" title="campo obligatorio"
              >Apellidos</label
            >
            <input
              type="text"
              name="apellidoPaciente"
              id="apellidoPaciente"
              required
              size="50"
            />
          </div>

          <div class="itemForm">
            <label for="cedulaPaciente" title="campo obligatorio"
              >Número de cédula</label
            >
            <input
              type="number"
              name="cedulaPaciente"
              id="cedulaPaciente"
              required
              size="50"
            />
          </div>

          <div class="itemForm">
            <label for="telefonoPaciente" title="campo obligatorio"
              >Teléfono</label
            >
            <input
              type="tel"
              name="telefonoPaciente"
              id="telefonoPaciente"
              required
              size="50"
            />
          </div>

          <div class="itemForm">
            <label for="emailPaciente" title="campo obligatorio">Email</label>
            <input
              type="email"
              name="emailPaciente"
              id="emailPaciente"
              required
              size="50"
            />
          </div>

          <div class="itemForm">
            <label for="direccionPaciente" title="campo obligatorio"
              >Dirección</label
            >
            <input
              type="text"
              name="direccionPaciente"
              id="direccionPaciente"
              required
              size="50"
            />
          </div>

          <div class="itemForm">
            <label for="fechaNacimiento" title="campo obligatorio"
              >Fecha de Nacimiento</label
            >
            <input
              type="date"
              name="fechaNacimiento"
              id="fechaNacimiento"
              required
              size="50"
            />
          </div>
      `;
    } else if (this.textContent === "Consultar") {
      infoTitle.innerHTML = `<p>Consulta del paciente</p>`;
      infoSubtitle.innerHTML = `<p>Busqueda del paciente</p>`;
      search.innerHTML = `
      <button class="colorButton" id="searchButton" type="button">
        buscar
      </button>`;
      infoForm.innerHTML = `
        <div class="itemForm">
        <label for="cedulaPaciente" title="campo obligatorio"
          >Número de cédula</label
        >
        <input
          type="number"
          name="cedulaPaciente"
          id="cedulaPaciente"
          required
          size="50"
        />
        </div>
      `;
    }
  });
});

// ACTIVAR AUTOMÁTICAMENTE "Ingresar" AL CARGAR LA PÁGINA
document.addEventListener("DOMContentLoaded", () => {
  const btnIngresar = Array.from(buttons).find(
    (b) => b.textContent.trim() === "Ingresar"
  );
  if (btnIngresar) {
    btnIngresar.click();
  }
});
