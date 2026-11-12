from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, Query
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
    
    rol_normalizado = user.rol.lower().strip()
    if rol_normalizado in ("asistente", "secretaria"):
        rol_normalizado = "secretaria"
        
    return {
        "mensaje": "Éxito", 
        "rol": rol_normalizado, 
        "nombre": user.nombre,
        "id_usuario": str(user.id_usuario),
        "num_paciente": getattr(user, 'num_paciente', None)
    }


@app.get("/api/pacientes/buscar/{criterio}")
def buscar_paciente(criterio: str, db: Session = Depends(get_db)):
    asistente = models.Asistente()
    paciente = asistente.buscarPaciente(db, criterio)
    if not paciente:
        raise HTTPException(status_code=404, detail=f"No se encontró el paciente '{criterio}' en la base de datos.")
    return {
        "num_paciente": paciente.num_paciente,
        "nombre": paciente.nombre,
        "apellidos": paciente.apellidos,
        "estado_clinico": paciente.estado_clinico
    }


@app.get("/api/citas", response_model=List[schemas.CitaResponse])
def listar_citas(
    num_paciente: Optional[str] = Query(default=None),
    db: Session = Depends(get_db)
):
    query = db.query(models.Cita)
    if num_paciente:
        query = query.filter(models.Cita.num_paciente.ilike(num_paciente.strip()))
    citas = query.order_by(models.Cita.fecha.asc(), models.Cita.hora.asc()).all()
    return citas


@app.post("/api/citas", response_model=schemas.CitaResponse)
def agendar_cita(cita_req: schemas.CitaCreate, db: Session = Depends(get_db)):
    creador = db.query(models.Usuario).filter(models.Usuario.id_usuario == cita_req.creada_por_usuario).first()
    
    if not creador and str(cita_req.creada_por_usuario) != "00000000-0000-0000-0000-000000000000":
        from sqlalchemy.sql import text
        row = db.execute(
            text("SELECT id_usuario, rol FROM usuario WHERE id_usuario = :uid"),
            {"uid": cita_req.creada_por_usuario}
        ).mappings().first()
        if row:
            rol_str = (row["rol"] or "").lower().strip()
            if rol_str in ("secretaria", "asistente"):
                creador = models.Asistente(id_usuario=row["id_usuario"], rol=row["rol"])

    # Soporte por si se usa el modo Demo sin haber iniciado sesión con UUID real
    if not creador and str(cita_req.creada_por_usuario) == "00000000-0000-0000-0000-000000000000":
        creador = db.query(models.Asistente).first()
        if not creador:
            usuario_cualquiera = db.query(models.Usuario).first()
            if usuario_cualquiera:
                creador = models.Asistente(id_usuario=usuario_cualquiera.id_usuario)

    if not creador:
        raise HTTPException(status_code=404, detail="Usuario creador no encontrado")
    
    try:
        if isinstance(creador, models.Paciente):
            nueva_cita = creador.agendarCita(
                db, 
                fecha=cita_req.fecha, 
                hora=cita_req.hora, 
                num_medico=cita_req.num_empleado_medico
            )
        elif isinstance(creador, models.Asistente) or (creador.rol and creador.rol.lower().strip() in ("secretaria", "asistente")):
            if not isinstance(creador, models.Asistente):
                creador = models.Asistente(id_usuario=creador.id_usuario)
            nueva_cita = creador.agendarCita(
                db, 
                fecha=cita_req.fecha, 
                hora=cita_req.hora, 
                num_paciente_ingresado=cita_req.num_paciente,
                num_medico=cita_req.num_empleado_medico
            )
            if not nueva_cita:
                raise HTTPException(
                    status_code=404,
                    detail=f"No se encontró el paciente '{cita_req.num_paciente}' en la base de datos."
                )
        else:
            raise HTTPException(status_code=403, detail="Este rol no tiene permisos para agendar citas")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
        
    return nueva_cita


@app.put("/api/citas/{num_cita}/cancelar", response_model=schemas.CitaResponse)
def cancelar_cita(
    num_cita: int,
    req: Optional[schemas.CancelarCitaRequest] = None,
    db: Session = Depends(get_db)
):
    cita = db.query(models.Cita).filter(models.Cita.num_cita == num_cita).first()
    if not cita:
        raise HTTPException(status_code=404, detail="La cita no fue encontrada en la base de datos.")
    
    motivo = req.mot_cancelacion if req and req.mot_cancelacion else "Cancelada por el usuario"
    try:
        cita.cancelar(db, motivo=motivo)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    return cita


@app.put("/api/citas/{num_cita}/estado", response_model=schemas.CitaResponse)
def actualizar_estado_cita(
    num_cita: int,
    req: schemas.EstadoCitaRequest,
    db: Session = Depends(get_db)
):
    cita = db.query(models.Cita).filter(models.Cita.num_cita == num_cita).first()
    if not cita:
        raise HTTPException(status_code=404, detail="La cita no fue encontrada en la base de datos.")
    cita.estado = req.estado
    db.commit()
    db.refresh(cita)
    return cita