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
    num_paciente: Optional[str] = None
    num_empleado_medico: Optional[str] = None
    creada_por_usuario: Optional[UUID] = None

class CitaCreate(CitaBase):
    num_paciente: str
    num_empleado_medico: str
    creada_por_usuario: UUID

class CancelarCitaRequest(BaseModel):
    mot_cancelacion: Optional[str] = "Cancelada por el usuario"

class EstadoCitaRequest(BaseModel):
    estado: str

class CitaResponse(CitaBase):
    num_cita: int
    estado: str
    mot_cancelacion: Optional[str] = None
    horas_restantes: Optional[float] = None
    cancelable: Optional[bool] = None
    nombre_paciente: Optional[str] = None
    nombre_medico: Optional[str] = None

    class Config:
        orm_mode = True
        from_attributes = True