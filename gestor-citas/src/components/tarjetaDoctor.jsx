/*

const TarjetaDoctor = ({ nombre, especialidad }) => {
  return (
    <div className="tarjeta">
      <h3>Dr. {nombre}</h3>
      <p>Especialidad: {especialidad}</p>
      <button>Agendar Cita</button>
    </div>
  );
};

export default TarjetaDoctor;

*/
// Agregamos alSeleccionar en los paréntesis
const TarjetaDoctor = ({ nombre, especialidad, alSeleccionar }) => {
  return (
    <div className="tarjeta">
      <h3>Dr. {nombre}</h3>
      <p>Especialidad: {especialidad}</p>
      
      {/* En el onClick, ya no ejecutamos el alert(), sino la función que nos mandó papá (App) */}
      <button onClick={alSeleccionar}>Agendar Cita</button>
    </div>
  );
};

export default TarjetaDoctor;
