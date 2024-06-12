import app from '../firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, getDocs, setDoc, doc } from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification, signOut } from 'firebase/auth';

function Registro() {
    const auth = getAuth(app);
    const db = getFirestore(app);

    let user = auth.currentUser;
    const [isAdmin, setIsAdmin] = useState(false);
    const [errorYaEnUso, setErrorYaEnUso] = useState(false);

    async function comprobarRol(user) {
        const usersSnapshot = await getDocs(collection(db, "users"));
        usersSnapshot.forEach((doc) => {
            if (doc.data().uid === user.uid && doc.data().rol === 'admin') {
                setIsAdmin(true);
            }
        });
    }

    function registro(e) {
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
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                comprobarRol(user);
            }
        });

        return () => unsubscribe();
    }, [auth]);

    return(
        <div className='d-flex flex-column w-100 justify-content-center align-items-center'>
            {isAdmin && (
                <>
                    <h1>Registro</h1>
                    {errorYaEnUso && <p className='text-danger'>El correo ya está en uso</p>}
                    <form className='form-edit-producto w-75'>
                        <label>Nombre: 
                            <input type="text" name="nombre" id="nombre" />
                        </label>
                        <label>Rol: 
                            <select name="rol">
                                <option value="admin">Administrador</option>
                                <option value="user">Usuario</option>
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