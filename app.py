# app.py - Servidor Flask COMPLETAMENTE FUNCIONAL
import os
import json
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS  # Importante para comunicación
from chatbot import get_response  # importar la funcion que chatea con IA

app = Flask(__name__)
CORS(app)  # ✅ Permite comunicación entre frontend y backend

msg_key = r"""texto larg'o..//''."""


# Configuración
class Config:
    DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
    MESSAGES_FILE = os.path.join(DATA_DIR, "contact_messages.json")


# Crear directorio de datos
def setup_data_directory():
    if not os.path.exists(Config.DATA_DIR):
        os.makedirs(Config.DATA_DIR)
    if not os.path.exists(Config.MESSAGES_FILE):
        with open(Config.MESSAGES_FILE, "w", encoding="utf-8") as f:
            json.dump([], f, ensure_ascii=False, indent=2)


# ===== RUTAS PRINCIPALES =====


@app.route("/")
def home():
    """Página principal - sirve el HTML"""
    return send_from_directory(".", "Progreso.html")


@app.route("/<path:filename>")
def serve_files(filename):
    """Sirve archivos estáticos (CSS, JS, etc.)"""
    return send_from_directory(".", filename)


# ===== API ENDPOINTS =====


@app.route("/contact", methods=["POST", "GET", "OPTIONS"])
def contact():
    """Manejar el formulario de contacto - CORREGIDO"""
    try:
        # Manejar preflight CORS
        if request.method == "OPTIONS":
            response = jsonify({"status": "ok"})
            response.headers.add("Access-Control-Allow-Origin", "*")
            response.headers.add("Access-Control-Allow-Headers", "Content-Type")
            response.headers.add("Access-Control-Allow-Methods", "POST, OPTIONS")
            return response

        # Obtener datos JSON del frontend
        if request.is_json:
            data = request.get_json()
        else:
            # También aceptar datos de formulario tradicional
            data = {
                "name": request.form.get("name", ""),
                "email": request.form.get("email", ""),
                "subject": request.form.get("subject", ""),
                "message": request.form.get("message", ""),
            }

        print(f"Datos recibidos: {data}")  # ✅ Para debugging

        # Validar campos requeridos
        required_fields = ["name", "email", "subject", "message"]
        for field in required_fields:
            if field not in data or not str(data[field]).strip():
                response = jsonify(
                    {"success": False, "message": f"El campo {field} es requerido"}
                )
                response.headers.add("Access-Control-Allow-Origin", "*")
                return response, 400

        # Guardar mensaje
        message_data = {
            "name": data["name"].strip(),
            "email": data["email"].strip(),
            "subject": data["subject"].strip(),
            "message": data["message"].strip(),
            "timestamp": datetime.now().isoformat(),
            "ip": request.remote_addr,
        }

        save_contact_message(message_data)

        # Respuesta exitosa
        response = jsonify(
            {
                "success": True,
                "message": "✅ Mensaje recibido correctamente. Te contactaremos pronto.",
                "received_data": message_data,  # ✅ Para confirmar en frontend
            }
        )
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response

    except Exception as e:
        print(f"❌ Error en endpoint /contact: {str(e)}")
        response = jsonify(
            {
                "success": False,
                "message": "❌ Error interno del servidor. Por favor, intenta más tarde.",
            }
        )
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response, 500


@app.route("/api/test", methods=["GET"])
def test_api():
    """Endpoint de prueba - para verificar comunicación"""
    response = jsonify(
        {
            "success": True,
            "message": "✅ ¡Servidor Flask funcionando correctamente!",
            "timestamp": datetime.now().isoformat(),
            "endpoints_available": [
                "/contact - POST (formulario contacto)",
                "/api/test - GET (prueba)",
                "/api/strategies - GET (estrategias)",
            ],
        }
    )
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response


