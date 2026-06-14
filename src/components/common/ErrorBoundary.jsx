import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', minHeight: '60vh', padding: '2rem', textAlign: 'center',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>&#9888;</div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem', color: '#111' }}>
            Une erreur est survenue
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#909088', marginBottom: '1.5rem' }}>
            {this.state.error?.message || 'Erreur inattendue'}
          </p>
          <button
            className="btn btn-primary"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Réessayer
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
