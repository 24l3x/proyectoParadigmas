from pydantic import BaseModel
from datetime import date, time
from typing import Optional

class CitaBase(BaseModel):
    fecha: date
    hora: time
    estado: str
    num_paciente: str
    num_empleado: str

class CitaCreate(CitaBase):
    pass

class CitaResponse(CitaBase):
    num_cita: int
    motivo_cancelacion: Optional[str] = None

    class Config:
        orm_mode = True