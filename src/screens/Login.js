import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../Firebase/FirebaseConfig';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import fondo from '../assets/fondo.jpg';
import logo from '../assets/logo.png';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);

  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMsg('Si us plau, introdueix el teu correu electrònic i la contrasenya.');
      return;
    }

    // Comprovem si el correu conté "@admin" entre "@" i "."
    if (!email.includes('@admin.') || email.split('@')[1].split('.')[0] !== 'admin') {
      setErrorMsg('El correu ha de contenir "@admin" entre "@" i "."');
      return;
    }

    setErrorMsg(null);

    try {
      // Intentem iniciar sessió amb Firebase
      await signInWithEmailAndPassword(auth, email, password);
      setTimeout(() => navigate('/all'), 1); // Redirigim a la ruta /all
    } catch (error) {
      switch (error.code) {
        case 'auth/invalid-email':
          setErrorMsg('Adreça de correu electrònic no vàlida.');
          break;
        case 'auth/user-not-found':
          setErrorMsg('L\'usuari no existeix.');
          break;
        case 'auth/wrong-password':
          setErrorMsg('Contrasenya incorrecta.');
          break;
        default:
          setErrorMsg('S\'ha produït un error inesperat. Torna-ho a provar.');
      }
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setErrorMsg('Si us plau, introdueix el teu correu per restablir la contrasenya.');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      alert('Correu electrònic enviat! Comprova la teva safata d\'entrada per restablir la contrasenya.');
    } catch (error) {
      console.log('Error enviant el correu de restabliment:', error.code, error.message);
      setErrorMsg('S\'ha produït un error inesperat. Torna-ho a provar.');
    }
  };

  return (
    <div style={styles.background}>
      <div style={styles.loginBox}>
        <img src={logo} alt="Logo" style={styles.logo} />
        <h1 style={styles.title}>RestaurantX</h1>

        {errorMsg && <p style={styles.errorText}>{errorMsg}</p>}

        <input
          style={styles.input}
          type="email"
          placeholder="Correu..."
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <input
          style={styles.input}
          type="password"
          placeholder="Contrasenya..."
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        <button style={styles.button} onClick={handleLogin}>Accedir</button>

        <br /><br />
        <center>
          <text style={styles.forgotPassword} onClick={handleForgotPassword}>
          Has oblidat la teva contrasenya?
          </text>
        </center>
      </div>
    </div>
  );
}

const styles = {
  background: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    width: '100vw',
    backgroundImage: `url(${fondo})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'fixed',
    position: 'absolute',
    top: 0,
  },
  loginBox: {
    backgroundColor: '#fff',
    borderRadius: '10px',
    padding: '40px',
    width: '30%',
    maxWidth: '350px',
    minHeight: '270px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
    textAlign: 'left',
  },
  logo: {
    width: '170px',
    height: 'auto',
    marginBottom: '1px',
    display: 'block',
    marginLeft: 'auto',
    marginRight: 'auto',
    filter: 'grayscale(100%)',
  },
  title: {
    fontSize: '22px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '30px',
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
    marginBottom: '20px',
  },
  input: {
    width: '100%',
    height: '15px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '20px',
    fontSize: '16px',
  },
  button: {
    backgroundColor: '#333',
    padding: '14px',
    borderRadius: '8px',
    width: '100%',
    color: 'white',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '15px',
    fontSize: '18px',
  },
  forgotPassword: {
    color: '#666',
    cursor: 'pointer',
    fontSize: '14px',
    textAlign: 'center',
  },
};
