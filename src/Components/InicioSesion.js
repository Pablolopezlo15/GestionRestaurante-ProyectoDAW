import app from '../firebase';
import { getAuth, signInWithEmailAndPassword, updateProfile, signOut, onAuthStateChanged } from 'firebase/auth';
import { useState } from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFirestore, collection, getDocs, setDoc, doc  } from "firebase/firestore";


const InicioSesion = () => {
    const auth = getAuth(app);
    const [user, setUser] = useState(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [error, setError] = useState(null);
    const [errorPorCorreoExisitente, seterrorPorCorreoExisitente] = useState('');

    const db = getFirestore(app);


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });

        return () => unsubscribe();
    }, [auth]);

    const navigate = useNavigate();



    function iniciarSesionEmail(e) {
        e.preventDefault();
        const auth = getAuth();
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed in 
                const user = userCredential.user;
                console.log(user);
                navigate("/");
                // ...
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log(errorCode);
                if (errorCode === 'auth/invalid-credential') {
                    seterrorPorCorreoExisitente('La contraseña no es válida o el usuario no tiene una contraseña.');
                }
            });
    }

    function cerrarSesion() {
        signOut(auth).then(() => {
            console.log("Sesión cerrada");
            // Sign-out successful.
        }).catch((error) => {
            // An error happened.
        });
    }
  




    return (

        <div>
            <h1>Inicio de Sesión</h1>
            { errorPorCorreoExisitente && <p>{errorPorCorreoExisitente}</p> }
            <p>¿Eres un empleado del restaurante y no tienes acceso? Ponte en contacto con tu administrador</p>
            <p>Introduce tu correo electrónico y contraseña para iniciar sesión</p>
            { user && <p>Bienvenido {user.email}</p> }
            { !user &&
                <form>
                    <input type="email" placeholder="Correo Electrónico" onChange={e => setEmail(e.target.value)} />
                    <input type="password" placeholder="Contraseña" onChange={e => setPassword(e.target.value)} />
                    <button onClick={iniciarSesionEmail}>Iniciar Sesión</button>
                </form>
            }
            { user && 
                <>
                    <p>Ya has iniciado sesión</p> 
                    <button onClick={cerrarSesion}>Cerrar Sesión</button>
                </>
            }
        </div>
    );
}

export default InicioSesion;