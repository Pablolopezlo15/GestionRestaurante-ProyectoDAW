import React, { useEffect, useRef } from 'react';
import './assets/css/index.css';
import './assets/css/Home.css';
import {
    BrowserRouter as Router,
    Route,
    Link,
} from "react-router-dom";

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

    return (
        <div className="App">
            <header className="App-header text-center">
                <h1>Restaurante Pablo López</h1>
                <p>Bienvenido a la web</p>
                <div>
                    <p className='inicio-empleado'>¿Eres empleado? <button class="btn"><Link className='link-inicio' to="/login">Iniciar sesión</Link></button></p>
                </div>
            </header>

            <main>

                {/* <div>
                    <img className='d-flex w-50' src="https://firebasestorage.googleapis.com/v0/b/gestion--restaurante.appspot.com/o/logo512Blanco.png?alt=media&token=bdb88053-99fe-461c-8bb8-973f3623c150" alt="Logo" />
                </div> */}

                {/* <div className=''>
                    <h1>Gestión de Restaurante</h1>
                    <p>Bienvenido a la página</p>
                </div> */}

                <section className='d-flex flex-column align-items-center slidercontenedor'>
                    <div class="slider2">
                        <h2 className='text-center'>Visita nuestra carta <Link className='link' to="/carta">aquí</Link></h2>
                        <div class="slides2" >
                            <div class="slide2" id="slide1">
                                <img src='https://firebasestorage.googleapis.com/v0/b/gestion--restaurante.appspot.com/o/images%2Fprimer-plano-de-la-pizza-prosciutto-o-de-jamon-cocido.webp?alt=media&token=d82b7977-ed10-46ac-9297-af077c9dd4fa' class="slide2-img"/>
                                <p>Pizzas</p>
                            </div>
                            <div class="slide2" id="slide2">
                                <img src='' class="slide2-img"/>
                                <p>Valoración <b> pAAAAA </b><i class="ri-star-line"></i></p>
                            </div>
                      </div>
                      <button class="prev" onClick={() => changeSlide(-1)}>&#10094;</button>
                      <button class="next" onClick={() => changeSlide(+1)}>&#10095;</button>
                    </div>
                  </section>
            </main>
        </div>
    );
}

export default App;