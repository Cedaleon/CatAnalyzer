document.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.getElementById("fileInput");
  const cameraButton = document.getElementById("cameraButton");
  const video = document.getElementById("video");
  const canvas = document.getElementById("canvas");
  const imagePreview = document.getElementById("imagePreview");
  const analyzeButton = document.getElementById("analyzeButton");
  const resultDiv = document.getElementById("result");
  const errorDiv = document.getElementById("error");

  let imageBlob = null;

  // Manejar la carga de imágenes desde el input
  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      imageBlob = file;
      displayPreview(file);
    }
  });

  // Manejar la captura de imágenes desde la cámara
  cameraButton.addEventListener("click", () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        video.srcObject = stream;
        video.style.display = "block";
        video.play();
      })
      .catch((err) => {
        console.error("Error accessing camera:", err);
        errorDiv.textContent =
          "No se pudo acceder a la cámara. Por favor, verifica los permisos.";
      });
  });

  // Capturar imagen del video al hacer click en el video
  video.addEventListener("click", () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      imageBlob = blob;
      displayPreview(blob);
      video.style.display = "none";
      const tracks = video.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
    }, "image/jpeg");
  });

  // Mostrar la imagen capturada
  function displayPreview(blob) {
    const img = document.createElement("img");
    img.src = URL.createObjectURL(blob);
    imagePreview.innerHTML = "";
    imagePreview.appendChild(img);
    analyzeButton.disabled = false;
  }

  // Enviar la imagen para análisis al hacer clic en el botón
  analyzeButton.addEventListener("click", () => {
    if (!imageBlob) {
      errorDiv.textContent = "Por favor, selecciona o toma una foto primero.";
      return;
    }

    const formData = new FormData();
    formData.append("image", imageBlob);

    analyzeButton.disabled = true;
    analyzeButton.textContent = "🔍 Analizando...";
    errorDiv.textContent = "";
    resultDiv.innerHTML = "";

    fetch("/analyze", {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((err) => {
            throw new Error(err.error || "Error en la respuesta del servidor");
          });
        }
        return response.json();
      })
      .then((data) => {
        resultDiv.innerHTML = `
          <h3>Descripción Básica:</h3>
          <p>${data.caption}</p>
        
        `;
      })
      .catch((error) => {
        console.error("Error:", error);
        errorDiv.textContent = `Error: ${error.message}. Por favor, intenta de nuevo.`;
      })
      .finally(() => {
        analyzeButton.disabled = false;
        analyzeButton.textContent = "🔍 Analizar Gato";
      });
  });
});
