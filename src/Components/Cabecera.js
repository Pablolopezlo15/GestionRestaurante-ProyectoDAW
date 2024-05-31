
import React from 'react';
import { useEffect, useState } from 'react';
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';

import '../assets/css/cabecera.css';
import GestionarCarta from './GestionarCarta';

function Cabecera() {
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);

    const auth = getAuth();
    const db = getFirestore();

    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            setUser(user);
    });
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                comprobarRol(user);
            }
        });

        return () => unsubscribe();
    }, [auth]);

    async function comprobarRol(user) {
        const usersSnapshot = await getDocs(collection(db, "users"));
        usersSnapshot.forEach((doc) => {
            if (doc.data().uid === user.uid && doc.data().rol === 'admin') {
                setIsAdmin(true);
            }
        });
    }

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
                <nav className="navbar navbar-expand-lg bg-body-tertiary">
                    <div class="container-fluid">
                        <a class="navbar-brand" href="#"><Link to="/"><img src="https://firebasestorage.googleapis.com/v0/b/gestion--restaurante.appspot.com/o/logo512.png?alt=media&token=a298d274-8701-4272-aba8-1866919185c6" className='img-logo' alt="Logo" /></Link></a>
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
                                    <li class="nav-item">
                                        <a class="nav-link" href="#"><Link to="/login">Inicia Sesión</Link></a>
                                    </li>
                                }
                                { user && 
                                    <li class="nav-item dropdown">
                                        <a class="nav-link dropdown-toggle"  role="button" data-bs-toggle="dropdown" aria-expanded="false">Bienvenido, {user.email}</a>
                                            <ul class="dropdown-menu">
                                            {isAdmin && (
                                                <>
                                                    <li><a class="dropdown-item" href="#">Gestionar Usuarios</a></li>
                                                    <li><Link class="dropdown-item" to="/gestionarcarta">Gestionar Carta</Link></li>
                                                </>
                                            )}
                                                <li><a class="dropdown-item" href="#" onClick={logout}>Cerrar Sesión</a></li>
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