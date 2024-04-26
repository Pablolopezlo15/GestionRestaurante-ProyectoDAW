import React, { useState } from "react";
import { useEffect } from "react";
import { getFirestore, collection, getDocs, setDoc } from "firebase/firestore";
import { Link } from "react-router-dom";
import '../assets/css/carta.css';

function Carta() {

    const [carta, setCarta] = useState([]);

    useEffect(() => {
        async function fetchData() {
            const db = getFirestore();
            const data = await getDocs(collection(db, "carta"));
            setCarta(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
        }
        fetchData();
    }, []);

    return (
        <>
            <div className="container">
                <div>
                    <div className="col-md-12">
                        <h1>Carta</h1>
                        <p>En esta sección se mostrará la carta del restaurante</p>
                        {/* <Link to="/">Volver al Inicio</Link>
                        <Link to="/login">Iniciar Sesión</Link> */}
                    </div>
                </div>

                <div className="section">
                    {
                        carta.map((item) => {
                            return (
                                <div className="card" key={item.nombre}>
                                    <img src={item.imagen} alt={item.nombre} />
                                    <h3>{item.nombre}</h3>
                                    <p><strong>Precio: </strong>{item.precio} €</p>
                                    <p><strong>Ingredientes: </strong>{item.ingredientes}</p>
                                </div>
                            );
                        })
                    }
                </div>

                </div>
        </>
    );
}

export default Carta;