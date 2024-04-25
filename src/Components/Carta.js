import { Link } from "react-router-dom";


function Carta() {


    return (
        <>
            <div className="container">
                <div className="row">
                    <div className="col-md-12">
                        <h1>Carta</h1>
                        <p>En esta sección se mostrará la carta del restaurante</p>
                        <Link to="/">Volver al Inicio</Link>
                        <Link to="/login">Iniciar Sesión</Link>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Carta;