import React, { useState, useEffect, useRef } from 'react';
import { ChevronDownIcon } from '../icons';

function ActionDropdown({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, position: 'bottom-right' });
  const ref = useRef(null);
  const buttonRef = useRef(null);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [ref]);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      
      // Calcular si hay espacio suficiente abajo
      const spaceBelow = viewportHeight - buttonRect.bottom;
      const spaceAbove = buttonRect.top;
      
      // Calcular si hay espacio suficiente a la derecha
      const spaceRight = viewportWidth - buttonRect.right;
      const spaceLeft = buttonRect.left;
      
      let top = buttonRect.bottom + 8; // 8px de margen
      let left = buttonRect.right - 224; // 224px es el ancho del dropdown
      let position = 'bottom-right';
      
      // Si no hay espacio abajo, mostrar arriba
      if (spaceBelow < 200 && spaceAbove > spaceBelow) {
        top = buttonRect.top - 8; // 8px de margen arriba
        position = spaceRight > 224 ? 'top-right' : 'top-left';
      }
      
      // Si no hay espacio a la derecha, mostrar a la izquierda
      if (spaceRight < 224 && spaceLeft > 224) {
        left = buttonRect.left - 224; // Alinear a la izquierda
        position = spaceBelow > 200 ? 'bottom-left' : 'top-left';
      }
      
      // Asegurar que no se salga del viewport
      if (left < 8) left = 8;
      if (left + 224 > viewportWidth - 8) left = viewportWidth - 232;
      if (top < 8) top = 8;
      if (top + 200 > viewportHeight - 8) top = viewportHeight - 208;
      
      setDropdownPosition({ top, left, position });
    }
  }, [isOpen]);

  const getDropdownClasses = () => {
    return "fixed w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50";
  };

  return (
    <div className="relative inline-block text-left" ref={ref}>
      <button 
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)} 
        className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Acciones <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5" />
      </button>
      {isOpen && (
        <div 
          className={getDropdownClasses()}
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`
          }}
        >
          <div className="py-1" role="menu" aria-orientation="vertical" onClick={() => setIsOpen(false)}>
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

export default ActionDropdown;



