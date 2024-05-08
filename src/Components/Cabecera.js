
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
            <header style={{display: 'flex', justifyContent: 'space-between'}}>   
                <nav style={{display: 'flex', alignItems: 'center', gap: '2rem'}}>
                    <Link to="/">Inicio</Link>
                    <Link to="/carta">Carta</Link>
                    <Link to="/mesas">Mesas</Link>
                </nav>
                { !user && <Link to="/login">Inicia Sesión</Link> }
                { user && 
                    <>
                        <p>Bienvenido, {user.email}</p>
                        <button onClick={logout}>Cerrar sesión</button> 
                    </>
                }

            </header>
        </>
    );
}

export default Cabecera;