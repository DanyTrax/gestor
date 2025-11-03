import React, { useState } from 'react';
import { debugFirebase, createTestUser, testLogin, createDefaultTestUsers, ensureBasicSetup } from '../../utils/firebaseDebug';
import { diagnosticFirebaseStructure, findOldestUser } from '../../utils/firebaseDiagnostic';

function FirebaseDebugger() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const addResult = (message, type = 'info') => {
    setResults(prev => [...prev, { message, type, timestamp: new Date().toLocaleTimeString() }]);
  };

  const clearResults = () => setResults([]);

  const runDiagnostic = async () => {
    setLoading(true);
    clearResults();
    addResult('🔍 Iniciando diagnóstico de Firebase...', 'info');
    
    try {
      const result = await debugFirebase();
      if (result.success) {
        addResult('✅ Diagnóstico completado exitosamente', 'success');
        addResult(`📊 Usuarios encontrados: ${result.users.length}`, 'info');
        result.users.forEach(user => {
          addResult(`- ${user.email} (${user.role}) - Estado: ${user.status}`, 'info');
        });
      } else {
        addResult(`❌ Error en diagnóstico: ${result.message}`, 'error');
      }
    } catch (error) {
      addResult(`❌ Error: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const createTestUsers = async () => {
    setLoading(true);
    clearResults();
    addResult('🚀 Creando usuarios de prueba...', 'info');
    
    try {
      await createDefaultTestUsers();
      addResult('✅ Usuarios de prueba creados', 'success');
    } catch (error) {
      addResult(`❌ Error: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const setupBasic = async () => {
    setLoading(true);
    clearResults();
    addResult('🔧 Configurando sistema básico...', 'info');
    
    try {
      const result = await ensureBasicSetup();
      if (result.success) {
        addResult('✅ Configuración básica completada', 'success');
      } else {
        addResult(`❌ Error: ${result.error}`, 'error');
      }
    } catch (error) {
      addResult(`❌ Error: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const testUserLogin = async () => {
    setLoading(true);
    clearResults();
    addResult('🔐 Probando login con usuario de prueba...', 'info');
    
    try {
      const result = await testLogin('admin@test.com', 'admin123');
      if (result.success) {
        addResult('✅ Login de prueba exitoso', 'success');
      } else {
        addResult(`❌ Error en login: ${result.error}`, 'error');
      }
    } catch (error) {
      addResult(`❌ Error: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const runAdvancedDiagnostic = async () => {
    setLoading(true);
    clearResults();
    addResult('🔍 Ejecutando diagnóstico avanzado...', 'info');
    
    try {
      const diagnostic = await diagnosticFirebaseStructure();
      
      if (diagnostic.hasUsers) {
        addResult(`✅ Usuarios encontrados: ${diagnostic.users.length}`, 'success');
        diagnostic.users.forEach((user, index) => {
          addResult(`👤 ${index + 1}. ${user.email} (${user.role}) - ${user.status}`, 'info');
        });
        
        if (diagnostic.hasSettings) {
          addResult('✅ Configuración de empresa encontrada', 'success');
        } else {
          addResult('⚠️ No hay configuración de empresa', 'warning');
        }
        
        // Buscar usuario más antiguo
        const oldestUser = await findOldestUser();
        if (oldestUser) {
          addResult(`👑 Usuario más antiguo: ${oldestUser.data.email} (${oldestUser.data.role})`, 'info');
        }
        
      } else {
        addResult('❌ No hay usuarios en la base de datos', 'error');
        if (diagnostic.error) {
          addResult(`Error: ${diagnostic.error}`, 'error');
        }
      }
      
    } catch (error) {
      addResult(`❌ Error en diagnóstico: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const getResultColor = (type) => {
    switch (type) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      default: return 'text-blue-600';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">🔧 Diagnóstico de Firebase</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <button 
            onClick={runDiagnostic}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            🔍 Diagnóstico
          </button>
          <button 
            onClick={runAdvancedDiagnostic}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            🔬 Avanzado
          </button>
          <button 
            onClick={createTestUsers}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            👥 Crear Usuarios
          </button>
          <button 
            onClick={setupBasic}
            disabled={loading}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
          >
            ⚙️ Configurar
          </button>
          <button 
            onClick={testUserLogin}
            disabled={loading}
            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
          >
            🔐 Probar Login
          </button>
        </div>

        <div className="mb-4">
          <button 
            onClick={clearResults}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            🗑️ Limpiar
          </button>
        </div>

        <div className="bg-gray-100 rounded-lg p-4 max-h-96 overflow-y-auto">
          <h3 className="font-semibold mb-2">Resultados:</h3>
          {results.length === 0 ? (
            <p className="text-gray-500">No hay resultados aún. Ejecuta un diagnóstico.</p>
          ) : (
            <div className="space-y-1">
              {results.map((result, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-xs text-gray-400">{result.timestamp}</span>
                  <span className={`text-sm ${getResultColor(result.type)}`}>
                    {result.message}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">Credenciales de Prueba:</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <p><strong>Admin:</strong> admin@test.com / admin123</p>
            <p><strong>Cliente:</strong> cliente@test.com / cliente123</p>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            🔄 Recargar Página
          </button>
        </div>
      </div>
    </div>
  );
}

export default FirebaseDebugger;