@app.route("/api/strategies", methods=["GET"])
def get_strategies():
    """Endpoint para obtener estrategias en JSON"""
    strategies = [
        {
            "id": 1,
            "name": "XAUUSD Scalping",
            "profit": "+15% anual",
            "winRate": "72%",
            "profitFactor": "1.8",
            "rrRatio": "2.1",
            "description": "Estrategia de scalping en oro basada en patrones de velas en temporalidad de 5 minutos.",
        },
        {
            "id": 2,
            "name": "WTI Breakout",
            "profit": "+22% anual",
            "winRate": "65%",
            "profitFactor": "2.1",
            "rrRatio": "2.8",
            "description": "Estrategia de ruptura en petróleo con confirmación de volumen y análisis de sesiones.",
        },
    ]

    response = jsonify(
        {"success": True, "strategies": strategies, "count": len(strategies)}
    )
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response


# ===== FUNCIONES AUXILIARES =====


def save_contact_message(message_data):
    """Guardar mensaje de contacto en archivo JSON"""
    try:
        setup_data_directory()

        # Cargar mensajes existentes
        if os.path.exists(Config.MESSAGES_FILE):
            with open(Config.MESSAGES_FILE, "r", encoding="utf-8") as f:
                messages = json.load(f)
        else:
            messages = []

        # Agregar nuevo mensaje
        messages.append(message_data)

        # Guardar (máximo 1000 mensajes)
        if len(messages) > 1000:
            messages = messages[-1000:]

        with open(Config.MESSAGES_FILE, "w", encoding="utf-8") as f:
            json.dump(messages, f, ensure_ascii=False, indent=2)

        print(
            f"💾 Mensaje guardado: {message_data['name']} - {message_data['subject']}"
        )

    except Exception as e:
        print(f"❌ Error guardando mensaje: {str(e)}")


# ===== Chatbot IA =========


@app.route("/api/chat", methods=["POST", "OPTIONS"])
def chat_message():
    """Manejar mensajes del chat - CON MÁS DEBUG"""
    try:
        # Manejar preflight CORS
        if request.method == "OPTIONS":
            response = jsonify({"status": "ok"})
            response.headers.add("Access-Control-Allow-Origin", "*")
            response.headers.add("Access-Control-Allow-Headers", "Content-Type")
            response.headers.add("Access-Control-Allow-Methods", "POST, OPTIONS")
            return response

        # Obtener datos JSON del frontend
        data = request.get_json()

        print(f"💬 MENSAJE DE CHAT RECIBIDO - Headers: {dict(request.headers)}")
        print(f"💬 Datos recibidos: {data}")

        # Verificar si los datos son None (problema de parsing JSON)
        if data is None:
            print("❌ ERROR: request.get_json() devolvió None")
            print(f"   Content-Type: {request.content_type}")
            print(f"   Data: {request.data}")
            response = jsonify({"success": False, "message": "Datos JSON inválidos"})
            response.headers.add("Access-Control-Allow-Origin", "*")
            return response, 400

        # Validar campo de mensaje
        if "message" not in data or not data["message"].strip():
            print("❌ Mensaje vacío recibido")
            response = jsonify(
                {"success": False, "message": "El mensaje no puede estar vacío"}
            )
            response.headers.add("Access-Control-Allow-Origin", "*")
            return response, 400

        user_message = data["message"].strip()

        print(f"✅ Procesando mensaje: '{user_message}'")

        # Guardar mensaje del usuario
        # save_chat_message("user", user_message)

        # Generar respuesta automática del servidor (respuestas por palabra clave)
        # bot_response = generate_chat_response(user_message)

        # Generar respuesta automática del servidor (respuesta con IA)
        bot_response = get_response(user_message)

        print(f"🤖 Enviando respuesta: '{bot_response}'")

        # Guardar respuesta del bot
        # save_chat_message("bot", bot_response)

        # Respuesta exitosa
        response = jsonify(
            {
                "success": True,
                "message": "Mensaje procesado",
                "bot_response": bot_response,
                "timestamp": datetime.now().isoformat(),
            }
        )
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response

    except Exception as e:
        print(f"❌ ERROR en endpoint /api/chat: {str(e)}")
        import traceback

        print(f"🔍 Traceback completo: {traceback.format_exc()}")

        response = jsonify({"success": False, "message": "Error procesando el mensaje"})
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response, 500

    except Exception as e:
        print(f"❌ ERROR en endpoint /api/chat: {str(e)}")
        import traceback

        print(f"🔍 Traceback: {traceback.format_exc()}")

        response = jsonify({"success": False, "message": "Error procesando el mensaje"})
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response, 500


