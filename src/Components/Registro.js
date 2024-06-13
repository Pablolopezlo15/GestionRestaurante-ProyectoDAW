import app from '../firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, getDocs, setDoc, doc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification, signOut } from 'firebase/auth';

function Registro() {
    const auth = getAuth(app);
    const db = getFirestore(app);

    let user = auth.currentUser;
    const [isAdmin, setIsAdmin] = useState(false);
    const [errorYaEnUso, setErrorYaEnUso] = useState(false);
    const [registrado, setRegistrado] = useState(false);
    const [loading, setLoading] = useState(false);

    async function comprobarRol(user) {
        const usersSnapshot = await getDocs(collection(db, "users"));
        usersSnapshot.forEach((doc) => {
            if (doc.data().uid === user.uid && doc.data().rol === 'admin') {
                setIsAdmin(true);
            }
        });
    }

    function registro(e) {
        setLoading(true);
        setErrorYaEnUso(false);
        setRegistrado(false);
        e.preventDefault();
    
        const nombre = document.getElementById('nombre').value;
        const correo = document.getElementById('correo').value;
        const contraseña = document.getElementById('contraseña').value;
        const rol = document.querySelector('select').value;

        createUserWithEmailAndPassword(auth, correo, contraseña, nombre, rol)
            .then((userCredential) => {
                console.log("Registrado");
                const user = userCredential.user;
                user.displayName = nombre;
                updateProfile(user, {
                    displayName: nombre,
                }).then(() => {
                    sendEmailVerification(user).then(() => {
                        console.log("Correo de verificación enviado");
                        setRegistrado(true);
                        setLoading(false);
                        signOut(auth);

                    }).catch((error) => {
                        console.log(error);
                    });
                    setDoc(doc(db, "users", user.uid), {
                        rol: rol,
                        uid: user.uid,
                        correo: correo,
                    });
                }).catch((error) => {
                    console.log(error);
                });
            })
            .catch((error) => {
                if (error.code === 'auth/email-already-in-use') {
                    setErrorYaEnUso(true);
                    console.log('El correo ya está en uso');
                }
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log(errorCode);
            });
        
    }


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                comprobarRol(user);
    
                const unsubscribeSnapshot = onSnapshot(collection(db, "users"), (snapshot) => {
                    snapshot.docChanges().forEach((change) => {
                        if (change.type === "modified" && change.doc.data().uid === user.uid) {
                            setIsAdmin(change.doc.data().rol === 'admin');
                        }
                    });
                });
    
                return () => {
                    unsubscribeSnapshot();
                    unsubscribe();
                }
            }
        });
    
        return () => unsubscribe();
    }, [auth]);

    return(
        <div className='d-flex flex-column w-100 justify-content-center align-items-center'>
            {isAdmin && (
                <>
                    <h1>Registro</h1>
                    {loading && 
                        <div className="spinner-border text-warning" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    }
                    {errorYaEnUso && <p className='text-danger'>El correo ya está en uso</p>}
                    {registrado && <p className='text-success'>Usuario registrado. Revisa tu correo para verificar tu cuenta</p>}
                    <form className='form-edit-producto  form-registro'>
                        <label>Nombre: 
                            <input type="text" name="nombre" id="nombre" />
                        </label>
                        <label>Rol: 
                            <select name="rol">
                                <option value="user">Usuario</option>
                                <option value="admin">Administrador</option>
                            </select>
                        </label>
                        <label>Correo: 
                            <input type="email" name="correo" id="correo" />
                        </label>
                        <label>Contraseña:
                            <input type="password" name="contraseña" id="contraseña" />
                        </label>
                        <button className='button1' onClick={registro}>Registrarse</button>
                    </form>
                </>
                
            )}
            {!isAdmin && <p>No tienes permisos para acceder a esta página</p>}
        </div>
    )
}

export default Registro;