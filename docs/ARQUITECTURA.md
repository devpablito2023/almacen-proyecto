┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Cliente     │    │    Frontend     │    │    Backend      │
│   (Navegador)   │◄──►│     React       │◄──►│    FastAPI      │
│                 │    │   (Puerto 9090) │    │  (Puerto 7070)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
                                               ┌─────────────────┐
                                               │    MongoDB      │
                                               │  (Puerto 28000) │
                                               └─────────────────┘


Usuario → React Frontend → API REST → FastAPI Backend → MongoDB
   ▲                                                         │
   └─────────────── Respuesta JSON ◄─────────────────────────┘         

Patrones de Arquitectura

Backend: Clean Architecture con separación de capas
Frontend: Component-based architecture con Context API
Database: Document-oriented con MongoDB
API: RESTful con validación automática (Pydantic)
Auth: JWT tokens con refresh tokens                             