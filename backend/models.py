from datetime import datetime
from sqlalchemy import Column, Integer, String, Date, Time, ForeignKey, func, case
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
        'polymorphic_on': case(
            (func.lower(rol).in_(['secretaria', 'asistente']), 'secretaria'),
            (func.lower(rol).in_(['doctor', 'medico', 'médico']), 'doctor'),
            else_=func.lower(rol)
        ),
        'polymorphic_identity': 'usuario'
    }

    def validarContrasena(self, password_input: str) -> bool: 
        return self.contrasena == password_input

    @classmethod
    def iniciarSesion(cls, db: Session, correo_input: str, contrasena_input: str):
        user = db.query(cls).filter(cls.correo == correo_input).first()
        if not user:
            row = db.execute(
                text("SELECT id_usuario, nombre, apellidos, contrasena, rol, estado, correo FROM usuario WHERE correo = :correo"),
                {"correo": correo_input}
            ).mappings().first()
            if row and row["contrasena"] == contrasena_input:
                rol_str = (row["rol"] or "").lower().strip()
                if rol_str in ("secretaria", "asistente"):
                    return Asistente(
                        id_usuario=row["id_usuario"],
                        nombre=row["nombre"],
                        apellidos=row["apellidos"],
                        contrasena=row["contrasena"],
                        rol=row["rol"],
                        estado=row["estado"],
                        correo=row["correo"]
                    )
                return Usuario(
                    id_usuario=row["id_usuario"],
                    nombre=row["nombre"],
                    apellidos=row["apellidos"],
                    contrasena=row["contrasena"],
                    rol=row["rol"],
                    estado=row["estado"],
                    correo=row["correo"]
                )
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
    lugar_asignado = None

    __mapper_args__ = {
        'polymorphic_identity': 'empleado'
    }

    def editarPerfil(self):
        pass


class Medico(Empleado):
    especialidad = None

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

    def buscarPaciente(self, db: Session, num_paciente_ingresado: str):
        if not num_paciente_ingresado:
            return None
        criterio = num_paciente_ingresado.strip()
        paciente = db.query(Paciente).filter(
            Paciente.num_paciente.ilike(criterio)
        ).first()
        if not paciente:
            paciente = db.query(Paciente).filter(
                (Paciente.nombre.ilike(f"%{criterio}%")) |
                (Paciente.apellidos.ilike(f"%{criterio}%"))
            ).first()
        return paciente

    def agendarCita(self, db: Session, fecha, hora, num_paciente_ingresado, num_medico):
        paciente = self.buscarPaciente(db, num_paciente_ingresado)
        if not paciente:
            return None

        nueva_cita = Cita(
            fecha=fecha,
            hora=hora,
            num_paciente=paciente.num_paciente,
            num_empleado_medico=num_medico,
            creada_por_usuario=self.id_usuario 
        )
        return nueva_cita.agendar(db)

    def hacerCheckIn(self, db: Session, num_cita: int):
        cita = db.query(Cita).filter(Cita.num_cita == num_cita).first()
        if not cita:
            raise ValueError("Cita no encontrada.")
        if (cita.estado or "").lower() != "pendiente":
            raise ValueError("Solo se puede hacer check-in a citas en estado 'Pendiente'.")
        
        cita.estado = "En sala"
        db.commit()
        db.refresh(cita)
        return cita


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

    def obtenerFechaHora(self) -> datetime:
        return datetime.combine(self.fecha, self.hora)

    def horasRestantes(self) -> float:
        ahora = datetime.now()
        diferencia = self.obtenerFechaHora() - ahora
        return diferencia.total_seconds() / 3600.0

    def puedeAgendarse(self) -> bool:
        return self.horasRestantes() >= 2.0

    def puedeCancelarse(self) -> bool:
        if (self.estado or "").lower() in ("cancelada", "atendido", "completada"):
            return False
        return self.horasRestantes() >= 48.0

    @property
    def horas_restantes(self) -> float:
        return round(self.horasRestantes(), 2)

    @property
    def cancelable(self) -> bool:
        return self.puedeCancelarse()

    @property
    def nombre_paciente(self) -> str:
        if self.paciente_obj:
            return f"{self.paciente_obj.nombre} {self.paciente_obj.apellidos}".strip()
        return self.num_paciente or "Paciente"

    @property
    def nombre_medico(self) -> str:
        if self.medico_obj:
            return f"Dr. {self.medico_obj.nombre} {self.medico_obj.apellidos}".strip()
        mapa_medicos = {
            "EMP-001": "Dr. Alejandro Ruiz",
            "EMP-002": "Dra. Valeria Salas",
            "EMP-003": "Dr. Fernando Castro"
        }
        return mapa_medicos.get(self.num_empleado_medico, f"Médico ({self.num_empleado_medico})")

    def agendar(self, db: Session):
        if not self.puedeAgendarse():
            raise ValueError("Solo se pueden agendar citas con al menos 2 horas de anticipación.")
        self.estado = "Pendiente"
        db.add(self)
        db.commit()
        db.refresh(self)
        return self

    def cancelar(self, db: Session, motivo: str = "Cancelada por el usuario", force: bool = False):
        if not force and not self.puedeCancelarse():
            raise ValueError("Solo se pueden cancelar citas con 48 horas o más de anticipación.")
        self.estado = "Cancelada"
        self.mot_cancelacion = motivo
        db.commit()
        db.refresh(self)
        return self