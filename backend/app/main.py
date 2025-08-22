# backend/app/main.py
import uvicorn
import os
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

if __name__ == "__main__":
    # Configuración del servidor
    host = "0.0.0.0"
    port = int(os.getenv("BACKEND_PORT", 7070))
    reload = os.getenv("DEBUG", "false").lower() == "true"
    
    print(f"🚀 Iniciando servidor en http://{host}:{port}")
    print(f"📊 Modo debug: {reload}")
    print(f"🌍 Ambiente: {os.getenv('ENVIRONMENT', 'development')}")
    
    uvicorn.run(
        "server.app:app", 
        host=host, 
        port=port, 
        reload=reload,
        log_level="info"
    )