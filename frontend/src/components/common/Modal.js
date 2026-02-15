// frontend/src/components/common/Modal.js
import React from 'react';

const Modal = ({ isOpen, title, children, onClose }) => {
  if (!isOpen) return null;

  const backdropStyle = {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  };

  const modalStyle = {
    background: '#fff',
    borderRadius: '8px',
    padding: '20px',
    minWidth: '320px',
    maxWidth: '480px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
  };

  return (
    <div style={backdropStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        {title && <h3 style={{ marginTop: 0 }}>{title}</h3>}
        <div style={{ marginTop: 10 }}>{children}</div>
        <div style={{ marginTop: 16, textAlign: 'right' }}>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default Modal;

