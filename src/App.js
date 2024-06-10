import React, { useEffect, useRef } from 'react';
import './assets/css/index.css';
import './assets/css/Home.css';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

function App() {
    let currentSlide = useRef(1);

    function changeSlide(n) {
        showSlide(currentSlide.current += n);
    }

    function showSlide(n) {
        const slides = document.querySelector('.slides2');
        if (n > 5) { currentSlide.current = 1; }
        if (n < 1) { currentSlide.current = 5; }
        slides.style.transform = `translateX(${-(currentSlide.current - 1) * 100}%)`;
    }

    useEffect(() => {
        showSlide(currentSlide.current);
    }, []);

    const customIcon = new L.Icon({
        iconUrl: 'https://leafletjs.com/examples/custom-icons/leaf-red.png',
        shadowUrl: 'https://leafletjs.com/examples/custom-icons/leaf-shadow.png',
        iconSize: [38, 95],
        shadowSize: [50, 64],
        iconAnchor: [22, 94],
        shadowAnchor: [4, 62],
        popupAnchor: [-3, -76]
    });

    return (
        <div className="App">
            <header className="App-header text-center">
                <h1>Restaurante Pablo López</h1>
                <p>Bienvenido a la web</p>
                <div>
                    <p className='inicio-empleado'>¿Eres empleado? <button className="btn"><Link className='link-inicio' to="/login">Iniciar sesión</Link></button></p>
                </div>
            </header>

            <main>
                <section className='d-flex flex-column align-items-center slidercontenedor'>
                    <div className="slider2">
                        <h2 className='text-center'>Visita nuestra carta <Link className='link' to="/carta">aquí</Link></h2>
                        <div className="slides2">
                            <div className="slide2" id="slide1">
                                <img src='https://firebasestorage.googleapis.com/v0/b/gestion--restaurante.appspot.com/o/images%2Fprimer-plano-de-la-pizza-prosciutto-o-de-jamon-cocido.webp?alt=media&token=d82b7977-ed10-46ac-9297-af077c9dd4fa' className="slide2-img" />
                                <p>Pizzas</p>
                            </div>
                            <div className="slide2" id="slide2">
                                <img src='' className="slide2-img" />
                                <p>Valoración <b> pAAAAA </b><i className="ri-star-line"></i></p>
                            </div>
                        </div>
                        <button className="prev" onClick={() => changeSlide(-1)}>&#10094;</button>
                        <button className="next" onClick={() => changeSlide(+1)}>&#10095;</button>
                    </div>
                </section>

                <section className="contact-section">
                    <h2>Contacta con Nosotros</h2>
                    <div className="contact-info">
                        <p><strong>Dirección:</strong> Calle Ejemplo 123, Ciudad, País</p>
                        <p><strong>Teléfono:</strong> +34 123 456 789</p>
                        <p><strong>Email:</strong> contacto@restaurantepablolopez.com</p>
                    </div>
                    <div id="map">
                    <MapContainer center={[37.1773363, -3.5985571]} zoom={13} style={{ height: "400px", width: "100%" }}>
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        <Marker position={[37.1773363, -3.5985571]} icon={customIcon}>
                            <Popup>
                                Restaurante Pablo López. <br /> Calle Ejemplo 123.
                            </Popup>
                        </Marker>
                    </MapContainer>
                    </div>
                </section>
            </main>

            <footer className="footer">
                <p>&copy; 2024 Restaurante Pablo López. Todos los derechos reservados.</p>
                <p>Síguenos en nuestras redes sociales:
                    <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer"> Facebook</a>,
                    <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer"> Twitter</a>,
                    <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer"> Instagram</a>
                </p>
            </footer>
        </div>
    );
}

export default App;
