import app from '../firebase';
import { getAuth, signInWithEmailAndPassword, updateProfile, signOut, onAuthStateChanged, sendEmailVerification, sendPasswordResetEmail } from 'firebase/auth';
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
    const [emailVerified, setEmailVerified] = useState(true);
    const [contraseñaOlvidada, setContraseñaOlvidada] = useState(false);

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
                const user = userCredential.user;
                console.log(user.emailVerified);
    
                if (!user.emailVerified) {
                    setEmailVerified(false);
                    sendEmailVerification(user)
                        .then(() => {
                            console.log("Correo de verificación enviado");
                        }
                        ).catch((error) => {
                            console.log(error);
                        });
                        cerrarSesion();

                    return;
                }
                navigate("/");
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

    function emailRecuperacionContraseña(e) {
        e.preventDefault();
        sendPasswordResetEmail(auth, email)
            .then(() => {
                console.log("Correo de recuperación de contraseña enviado");

            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                // ..
            });
    }
  

    return (

        <div className="container">
            <h1 className="text-center my-4">Inicio de Sesión</h1>
            {!emailVerified && 
                <div className="alert alert-warning d-flex flex-column gap-2">
                    <p>El correo electrónico no ha sido verificado.</p>
                    <p>Se ha enviado un correo de verificación a tu correo electrónico. Por favor, verifica tu correo electrónico para poder iniciar sesión.</p>
                </div>
            }


            { errorPorCorreoExisitente && <p className="alert alert-danger">{errorPorCorreoExisitente}</p> }
            <p className='text-center mb-3'>¿Eres un empleado del restaurante y no tienes acceso? Ponte en contacto con tu administrador</p>
            { user && <p className="alert alert-success">Bienvenido {user.email}</p> }
            { !user &&
                <form>
                    <div className="form-group">
                        <input type="email" className="form-control" placeholder="Correo Electrónico" onChange={e => setEmail(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <input type="password" className="form-control" placeholder="Contraseña" onChange={e => setPassword(e.target.value)} />
                    </div>
                    <p>¿Has olvidado tu contraseña? <a href='#' onClick={()=>setContraseñaOlvidada(!contraseñaOlvidada)}> Recuperar Aquí</a></p>
                    { contraseñaOlvidada && 
                        <div className="form-group">
                            <input type="email" className="form-control" placeholder="Correo Electrónico" onChange={e => setEmail(e.target.value)} />
                            <button className="button1 mt-3" onClick={emailRecuperacionContraseña}>Enviar correo de recuperación</button>
                        </div>
                    }

                    <button className="button1" onClick={iniciarSesionEmail}>Iniciar Sesión</button>
                </form>
            }
            { user && 
                <>
                    <p className="alert alert-info">Ya has iniciado sesión</p> 
                    <button className="btn btn-danger" onClick={cerrarSesion}>Cerrar Sesión</button>
                </>
            }
        </div>
    );
}

export default InicioSesion;