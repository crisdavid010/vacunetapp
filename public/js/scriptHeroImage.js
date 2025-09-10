document.addEventListener("DOMContentLoaded", () => {
  const heroImg = document.querySelector(".heroImage");
  const backgroundPortada = document.getElementById("background__portada");

  if (!heroImg || !backgroundPortada) return;

  const galleries = [
    "CDC1 1.png",
    "CDC2 1.png",
    "Cytonn Photography 1.png",
    "Diana Polekhina 1.png",
    "Diana Polekhina2 1.png",
    "Gabrielle Henderson 1.png",
    "Jacob Spaccavento 1.png",
    "Lewis Keegan 1.png",
    "Lukas Blazek 1.png",
    "Matheus Ferrero 1.png",
    "Mika Baumeister 1.png",
    "Mykenzie Johnson 1.png",
    "National Cancer Institute 1.png",
    "National Cancer Institute2 1.png",
    "Thought Catalog 1.png",
    "vaccinating-little-girl.jpg",
  ];

  const imagePath = "assets/img/background/horizontal/";
  let index = Math.floor(Math.random() * galleries.length); // 👈 Selección aleatoria inicial

  function changeBackground() {
    backgroundPortada.style.backgroundColor = "rgba(0, 0, 0, 0.6)";

    const nextImage = new Image();
    nextImage.src = `${imagePath}${galleries[index]}`;

    nextImage.onload = () => {
      heroImg.style.transition = "opacity 1s ease-in-out";
      heroImg.style.opacity = 0;

      setTimeout(() => {
        heroImg.style.backgroundImage = `url("${nextImage.src}")`;
        heroImg.style.opacity = 1;

        // Elegir una nueva imagen aleatoria diferente a la actual
        let nextIndex;
        do {
          nextIndex = Math.floor(Math.random() * galleries.length);
        } while (nextIndex === index);
        index = nextIndex;
      }, 750);
    };
  }

  changeBackground();
  setInterval(changeBackground, 5000); // cambia cada 5 segundos
});
