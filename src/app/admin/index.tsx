import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://clinica-estetica-backend.onrender.com';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Mesmas fontes da marca usadas no site público e no dashboard, para a
    // tela de login já entrar com a identidade certa.
    if (typeof document === 'undefined') return;
    const linkFont = document.createElement('link');
    linkFont.href =
        'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,400&display=swap';
    linkFont.rel = 'stylesheet';
    document.head.appendChild(linkFont);
  }, []);

  // Se já tiver token salvo, pula direto pro dashboard.
  useEffect(() => {
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('admin_jwt_token') : null;
    if (token) {
      router.replace('/admin/dashboard');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          setError('E-mail ou senha incorretos.');
        } else {
          setError('Não foi possível entrar agora. Tente novamente em instantes.');
        }
        return;
      }

      const data = await res.json();
      window.localStorage.setItem('admin_jwt_token', data.token);
      router.replace('/admin/dashboard');
    } catch (err) {
      setError('Falha de conexão com o servidor. Ele pode estar acordando (Render) — tente novamente em alguns segundos.');
    } finally {
      setLoading(false);
    }
  };

  return (
      <div style={styles.wrapper}>
        <form onSubmit={handleSubmit} style={styles.card}>
          <img
              src="/logo.jpg.jpeg"
              alt="Logo Maria Yasmim Lopes"
              style={styles.logo}
          />

          <h1 style={styles.title}>Área Administrativa</h1>
          <p style={styles.subtitle}>Maria Yasmim Lopes — Estética</p>

          {error && <div style={styles.error}>{error}</div>}

          <label style={styles.label}>E-mail</label>
          <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
              placeholder="seu@email.com"
          />

          <label style={styles.label}>Senha</label>
          <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
              placeholder="••••••••"
          />

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  wrapper: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(to bottom, #F3E6F8, #FAF9F6)',
    fontFamily: "'Montserrat', sans-serif",
    padding: 20,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: '50%',
    objectFit: 'cover',
    display: 'block',
    margin: '0 auto 16px',
  },
  card: {
    background: '#fff',
    borderRadius: 20,
    padding: 36,
    width: '100%',
    maxWidth: 380,
    boxShadow: '0 10px 35px rgba(45,21,55,0.15)',
    border: '1px solid #F0E4F5',
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 24,
    margin: 0,
    color: '#2D1537',
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    color: '#A259C4',
    fontWeight: 600,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 6,
    marginBottom: 24,
  },
  label: {
    fontSize: 13,
    color: '#5A4A60',
    fontWeight: 600,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    padding: '12px 14px',
    borderRadius: 10,
    border: '1px solid #D4A5E0',
    fontSize: 15,
    fontFamily: 'inherit',
    color: '#2D1537',
    background: '#FAF9F6',
    outline: 'none',
  },
  button: {
    marginTop: 24,
    padding: '13px 0',
    borderRadius: 24,
    border: 'none',
    background: '#2D1537',
    color: '#fff',
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
  },
  error: {
    background: '#fdecea',
    color: '#b3261e',
    padding: '10px 12px',
    borderRadius: 10,
    fontSize: 13,
    marginBottom: 8,
  },
};

