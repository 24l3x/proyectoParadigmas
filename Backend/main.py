from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import declarative_base, sessionmaker, Session
# Formato: postgresql://usuario:contraseña@host:puerto/base_de_datos
# El host es 'db' porque así se llama el servicio en el docker-compose
DATABASE_URL = "postgresql://user:host@db:5432/Hospital"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
class SesionBD(Base):
    __tablename__ = "sesion"  # PostgreSQL guarda los nombres de tablas en minúsculas
    id = Column(Integer, primary_key=True)
    usuario = Column(String(50), unique=True)
    # 'pass' es una palabra reservada en Python, así que le asignamos el alias 'contrasena'
    contrasena = Column("pass", String(255)) 

# 3. El Esquema Pydantic (Para validar el JSON que llega desde JS)
class DatosLogin(BaseModel):
    user: str
    password: str
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependencia para abrir y cerrar la conexión en cada petición
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 5. La ruta que recibe el clic de "Iniciar sesión"
@app.post("/api/login")
def iniciar_sesion(datos: DatosLogin, db: Session = Depends(get_db)):
    # Ejecuta el equivalente a: SELECT * FROM sesion WHERE usuario = ? AND pass = ?
    usuario_encontrado = db.query(SesionBD).filter(
        SesionBD.usuario == datos.user, 
        SesionBD.contrasena == datos.password
    ).first()
    
    if usuario_encontrado:
        return {"status": "success", "mensaje": "Autenticado correctamente"}
    else:
        # Lanza un error HTTP 401 si no coinciden los datos
        raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos")