import app from '../firebase';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, sendEmailVerification, sendPasswordResetEmail } from 'firebase/auth';
import { useState } from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFirestore, collection, getDocs, setDoc, doc, updateDoc, onSnapshot  } from "firebase/firestore";


const InicioSesion = () => {
    const auth = getAuth(app);
    const [user, setUser] = useState(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailVerified, setEmailVerified] = useState(true);
    const [contraseñaOlvidada, setContraseñaOlvidada] = useState(false);
    const [correoEnviado, setCorreoEnviado] = useState(false);

    const [usuarios, setUsuarios] = useState([]);
    const [inactivo, setInactivo] = useState(false);

    const [errorPorCorreoExisitente, seterrorPorCorreoExisitente] = useState('');
    const [errorValidacion, setErrorValidacion] = useState('');

    const db = getFirestore(app);


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            obtenerUsuarios();
        });

        return () => unsubscribe();
    }, [auth]);


    const navigate = useNavigate();

    function obtenerUsuarios(currentUser) {
        const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
            const users = [];
            snapshot.docs.forEach(doc => {
                users.push(doc.data());
            });
            setUsuarios(users);
            console.log('Usuarios obtenidos:', users);
        });

    }

    // Función para validar el correo electrónico
    const validarEmail = (email) => {
        return /\S+@\S+\.\S+/.test(email);
    };



    async function iniciarSesionEmail(e) {
        e.preventDefault();
        setErrorValidacion('');
        seterrorPorCorreoExisitente('');
        setEmailVerified(true);
        setInactivo(false);

        const auth = getAuth();

        // Validación del correo electrónico
        if (!validarEmail(email)) {
            setErrorValidacion('El formato del correo electrónico no es válido.');
            return;
        }
    
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log(user.emailVerified);
                
        
            const usuario = usuarios.find(usuario => usuario.correo === user.email);
            if (usuario.estado === 'inactivo') {
                setInactivo(true);
                cerrarSesion();
                return;
            }

            if (!user.emailVerified) {
                setEmailVerified(false);
                try {
                    await sendEmailVerification(user);
                    console.log("Correo de verificación enviado");
                } catch (error) {
                    console.log(error);
                }
                cerrarSesion();
                return;
            }

            navigate("/");

        } catch (error) {
            const errorCode = error.code;
            console.log(errorCode);
            if (errorCode === 'auth/invalid-credential') {
                seterrorPorCorreoExisitente('La contraseña no es válida o el usuario no tiene una contraseña.');
            }
        }
    }

    function cerrarSesion() {
        signOut(auth).then(() => {
            console.log("Sesión cerrada y estado actualizado");
            // Sign-out successful.
        }).catch((error) => {
            // An error happened during sign out.
        });

    }

    function emailRecuperacionContraseña(e) {
        e.preventDefault();
        sendPasswordResetEmail(auth, email)
            .then(() => {
                console.log("Correo de recuperación de contraseña enviado");
                setCorreoEnviado(true);
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
            { inactivo && <p className="alert alert-danger">Tu cuenta ha sido desactivada. Ponte en contacto con tu administrador</p> }
            { errorValidacion && <p className="alert alert-danger">{errorValidacion}</p>}
            { errorPorCorreoExisitente && <p className="alert alert-danger">{errorPorCorreoExisitente}</p> }
            <p className='text-center mb-3'>¿Eres un empleado del restaurante y no tienes acceso? Ponte en contacto con tu administrador</p>
            { user && <p className="alert alert-success">Bienvenido {user.email}</p> }
            { !user &&
                <div className='w-100 d-flex justify-content-center'>
                    <form className='w-50 form-incio-sesion'>
                        <div className="form-group">
                            <label>Correo Electrónico</label>
                            <input type="email" className="form-control" placeholder="Correo Electrónico" onChange={e => setEmail(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>Contraseña</label>
                            <input type="password" className="form-control" placeholder="Contraseña" onChange={e => setPassword(e.target.value)} />
                        </div>
                        <p>¿Has olvidado tu contraseña? <a href='#' onClick={()=>setContraseñaOlvidada(!contraseñaOlvidada)}> Recuperar Aquí</a></p>
                        { contraseñaOlvidada && 
                            <div className="form-group">
                                { correoEnviado && <p className="alert alert-success">Correo de recuperación enviado</p>}
                                <input type="email" className="form-control" placeholder="Correo Electrónico" onChange={e => setEmail(e.target.value)} />
                                <button className="button1 mt-3" onClick={emailRecuperacionContraseña}>Enviar correo de recuperación</button>
                            </div>
                        }

                        <button className="button1" onClick={iniciarSesionEmail}>Iniciar Sesión</button>
                    </form>
                </div>
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