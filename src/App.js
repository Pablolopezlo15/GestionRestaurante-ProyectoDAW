import React from 'react';
import './assets/css/index.css';



function App() {
    let nombre = ["Juan", "Pedro", "Maria"];
    nombre = nombre[Math.floor(Math.random() * nombre.length)];
    return (
        <div className="App">
            <header className="App-header">
                <h1>Gestión de Restaurante</h1>
                <p>Bienvenido {nombre}</p>
            </header>
        </div>
    );
}

export default App;
