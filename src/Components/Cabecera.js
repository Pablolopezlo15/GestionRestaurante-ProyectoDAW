
import React from 'react';
import { useEffect, useState } from 'react';
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, getDocs, onSnapshot, query, doc, updateDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { set } from 'firebase/database';


function Cabecera() {
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);

    const [comandasPendientes, setComandasPendientes] = useState([]);
    const [comandasListas, setComandasListas] = useState([]);

    const auth = getAuth();
    const db = getFirestore();

    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            setUser(user);
    });
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                comprobarRol(user);
                obtenerNumeroComandasPendientes();
    
                const unsubscribeSnapshot = onSnapshot(collection(db, "users"), (snapshot) => {
                    snapshot.docChanges().forEach((change) => {
                        if (change.doc.data().uid === user.uid) {
                            setIsAdmin(change.doc.data().rol === 'admin');
                            if (change.type === "modified" && change.doc.data().estado === 'inactivo') {
                                cerrarSesion();
                            }
                        }
                    });
                });
    
                return () => {
                    unsubscribeSnapshot();
                    unsubscribe();
                }
            }
        });
    }, [auth, db]);

    async function comprobarRol(user) {
        const usersSnapshot = await getDocs(collection(db, "users"));
        usersSnapshot.forEach((doc) => {
            if (doc.data().uid === user.uid && doc.data().rol === 'admin') {
                setIsAdmin(true);
            }
        });
    }

    function cerrarSesion() {

        signOut(auth).then(() => {
            console.log("Sesión cerrada y estado actualizado");
            // Sign-out successful.
        }).catch((error) => {
            // An error happened during sign out.
        });

    }
    

    function obtenerNumeroComandasPendientes() {
        const q = query(collection(db, 'comandas'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const newComandas = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const comandas = newComandas.filter(comanda => comanda.estado === 'Pendiente');
            const comandasListas = newComandas.filter(comanda => comanda.estado === 'Listo');
            setComandasPendientes(comandas.length);
            setComandasListas(comandasListas.length);
        });
    
        return unsubscribe;
    }

    return (
        <>
            <header>
                <nav className="navbar navbar-expand-lg bg-body-tertiary">
                    <div className="container-fluid">
                        <Link className="navbar-brand" to="/"><img src="https://firebasestorage.googleapis.com/v0/b/gestion--restaurante.appspot.com/o/logo512.png?alt=media&token=a298d274-8701-4272-aba8-1866919185c6" className='img-logo' alt="Logo" /></Link>                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                        <div className="collapse navbar-collapse" id="navbarNavDropdown">
                            <ul className="navbar-nav">
                                <li className="nav-item btn-cabecera">
                                    <Link className="nav-link" to="/carta">Carta</Link>
                                </li>
                                { !user && 
                                    <li className="nav-item btn-cabecera">
                                        <Link className="nav-link" to="/login">Inicia Sesión</Link>
                                    </li>
                                }
                                { user && 
                                <>
                                    <li className="nav-item btn-cabecera">
                                        <Link className="nav-link" to="/mesas">Mesas</Link>
                                    </li>
                                    <li className="nav-item btn-cabecera">
                                        <Link className="nav-link" to="/comanda">Comandas 
                                        {comandasPendientes > 0 && <span className='text-danger'> {comandasPendientes} </span>}
                                        {comandasListas > 0 && <span className='text-success'> {comandasListas} </span>}
                                        </Link>
                                    </li>
                                    <li className="nav-item dropdown btn-cabecera">
                                        <a className="nav-link dropdown-toggle"  role="button" data-bs-toggle="dropdown" aria-expanded="false">Bienvenido, {user.displayName}</a>
                                            <ul className="dropdown-menu">
                                            {isAdmin && (
                                                <>
                                                    <li><Link className="dropdown-item" to="/gestionarusuarios">Gestionar Usuarios</Link></li>
                                                    <li><Link className="dropdown-item" to="/gestionarcarta">Gestionar Carta</Link></li>
                                                    <li><Link className="dropdown-item" to="/gestionarmesas">Gestionar Mesas</Link></li>
                                                    <li><Link className="dropdown-item" to="/registromesas">Registro Mesas</Link></li>
                                                </>
                                            )}
                                                <li><a className="dropdown-item" href="#" onClick={cerrarSesion}>Cerrar Sesión</a></li>
                                            </ul>
                                    </li>

                                </>
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