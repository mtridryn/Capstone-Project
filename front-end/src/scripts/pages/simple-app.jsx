import React from 'react';

function SimpleApp() {
  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#FFDCDC',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#FF9B7A' }}>🌸 Dermalyze</h1>
      <p>Aplikasi analisis kulit dengan AI</p>
      
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        marginTop: '20px',
        marginBottom: '20px'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          backgroundColor: '#FFDCDC',
          border: '2px solid #FF9B7A',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          textAlign: 'center'
        }}>Rose</div>
        <div style={{
          width: '60px',
          height: '60px',
          backgroundColor: '#FFF2EB',
          border: '2px solid #FF9B7A',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          textAlign: 'center'
        }}>Cream</div>
        <div style={{
          width: '60px',
          height: '60px',
          backgroundColor: '#FFE8CD',
          border: '2px solid #FF9B7A',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          textAlign: 'center'
        }}>Peach</div>
        <div style={{
          width: '60px',
          height: '60px',
          backgroundColor: '#FFD6BA',
          border: '2px solid #FF9B7A',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          textAlign: 'center'
        }}>Salmon</div>
      </div>
      
      <div style={{ 
        backgroundColor: 'white',
        padding: '15px',
        borderRadius: '8px',
        border: '1px solid #FFE8CD',
        marginBottom: '20px'
      }}>
        <h2 style={{ margin: '0 0 10px 0', color: '#FF9B7A' }}>✅ Color Palette Berhasil Diimplementasi!</h2>
        <p style={{ margin: 0 }}>Semua warna dari desain Anda telah diterapkan ke seluruh aplikasi.</p>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <h3>🔗 Navigasi:</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <a href="#/" style={{ 
            padding: '8px 16px',
            backgroundColor: '#FF9B7A',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '6px'
          }}>Home</a>
          <a href="#/about" style={{ 
            padding: '8px 16px',
            backgroundColor: '#FF9B7A',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '6px'
          }}>About</a>
          <a href="#/login" style={{ 
            padding: '8px 16px',
            backgroundColor: '#FF9B7A',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '6px'
          }}>Login</a>
          <a href="#/artikel" style={{ 
            padding: '8px 16px',
            backgroundColor: '#FF9B7A',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '6px'
          }}>Artikel</a>
        </div>
      </div>
    </div>
  );
}

export default SimpleApp;
