from sqlalchemy import Column, Integer, String, Date, Time, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy.sql import text

Base = declarative_base()

class Usuario(Base):
    __tablename__ = 'usuario'
    id_usuario = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()")) #[cite: 9]
    nombre = Column(String, nullable=False) #[cite: 9]
    apellidos = Column(String, nullable=False) #[cite: 9]
    contrasena = Column(String, nullable=False) #[cite: 9]
    rol = Column(String, nullable=False) #[cite: 9]
    estado = Column(String, nullable=False) #[cite: 9]
    correo = Column(String)
    
    __mapper_args__ = {
        'polymorphic_on': rol,
        'polymorphic_identity': 'usuario'
    }

    def validarContrasena(self, password_input: str) -> bool: 
        return self.contrasena == password_input

class Paciente(Usuario):
    __tablename__ = 'paciente'
    id_usuario = Column(UUID(as_uuid=True), ForeignKey('usuario.id_usuario'), primary_key=True) #[cite: 9]
    num_paciente = Column(String, unique=True, nullable=False) #[cite: 9]
    estado_clinico = Column(String) #[cite: 9]
    
    citas_como_paciente = relationship("Cita", foreign_keys="[Cita.num_paciente]", back_populates="paciente_obj")

    __mapper_args__ = {
        'polymorphic_identity': 'paciente'
    }

class Empleado(Usuario):
    __tablename__ = 'empleado'
    id_usuario = Column(UUID(as_uuid=True), ForeignKey('usuario.id_usuario'), primary_key=True) #[cite: 9]
    num_empleado = Column(String, unique=True, nullable=False) #[cite: 9]
    telefono = Column(String) #[cite: 9]

    citas_atendidas = relationship("Cita", foreign_keys="[Cita.num_empleado_medico]", back_populates="empleado_obj")

    __mapper_args__ = {
        'polymorphic_identity': 'empleado',
        'polymorphic_identity': 'secretaria', 
        'polymorphic_identity': 'doctor'      
    }

class Cita(Base):
    __tablename__ = 'cita'
    num_cita = Column(Integer, primary_key=True, autoincrement=True) #[cite: 9]
    fecha = Column(Date, nullable=False) #[cite: 9]
    hora = Column(Time, nullable=False) #[cite: 9]
    estado = Column(String, nullable=False) #[cite: 9]
    mot_cancelacion = Column(String) #[cite: 9]
    num_paciente = Column(String, ForeignKey('paciente.num_paciente')) #[cite: 9]
    num_empleado_medico = Column(String, ForeignKey('empleado.num_empleado')) #[cite: 9]
    creada_por_usuario = Column(UUID(as_uuid=True), ForeignKey('usuario.id_usuario')) #[cite: 9]

    paciente_obj = relationship("Paciente", foreign_keys=[num_paciente], back_populates="citas_como_paciente")
    empleado_obj = relationship("Empleado", foreign_keys=[num_empleado_medico], back_populates="citas_atendidas")
    creador_obj = relationship("Usuario", foreign_keys=[creada_por_usuario])