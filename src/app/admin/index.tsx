import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://clinica-estetica-backend.onrender.com';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
    background: '#1a1420',
    fontFamily: 'Montserrat, sans-serif',
    padding: 20,
  },
  card: {
    background: '#fff',
    borderRadius: 16,
    padding: 36,
    width: '100%',
    maxWidth: 380,
    boxShadow: '0 10px 40px rgba(0,0,0,0.25)',
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    fontFamily: 'Playfair Display, serif',
    fontSize: 24,
    margin: 0,
    color: '#3d1f4a',
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    color: '#888',
    marginTop: 4,
    marginBottom: 24,
    fontSize: 13,
  },
  label: {
    fontSize: 13,
    color: '#555',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    padding: '12px 14px',
    borderRadius: 8,
    border: '1px solid #ddd',
    fontSize: 15,
    outline: 'none',
  },
  button: {
    marginTop: 24,
    padding: '13px 0',
    borderRadius: 8,
    border: 'none',
    background: '#6b2d7a',
    color: '#fff',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
  },
  error: {
    background: '#fdecea',
    color: '#b3261e',
    padding: '10px 12px',
    borderRadius: 8,
    fontSize: 13,
    marginBottom: 8,
  },
};
