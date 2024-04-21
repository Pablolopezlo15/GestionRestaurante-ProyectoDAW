import app from '../firebase';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';


const InicioSesion = () => {
  const auth = getAuth(app);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = () => {
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed up 
        const user = userCredential.user;
        // ...
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        // ..
      });
  }

  return (
    <div>
      <h1>Inicio de Sesión</h1>
      <form onSubmit={e => { e.preventDefault(); handleSignUp(); }}>
        <input type="email" placeholder="Correo Electrónico" onChange={e => setEmail(e.target.value)} />
        <input type="password" placeholder="Contraseña" onChange={e => setPassword(e.target.value)} />
        <button type="submit">Iniciar Sesión</button>
      </form>
    </div>
  );
}

export default InicioSesion;