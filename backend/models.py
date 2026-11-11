from sqlalchemy import Column, Integer, String, Date, Time, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import declarative_base, relationship, Session
from sqlalchemy.sql import text

Base = declarative_base()

class Usuario(Base):
    __tablename__ = 'usuario'
    id_usuario = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    nombre = Column(String, nullable=False)
    apellidos = Column(String, nullable=False)
    contrasena = Column(String, nullable=False)
    rol = Column(String, nullable=False)
    estado = Column(String, nullable=False)
    correo = Column(String)
    
    __mapper_args__ = {
        'polymorphic_on': rol,
        'polymorphic_identity': 'usuario'
    }

    def validarContrasena(self, password_input: str) -> bool: 
        return self.contrasena == password_input

    @classmethod
    def iniciarSesion(cls, db: Session, correo_input: str, contrasena_input: str):
        user = db.query(cls).filter(cls.correo == correo_input).first()
        if user and user.validarContrasena(contrasena_input):
            return user
        return None

class Paciente(Usuario):
    __tablename__ = 'paciente'
    id_usuario = Column(UUID(as_uuid=True), ForeignKey('usuario.id_usuario'), primary_key=True)
    num_paciente = Column(String, unique=True, nullable=False) # Equivale a id_paciente del UML
    estado_clinico = Column(String)
    
    citas_como_paciente = relationship("Cita", foreign_keys="[Cita.num_paciente]", back_populates="paciente_obj")

    __mapper_args__ = {
        'polymorphic_identity': 'paciente'
    }

    def agendarCita(self, db: Session, fecha, hora, num_medico):
        nueva_cita = Cita(
            fecha=fecha,
            hora=hora,
            num_paciente=self.num_paciente,
            num_empleado_medico=num_medico,
            creada_por_usuario=self.id_usuario
        )
        return nueva_cita.agendar(db)

    def darDeAlta(self, motivo: str):
        pass


class Empleado(Usuario):
    __tablename__ = 'empleado'
    id_usuario = Column(UUID(as_uuid=True), ForeignKey('usuario.id_usuario'), primary_key=True)
    num_empleado = Column(String, unique=True, nullable=False)
    telefono = Column(String)
    lugar_asignado = Column(String, nullable=True)

    __mapper_args__ = {
        'polymorphic_identity': 'empleado'
    }

    def editarPerfil(self):
        pass


class Medico(Empleado):
    especialidad = Column(String, nullable=True)

    __mapper_args__ = {
        'polymorphic_identity': 'doctor'
    }

    citas_atendidas = relationship("Cita", foreign_keys="[Cita.num_empleado_medico]", back_populates="medico_obj")

    def recetarTratamiento(self):
        pass


class Asistente(Empleado):
    __mapper_args__ = {
        'polymorphic_identity': 'secretaria'
    }

    
    def agendarCita(self, db: Session, fecha, hora, num_paciente_ingresado, num_medico):
        nueva_cita = Cita(
            fecha=fecha,
            hora=hora,
            num_paciente=num_paciente_ingresado,
            num_empleado_medico=num_medico,
            creada_por_usuario=self.id_usuario 
        )
        return nueva_cita.agendar(db)

    def hacerCheckIn(self):
        pass


class Admin(Empleado):
    __mapper_args__ = {
        'polymorphic_identity': 'admin'
    }

    
    def crearUsuario(self):
        pass

    def eliminarUsuario(self):
        pass


class Cita(Base):
    __tablename__ = 'cita'
    num_cita = Column(Integer, primary_key=True, autoincrement=True)
    fecha = Column(Date, nullable=False)
    hora = Column(Time, nullable=False)
    estado = Column(String, nullable=False)
    mot_cancelacion = Column(String)
    num_paciente = Column(String, ForeignKey('paciente.num_paciente'))
    num_empleado_medico = Column(String, ForeignKey('empleado.num_empleado'))
    creada_por_usuario = Column(UUID(as_uuid=True), ForeignKey('usuario.id_usuario'))

    paciente_obj = relationship("Paciente", foreign_keys=[num_paciente], back_populates="citas_como_paciente")
    medico_obj = relationship("Medico", foreign_keys=[num_empleado_medico], back_populates="citas_atendidas")
    creador_obj = relationship("Usuario", foreign_keys=[creada_por_usuario])

    def agendar(self, db: Session):
        self.estado = "Pendiente"
        db.add(self)
        db.commit()
        db.refresh(self)
        return self