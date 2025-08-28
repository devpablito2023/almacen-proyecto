// src/app/(auth)/login/page.tsx
'use client';

import React from 'react';
// pide LoginForm component
import LoginForm from '@/components/forms/LoginForm';

/**
 * PÁGINA DE LOGIN PARA TESTING
 * 
 * Esta página integra:
 * - LoginForm component
 * - Manejo de redirecciones
 * - Testing de diferentes credenciales
 */
console.log('🔄 Cargando LoginPage desde login/page.tsx'); 
const LoginPage: React.FC = () => {
  const handleLoginSuccess = () => {
    console.log('✅ LoginPage: Login exitoso, el hook useAuth manejará la redirección');
  };

  return (
    <>
      {/* Metadata para SEO */}
      <head>
        <title>Login - Sistema Control de Almacén</title>
        <meta name="description" content="Acceso al sistema de control de almacén" />
        <meta name="robots" content="noindex, nofollow" />
      </head>

      {/* Componente de formulario */}
      <LoginForm 
        onSuccess={handleLoginSuccess}
        className="animate-fade-in"
      />

      {/* Testing Panel - Solo en desarrollo */}
      {process.env.NODE_ENV === 'development' && (
        <TestingPanel />
      )}
    </>
  );
};

/**
 * Panel de testing para desarrollo
 */
interface TestResult {
  credentials: string;
  status: number | string;
  success: boolean;
  message: string;
  hasUser?: boolean;
  userRole?: number;
  expectedRole?: number | null;
  roleMatch?: boolean;
  responseTime?: string;
  timestamp: string;
  error?: string | null;
}

const TestingPanel: React.FC = () => {
  const [testResults, setTestResults] = React.useState<TestResult[]>([]);
  const [isTesting, setIsTesting] = React.useState(false);

  // Credenciales de prueba según los roles
  const testCredentials = [
    {
      name: 'Superusuario',
      email: 'admin@almacen.com',
      password: 'admin123',
      expectedRole: 0,
      description: 'Acceso completo al sistema'
    },
    {
      name: 'Jefatura',
      email: 'jefe@almacen.com', 
      password: 'jefe123',
      expectedRole: 1,
      description: 'Gestión y reportes'
    },
    {
      name: 'Genera OT',
      email: 'ot@almacen.com',
      password: 'ot123', 
      expectedRole: 2,
      description: 'Creación de órdenes de trabajo'
    },
    {
      name: 'Credenciales Inválidas',
      email: 'invalid@test.com',
      password: 'wrongpassword',
      expectedRole: null,
      description: 'Debe fallar la autenticación'
    }
  ];

  const testDirectLogin = async (credentials: typeof testCredentials[0]) => {
    setIsTesting(true);
    
    try {
      console.log(`🧪 Testing: Probando ${credentials.name}`);
      
      const startTime = Date.now();
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email_usuario: credentials.email,
          password_usuario: credentials.password
        }),
      });

      const endTime = Date.now();
      const data = await response.json();
      
      const result = {
        credentials: credentials.name,
        status: response.status,
        success: data.success,
        message: data.message,
        hasUser: !!data.data?.user,
        userRole: data.data?.user?.tipo_usuario,
        expectedRole: credentials.expectedRole,
        roleMatch: data.data?.user?.tipo_usuario === credentials.expectedRole,
        responseTime: `${endTime - startTime}ms`,
        timestamp: new Date().toLocaleTimeString(),
        error: data.error || null
      };

      console.log(`🧪 Test Result:`, result);
      setTestResults(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 results

    } catch (error) {
      console.error(`❌ Test Error:`, error);
      setTestResults(prev => [{
        credentials: credentials.name,
        status: 'ERROR',
        success: false,
        message: `Network error: ${error}`,
        timestamp: new Date().toLocaleTimeString(),
        error: 'NETWORK_ERROR'
      }, ...prev.slice(0, 9)]);
    } finally {
      setIsTesting(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="fixed bottom-4 right-4 max-w-md">
      <details className="bg-white rounded-lg shadow-lg border border-gray-200">
        <summary className="p-4 cursor-pointer font-medium text-gray-700 hover:bg-gray-50">
          🧪 Testing Panel ({testResults.length} tests)
        </summary>
        
        <div className="p-4 border-t border-gray-200 max-h-96 overflow-y-auto">
          <h3 className="font-medium text-sm mb-3">Test Credentials:</h3>
          
          <div className="space-y-2 mb-4">
            {testCredentials.map((cred, index) => (
              <button
                key={index}
                onClick={() => testDirectLogin(cred)}
                disabled={isTesting}
                className="w-full text-left p-2 text-xs bg-gray-50 rounded hover:bg-gray-100 disabled:opacity-50"
              >
                <div className="font-medium">{cred.name}</div>
                <div className="text-gray-600">{cred.email}</div>
                <div className="text-gray-500">{cred.description}</div>
              </button>
            ))}
          </div>

          {isTesting && (
            <div className="text-center py-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto"></div>
              <span className="text-xs text-gray-600">Testing...</span>
            </div>
          )}

          {testResults.length > 0 && (
            <>
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-sm">Test Results:</h4>
                <button
                  onClick={clearResults}
                  className="text-xs text-red-600 hover:text-red-800"
                >
                  Clear
                </button>
              </div>
              
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {testResults.map((result, index) => (
                  <div 
                    key={index} 
                    className={`p-2 rounded text-xs border-l-4 ${
                      result.success 
                        ? 'bg-green-50 border-green-400' 
                        : 'bg-red-50 border-red-400'
                    }`}
                  >
                    <div className="font-medium">
                      {result.credentials} - {result.timestamp}
                    </div>
                    <div className="text-gray-600">
                      Status: {result.status} | Time: {result.responseTime}
                    </div>
                    <div className={result.success ? 'text-green-700' : 'text-red-700'}>
                      {result.message}
                    </div>
                    {result.hasUser && (
                      <div className="text-blue-700">
                        Role: {result.userRole} 
                        {result.expectedRole !== null && (
                          <span className={result.roleMatch ? 'text-green-600' : 'text-orange-600'}>
                            {' '}({result.roleMatch ? '✓' : '≠'} expected: {result.expectedRole})
                          </span>
                        )}
                      </div>
                    )}
                    {result.error && (
                      <div className="text-red-600 font-mono">
                        Error: {result.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </details>
    </div>
  );
};

export default LoginPage;