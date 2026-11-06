from sqlalchemy import Column, Integer, String, Date, Time, ForeignKey, Text
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class Usuario(Base):
    __tablename__ = 'Usuario'
    id_usuario = Column(Integer, primary_key=True, autoincrement=True) #[cite: 4]
    nombre = Column(String) #[cite: 3, 4]
    apellido = Column(String) #[cite: 3, 4]
    contrasena = Column(String) #[cite: 3, 4]
    rol = Column(String) #[cite: 3, 4]
    estado = Column(String) #[cite: 3, 4]
    
    # Configuración de herencia polimórfica
    __mapper_args__ = {
        'polymorphic_on': rol,
        'polymorphic_identity': 'usuario'
    }

    def validarContrasena(self, password_input: str) -> bool: #[cite: 3]
        return self.contrasena == password_input

class Paciente(Usuario):
    __tablename__ = 'Paciente'
    num_paciente = Column(String, primary_key=True) #[cite: 4]
    id_usuario = Column(Integer, ForeignKey('Usuario.id_usuario', ondelete="CASCADE", onupdate="CASCADE"), unique=True) #[cite: 4]
    estado_clinico = Column(String) #[cite: 3, 4]
    
    citas = relationship("Cita", back_populates="paciente")
    expediente = relationship("Expediente", back_populates="paciente", uselist=False)

    __mapper_args__ = {
        'polymorphic_identity': 'paciente'
    }

class Empleado(Usuario):
    __tablename__ = 'Empleado'
    num_empleado = Column(String, primary_key=True) #[cite: 4]
    id_usuario = Column(Integer, ForeignKey('Usuario.id_usuario', ondelete="CASCADE", onupdate="CASCADE"), unique=True) #[cite: 4]
    telefono = Column(String) #[cite: 3, 4]
    lugar_asignado = Column(String) #[cite: 3, 4]
    horario = Column(String) #[cite: 3, 4]
    especialidad = Column(String) #[cite: 4]

    citas_atendidas = relationship("Cita", back_populates="empleado")

    __mapper_args__ = {
        'polymorphic_identity': 'empleado'
    }

class Cita(Base):
    __tablename__ = 'Cita'
    num_cita = Column(Integer, primary_key=True, autoincrement=True) #[cite: 4]
    fecha = Column(Date) #[cite: 3, 4]
    hora = Column(Time) #[cite: 3, 4]
    estado = Column(String) #[cite: 3, 4]
    motivo_cancelacion = Column(String) #[cite: 3, 4]
    num_paciente = Column(String, ForeignKey('Paciente.num_paciente', ondelete="CASCADE", onupdate="CASCADE")) #[cite: 4]
    num_empleado = Column(String, ForeignKey('Empleado.num_empleado', ondelete="CASCADE", onupdate="CASCADE")) #[cite: 4]

    paciente = relationship("Paciente", back_populates="citas")
    empleado = relationship("Empleado", back_populates="citas_atendidas")