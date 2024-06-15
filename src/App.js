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
            <header className="App-header text-center d-flex flex-column justify-content-end">
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
                                <img src='https://firebasestorage.googleapis.com/v0/b/gestion--restaurante.appspot.com/o/patatas-cheese-bacon-foto-principal.jpg?alt=media&token=f68b630f-412c-45b6-ad48-5473a00e809b' className="slide2-img" />
                                <p>Entrantes</p>
                            </div>
                            <div className="slide2" id="slide2">
                                <img src='https://firebasestorage.googleapis.com/v0/b/gestion--restaurante.appspot.com/o/images%2Fprimer-plano-de-la-pizza-prosciutto-o-de-jamon-cocido.webp?alt=media&token=d82b7977-ed10-46ac-9297-af077c9dd4fa' className="slide2-img" />
                                <p>Pizzas</p>
                            </div>
                            <div className="slide2" id="slide3">
                                <img src='https://firebasestorage.googleapis.com/v0/b/gestion--restaurante.appspot.com/o/images%2Fsolomillo-de-ternera-a-la-plancha_1000.webp?alt=media&token=75d82e87-7f3b-41bd-8279-79a17bfa58cb' className="slide2-img" />
                                <p>Carnes</p>
                            </div>
                            <div className="slide2" id="slide4">
                                <img src='https://firebasestorage.googleapis.com/v0/b/gestion--restaurante.appspot.com/o/images%2Fbacalao-al-horno-PORTADA-1.jpg?alt=media&token=96453736-421a-48d0-95ea-39e89be4cb0b' className="slide2-img" />
                                <p>Pescados</p>
                            </div>
                            <div className="slide2" id="slide5">
                                <img src='https://firebasestorage.googleapis.com/v0/b/gestion--restaurante.appspot.com/o/images%2FCaptura%20de%20pantalla%202024-06-11%20032113.png?alt=media&token=8f60b55a-f4c0-47ff-b5f0-86a06fb1af38' className="slide2-img" />
                                <p>Postres</p>
                            </div>
                        </div>
                        <button className="prev" onClick={() => changeSlide(-1)}>&#10094;</button>
                        <button className="next" onClick={() => changeSlide(+1)}>&#10095;</button>
                    </div>
                </section>

                <section className='d-flex justify-content-center align-items-center flex-column mb-5'>
                    <h2>Nuestros mejores platos</h2>
                    <div className='d-flex gap-5 flex-wrap justify-content-center align-items-center mt-5'>
						<div className="card-home">
                          	<div className="content">
                            	<div className="back">
                              		<div className="back-content">
                                		<strong>Descubrir</strong>
                              		</div>
                            	</div>
                            	<div className="front">
		
                            	  	<div className="img">
                            	    	<img src="https://firebasestorage.googleapis.com/v0/b/gestion--restaurante.appspot.com/o/images%2FCaptura%20de%20pantalla%202024-06-14%20235506.png?alt=media&token=9a2d953d-64d1-4d1a-9a47-6b7faa54359f" alt="" />
                            	  	</div>
		
                            	  	<div className="front-content">
                            	    	<small className="badge">Carne</small>
                            	    	<div className="description">
                            	      		<div className="title">
                            	        		<p className="title"><strong>Solomillo de cerdo</strong></p>
                            	      		</div>
                            	      		<p className="card-footer">16 € &nbsp; | &nbsp; plato</p>
                            	    	</div>
                            	  	</div>

                            	</div>
                          	</div>
                        </div>

                        <div className="card-home">
                          	<div className="content">
                            	<div className="back">
                              		<div className="back-content">
                                		<strong>Descubrir</strong>
                              		</div>
                            	</div>
                            	<div className="front">
		
                            	  	<div className="img">
                            	    	<img src="https://firebasestorage.googleapis.com/v0/b/gestion--restaurante.appspot.com/o/images%2FCaptura%20de%20pantalla%202024-06-04%20125116.png?alt=media&token=48aad2bb-7531-4665-86e0-284d27ded6f7" alt="" />
                            	  	</div>
		
                            	  	<div className="front-content">
                            	    	<small className="badge">Entrante</small>
                            	    	<div className="description">
                            	      		<div className="title">
                            	        		<p className="title"><strong>Gambas al pil pil</strong></p>
                            	      		</div>
                            	      		<p className="card-footer">14 € &nbsp; | &nbsp; ración</p>
                            	    	</div>
                            	  	</div>

                            	</div>
                          	</div>
                        </div>

                        <div className="card-home">
                          	<div className="content">
                            	<div className="back">
                              		<div className="back-content">
                                		<strong>Descubrir</strong>
                              		</div>
                            	</div>
                            	<div className="front">
		
                            	  	<div className="img">
                            	    	<img src="https://firebasestorage.googleapis.com/v0/b/gestion--restaurante.appspot.com/o/images%2Fcoulant-chocolate.webp?alt=media&token=938faa95-b625-486f-8467-a15871407328" alt="" />
                            	  	</div>
		
                            	  	<div className="front-content">
                            	    	<small className="badge">Postre</small>
                            	    	<div className="description">
                            	      		<div className="title">
                            	        		<p className="title"><strong>Coulant de chocolate</strong></p>
                            	      		</div>
                            	      		<p className="card-footer">4,50 € &nbsp; | &nbsp; ración</p>
                            	    	</div>
                            	  	</div>

                            	</div>
                          	</div>
                        </div>
                    </div>
                
                </section>

                <section className='text-center'>
                    <h2>Contacta con Nosotros</h2>
                    <div className="contact-section">

                        <div className="contact-info">
                            <p><strong>Dirección:</strong> C/ Recogidas, Granada, España</p>
                            <p><strong>Teléfono:</strong> +34 900 00 00 00</p>
                            <p><strong>Email:</strong> <a href="mailto:plopezlozano12@gmail.com">plopezlozano12@gmail.com</a></p>
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
                    </div>
                </section>
            </main>

            <footer className="footer">
                <p>Síguenos en nuestras redes sociales:
                    <a href="https://www.facebook.com" target="_blank"><i className="ri-facebook-fill"></i></a>
                    <a href="https://www.twitter.com" target="_blank"><i className="ri-twitter-x-fill"></i></a>
                    <a href="https://www.instagram.com" target="_blank"><i className="ri-instagram-fill"></i></a>
                </p>
                <p>&copy; 2024 Restaurante Pablo López.</p>
            </footer>
        </div>
    );
}

export default App;