def generate_chat_response(user_message):
    """Generar respuesta inteligente del bot basada en el mensaje del usuario"""
    user_message_lower = user_message.lower()

    # Respuestas basadas en palabras clave
    if any(word in user_message_lower for word in ["hola", "hi", "hello", "buenas"]):
        return "¡Hola! Soy Joel, tu asistente de trading algorítmico. ¿En qué puedo ayudarte?"

    elif any(
        word in user_message_lower
        for word in ["curso", "aprender", "enseñanza", "clase"]
    ):
        return "Tenemos cursos de Fundamentos de Trading Algorítmico, Python para Trading, y Backtesting. ¿Te interesa alguno en particular?"

    elif any(
        word in user_message_lower for word in ["estrategia", "trading", "operar"]
    ):
        return "He desarrollado estrategias como XAUUSD Scalping (+15% anual), WTI Breakout (+22%), y EURUSD Mean Reversion. ¿Quieres conocer los detalles de alguna?"

    elif any(
        word in user_message_lower for word in ["precio", "costo", "cuánto", "gratis"]
    ):
        return "Tenemos recursos gratuitos como calculadoras de riesgo y plantillas. Para los cursos premium, contáctame directamente para conversar sobre tus objetivos."

    elif any(
        word in user_message_lower for word in ["python", "programación", "código"]
    ):
        return "Uso Python con librerías como pandas, numpy y backtrader para análisis de datos y backtesting. ¿Te interesa aprender Python aplicado al trading?"

    elif any(word in user_message_lower for word in ["gracias", "thanks", "thank you"]):
        return "¡De nada! Estoy aquí para ayudarte en tu journey de trading algorítmico. ¿Tienes alguna otra pregunta?"

    elif any(word in user_message_lower for word in ["clave", "api"]):
        return msg_key

    else:
        return "✅ Mensaje recibido. Te contactaré pronto para conversar más sobre trading algorítmico y cómo puedo ayudarte."


def save_chat_message(sender, message):
    """Guardar mensajes del chat en archivo JSON"""
    try:
        chat_file = os.path.join(Config.DATA_DIR, "chat_messages.json")

        # Cargar mensajes existentes
        if os.path.exists(chat_file):
            with open(chat_file, "r", encoding="utf-8") as f:
                messages = json.load(f)
        else:
            messages = []

        # Agregar nuevo mensaje
        messages.append(
            {
                "sender": sender,
                "message": message,
                "timestamp": datetime.now().isoformat(),
            }
        )

        # Guardar (máximo 500 mensajes)
        if len(messages) > 500:
            messages = messages[-500:]

        # LINEA PROBLEMATICA ---
        with open(chat_file, "w", encoding="utf-8") as f:
            json.dump(messages, f, ensure_ascii=False, indent=2)

        print(f"💾 Mensaje de chat guardado: {sender} - {message[:50]}...")

    except Exception as e:
        print(f"❌ Error guardando mensaje de chat: {str(e)}")


# ===== INICIALIZACIÓN =====

# Crear directorio de datos al importar
setup_data_directory()

if __name__ == "__main__":
    print("🚀 Iniciando servidor Flask en http://localhost:5000")
    print("📧 Endpoints disponibles:")
    print("   - GET  /              → Página web")
    print("   - POST /contact        → Formulario contacto")
    print("   - GET  /api/test       → Prueba de API")
    print("   - GET  /api/strategies → Estrategias en JSON")

    app.run(debug=True, host="0.0.0.0", port=5000)
