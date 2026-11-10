from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import models, schemas
from database import engine, get_db

app = FastAPI(title="CarePoint API")

# Permite que React (puerto 5173) se comunique con FastAPI (puerto 8000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/login")
def login(req: schemas.LoginRequest, db: Session = Depends(get_db)):
    # Busca al usuario usando el correo en lugar del nombre
    user = db.query(models.Usuario).filter(models.Usuario.correo == req.correo).first()
    
    if not user or not user.validarContrasena(req.contrasena):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
        
    return {
        "mensaje": "Éxito", 
        "rol": user.rol,
        "nombre": user.nombre,
        "id_usuario": str(user.id_usuario)
    }

@app.post("/api/citas", response_model=schemas.CitaResponse)
def agendar_cita(cita: schemas.CitaCreate, db: Session = Depends(get_db)):
    # Instancia una nueva cita y establece el estado inicial
    nueva_cita = models.Cita(**cita.dict(), estado="Pendiente")
    
    db.add(nueva_cita)
    db.commit()
    db.refresh(nueva_cita)
    
    return nueva_cita