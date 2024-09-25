from flask import Flask, request, jsonify, send_from_directory
import google.generativeai as genai
import PIL.Image
import io

app = Flask(__name__)

# Configuración de la API de Gemini
GOOGLE_API_KEY = "AIzaSyBofYXOoKfmDOPVqVKSDKlD2XlnTQOMeEU"
genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel("gemini-1.5-flash")


@app.route("/")
def index():
    return send_from_directory(".", "index.html")


@app.route("/<path:path>")
def send_file(path):
    return send_from_directory(".", path)


@app.route("/analyze", methods=["POST"])
def analyze_image():
    if "image" not in request.files:
        return jsonify({"error": "No se encontró ninguna imagen"}), 400

    image = request.files["image"]

    try:
        # Convertir la imagen a formato PIL
        img = PIL.Image.open(io.BytesIO(image.read()))

        # Generar la descripción de la imagen
        response = model.generate_content(
            [
                "Describe esta imagen en español, Raza probable del gato, Edad estimada, Características distintivas, Personalidad típica de esta raza",
                img,
            ]
        )
        caption = response.text

        # Solo retornar la descripción básica
        return jsonify({"caption": caption})

    except Exception as e:
        app.logger.error(f"Error during image analysis: {str(e)}")
        return jsonify({"error": f"Error al analizar la imagen: {str(e)}"}), 500


if __name__ == "__main__":
    app.run(debug=True)
