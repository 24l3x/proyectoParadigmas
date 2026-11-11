from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import models, schemas
from database import engine, get_db

app = FastAPI(title="CarePoint API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/login")
def login(req: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = models.Usuario.iniciarSesion(db, req.correo, req.contrasena)
    
    if not user:
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
        
    return {
        "mensaje": "Éxito", 
        "rol": user.rol.lower(), 
        "nombre": user.nombre,
        "id_usuario": str(user.id_usuario),
        "num_paciente": getattr(user, 'num_paciente', None)
    }


@app.post("/api/citas", response_model=schemas.CitaResponse)
def agendar_cita(cita_req: schemas.CitaCreate, db: Session = Depends(get_db)):
    creador = db.query(models.Usuario).filter(models.Usuario.id_usuario == cita_req.creada_por_usuario).first()
    
    if not creador:
        raise HTTPException(status_code=404, detail="Usuario creador no encontrado")
    
    if isinstance(creador, models.Paciente):
        nueva_cita = creador.agendarCita(
            db, 
            fecha=cita_req.fecha, 
            hora=cita_req.hora, 
            num_medico=cita_req.num_empleado_medico
        )
    elif isinstance(creador, models.Asistente):
        nueva_cita = creador.agendarCita(
            db, 
            fecha=cita_req.fecha, 
            hora=cita_req.hora, 
            num_paciente_ingresado=cita_req.num_paciente,
            num_medico=cita_req.num_empleado_medico
        )
    else:
        raise HTTPException(status_code=403, detail="Este rol no tiene permisos para agendar citas")
        
    return nueva_cita