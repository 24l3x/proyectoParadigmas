from fastapi import FastAPI
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
# Formato: postgresql://usuario:contraseña@host:puerto/base_de_datos
# El host es 'db' porque así se llama el servicio en el docker-compose
DATABASE_URL = "postgresql://user:host@db:5432/Hospital"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
app = FastAPI()
@app.get("/")
def ruta_principal():
    return {"mensaje": "¡El servidor de Python y SQLAlchemy están listos!"}