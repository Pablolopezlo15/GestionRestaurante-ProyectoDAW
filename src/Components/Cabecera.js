
import React from 'react';
import { useEffect, useState } from 'react';
import { getAuth, signOut, onAuthStateChanged  } from 'firebase/auth';
import { Link } from 'react-router-dom';

function Cabecera() {
    const [user, setUser] = useState(null);
    const auth = getAuth();

    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            setUser(user);
    });
    }, []);

    let userName = null;
    console.log(auth.currentUser);

    if (auth.currentUser) {
        let uid = auth.currentUser.uid;
        let userName = auth.currentUser.displayName;
        console.log('Usuario logueado: ' + userName + ' con uid: ' + uid);
    }

    function logout() { 
        const auth = getAuth();
        signOut(auth).then(() => {
            console.log('Sesión cerrada');
        }).catch((error) => {
          // An error happened.
        });
    }

    return (
        <>
            {/* <header style={{display: 'flex', justifyContent: 'space-between'}}>   
                <nav style={{display: 'flex', alignItems: 'center', gap: '2rem'}}>
                    <Link to="/">Inicio</Link>
                    <Link to="/carta">Carta</Link>
                    <Link to="/mesas">Mesas</Link>
                    <Link to="/comanda">Comandas</Link>
                </nav>
                { !user && <Link to="/login">Inicia Sesión</Link> }
                { user && 
                    <>
                        <p>Bienvenido, {user.email}</p>
                        <button onClick={logout}>Cerrar sesión</button> 
                    </>
                }

            </header> */}

            <header>
                <nav class="navbar navbar-expand-lg bg-body-tertiary">
                  <div class="container-fluid">
                    <a class="navbar-brand" href="#"><Link to="/">Inicio</Link></a>
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
                      <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="navbarNavDropdown">
                      <ul class="navbar-nav">
                        <li class="nav-item">
                          <a class="nav-link" href="#"><Link to="/carta">Carta</Link></a>
                        </li>
                        <li class="nav-item">
                          <a class="nav-link" href="#"><Link to="/mesas">Mesas</Link></a>
                        </li>
                        <li class="nav-item">
                          <a class="nav-link" href="#"><Link to="/comanda">Comandas</Link></a>
                        </li>
                        { !user && 
                        <li class="nav-item dropdown">
                          <a class="nav-link dropdown-toggle"  role="button" data-bs-toggle="dropdown" aria-expanded="false">
                          <Link to="/login">Inicia Sesión</Link> 
                          </a>
                          
                          <ul class="dropdown-menu">
                            <li><a class="dropdown-item" href="#">Action</a></li>
                            <li><a class="dropdown-item" href="#">Another action</a></li>
                            <li><a class="dropdown-item" href="#">Something else here</a></li>
                          </ul>
                        </li>
                        }
                        { user && 
                        <li class="nav-item dropdown">
                          <a class="nav-link dropdown-toggle"  role="button" data-bs-toggle="dropdown" aria-expanded="false">
                          Bienvenido, {user.email}
                          </a>
                          
                          <ul class="dropdown-menu">
                            <li><a class="dropdown-item" href="#">Action</a></li>
                            <li><a class="dropdown-item" href="#">Another action</a></li>
                            <li><a class="dropdown-item" href="#">Cerrar Sesión</a></li>
                          </ul>
                        </li>
                        }
                      </ul>
                    </div>
                  </div>
                </nav>
            </header>
        </>
    );
}

export default Cabecera;