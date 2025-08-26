const buttons = document.querySelectorAll(".fadingButton");
const infoForm = document.getElementById("patientForm");

//MANTENER ACTIVO (CON COLOR) SOLO EL BOTON PRESIONADO
buttons.forEach((btn) => {
  btn.addEventListener("click", function () {
    // Quita "active" de todos los botones
    buttons.forEach((b) => b.classList.remove("active"));

    // Agrega "active" solo al botón presionado
    this.classList.add("active");

    //CAMBIAR LA INFORMACION DEL CUADRO CUANDO SE PRESIONE EL BOTON
    if (this.textContent === "Informe mensual") {
      infoForm.innerHTML = `
      <div class="itemForm">
            <label for="consultaMes" title="campo obligatorio"
              >Mes de consulta</label
            >
            <input
              type="date"
              name="consultaMes"
              id="consultaMes"
              required
              size="50"
            />
          </div>
        </form>
      </div>`;
    }
    if (this.textContent === "Informe semestral") {
      infoForm.innerHTML = `
        <div class="itemForm">
        <label for="informYear" title="campo obligatorio"
          >Año a consultar</label
        >
        <input
          type="number"
          name="informYear"
          id="informYear"
          min="1900" 
          max="2100"
          placeholder="AAAA"
          required
        />
        </div>

        <div class="itemForm">
      <label for="semestre" title="campo obligatorio">Semestre a consultar</label>
      <select name="semestre" id="semestre" required>
        <option value="" disabled selected>-- Selecciona un semestre --</option>
        <option value="">Primer semestre del año</option>
        <option value="">Segundo semestre del año</option>
      </select>
    </div>     
      `;
    } else if (this.textContent === "Informe anual") {
      infoForm.innerHTML = `
        <div class="itemForm">
        <label for="informYear" title="campo obligatorio"
          >Año a consultar</label
        >
        <input
          type="number"
          name="informYear"
          id="informYear"
          min="1900" 
          max="2100"
          placeholder="AAAA"
          required
        />
        </div>
      `;
    }
  });
});

// ACTIVAR AUTOMÁTICAMENTE "Ingresar" AL CARGAR LA PÁGINA
document.addEventListener("DOMContentLoaded", () => {
  const btnIngresar = Array.from(buttons).find(
    (b) => b.textContent.trim() === "Informe mensual"
  );
  if (btnIngresar) {
    btnIngresar.click();
  }
});
