from pydantic import BaseModel
from datetime import date, time
from typing import Optional
from uuid import UUID

class LoginRequest(BaseModel):
    correo: str
    contrasena: str

class CitaBase(BaseModel):
    fecha: date
    hora: time
    num_paciente: str
    num_empleado_medico: str
    creada_por_usuario: UUID

class CitaCreate(CitaBase):
    pass

class CitaResponse(CitaBase):
    num_cita: int
    estado: str
    mot_cancelacion: Optional[str] = None

    class Config:
        orm_mode = True