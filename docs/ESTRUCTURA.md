almacen-control/
├── .env                          # Variables de entorno
├── .gitignore                    # Archivos a ignorar en git
├── docker-compose.yml           # Configuración Docker
├── README.md                     # Documentación principal
├── docs/                         # Documentación adicional
│   ├── api/                      # Documentación de APIs
│   ├── deployment/               # Guías de despliegue
│   └── user_guide/              # Manual de usuario
├── backend/                      # Código backend FastAPI
│   ├── app/
│   │   ├── server/
│   │   │   ├── config/          # Configuraciones
│   │   │   ├── functions/       # Lógica de negocio
│   │   │   ├── middleware/      # Middlewares
│   │   │   ├── models/          # Modelos Pydantic
│   │   │   ├── routes/          # Endpoints API
│   │   │   ├── utils/           # Utilidades
│   │   │   └── app.py           # Aplicación principal
│   │   ├── static/              # Archivos estáticos
│   │   │   ├── uploads/         # Archivos subidos
│   │   │   └── images/          # Imágenes de productos
│   │   ├── logs/                # Archivos de log
│   │   └── main.py              # Punto de entrada
│   ├── tests/                   # Tests del backend
│   ├── requirements.txt         # Dependencias Python
│   └── Dockerfile              # Imagen Docker backend
├── frontend/                    # Código frontend React
│   ├── public/                  # Archivos públicos
│   ├── src/
│   │   ├── components/          # Componentes React
│   │   ├── pages/              # Páginas principales
│   │   ├── services/           # Servicios API
│   │   ├── context/            # Context providers
│   │   ├── hooks/              # Custom hooks
│   │   ├── utils/              # Utilidades
│   │   └── styles/             # Estilos CSS
│   ├── package.json            # Dependencias Node.js
│   └── Dockerfile              # Imagen Docker frontend
└── database/                   # Scripts de base de datos
    ├── init/                   # Scripts de inicialización
    └── backups/               # Respaldos