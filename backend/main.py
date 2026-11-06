from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from . import models, schemas
from .database import engine, get_db

# Crea las tablas en PostgreSQL si no existen
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="CarePoint API")

@app.post("/api/citas", response_model=schemas.CitaResponse)
def agendar_cita(cita: schemas.CitaCreate, db: Session = Depends(get_db)):
    # Ejecuta el método asociado en el diagrama: agendar()[cite: 3]
    nueva_cita = models.Cita(**cita.dict())
    db.add(nueva_cita)
    db.commit()
    db.refresh(nueva_cita)
    return nueva_cita