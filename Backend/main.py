from fastapi import FastAPI
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# 1. Credenciales de la Base de Datos
# Formato: mysql+pymysql://usuario:contraseña@host:puerto/base_de_datos
# El host es 'db' porque así se llama el servicio en el docker-compose
DATABASE_URL = "mysql+pymysql://user:host@db:3306/Hospital"

# 2. Configuración de SQLAlchemy
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# 3. Inicializamos FastAPI
app = FastAPI()

# 4. Creamos nuestra primera ruta de prueba
@app.get("/")
def ruta_principal():
    return {"mensaje": "¡El servidor de Python y SQLAlchemy están listos!"}