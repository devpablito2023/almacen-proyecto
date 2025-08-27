'use client';

import React, { useState } from 'react';
import { TestingPanelProps, TestResult, TestCredential } from '@/types/auth';

/**
 * PANEL DE TESTING PARA DESARROLLO
 * 
 * Características:
 * - Testing de múltiples credenciales
 * - Debugging de conexiones
 * - Información del estado del sistema
 * - Solo disponible en modo desarrollo
 */
const TestingPanel: React.FC<TestingPanelProps> = ({
  onTestLogin,
  isLoading = false,
  className = ''
}) => {
  // ========================================
  // ESTADO LOCAL
  // ========================================
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);

  // ========================================
  // CREDENCIALES DE PRUEBA
  // ========================================
  const testCredentials: TestCredential[] = [
    {
      id: 'admin',
      email_usuario: 'admin@almacen.com',
      password_usuario: 'admin123',
      role: 'Administrador',
      description: 'Usuario administrador principal'
    },
    {
      id: 'supervisor',
      email_usuario: 'supervisor@almacen.com',
      password_usuario: 'super123',
      role: 'Supervisor',
      description: 'Usuario supervisor de almacén'
    },
    {
      id: 'empleado',
      email_usuario: 'empleado@almacen.com',
      password_usuario: 'emp123',
      role: 'Empleado',
      description: 'Usuario empleado básico'
    }
  ];

  // ========================================
  // HANDLERS
  // ========================================
  
  const handleTestSingleCredential = async (credential: TestCredential) => {
    if (isLoading || isRunningTests) return;

    try {
      setIsRunningTests(true);
      
      // Agregar resultado de inicio
      const startResult: TestResult = {
        credentialId: credential.id,
        success: false,
        error: 'Testing...',
        timestamp: new Date(),
        duration: 0
      };
      setTestResults(prev => [startResult, ...prev.filter(r => r.credentialId !== credential.id)]);

      const startTime = Date.now();
      
      // Ejecutar test
      await onTestLogin(credential);
      
      const duration = Date.now() - startTime;
      
      // Resultado exitoso
      const successResult: TestResult = {
        credentialId: credential.id,
        success: true,
        timestamp: new Date(),
        duration
      };
      
      setTestResults(prev => [successResult, ...prev.filter(r => r.credentialId !== credential.id)]);
      
    } catch (error) {
      const duration = Date.now() - Date.now();
      
      // Resultado con error
      const errorResult: TestResult = {
        credentialId: credential.id,
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        timestamp: new Date(),
        duration
      };
      
      setTestResults(prev => [errorResult, ...prev.filter(r => r.credentialId !== credential.id)]);
    } finally {
      setIsRunningTests(false);
    }
  };

  const handleTestAllCredentials = async () => {
    if (isLoading || isRunningTests) return;
    
    setIsRunningTests(true);
    setTestResults([]);
    
    for (const credential of testCredentials) {
      await new Promise(resolve => setTimeout(resolve, 500)); // Delay entre tests
      await handleTestSingleCredential(credential);
    }
    
    setIsRunningTests(false);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const getResultForCredential = (credentialId: string): TestResult | undefined => {
    return testResults.find(result => result.credentialId === credentialId);
  };

  // ========================================
  // RENDER
  // ========================================
  
  // Solo mostrar en desarrollo
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-yellow-800">
            Panel de Testing (Desarrollo)
          </h3>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={handleTestAllCredentials}
            disabled={isLoading || isRunningTests}
            className="px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRunningTests ? 'Testing...' : 'Test All'}
          </button>
          
          <button
            onClick={clearResults}
            disabled={isLoading || isRunningTests}
            className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {testCredentials.map((credential) => {
          const result = getResultForCredential(credential.id);
          const isTestingThis = isRunningTests && result?.error === 'Testing...';
          
          return (
            <div
              key={credential.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">
                  {credential.role}
                </h4>
                
                {/* Estado del test */}
                <div className="flex items-center space-x-1">
                  {result && (
                    <>
                      {result.success ? (
                        <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : isTestingThis ? (
                        <svg className="h-4 w-4 text-yellow-500 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </>
                  )}
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">
                {credential.description}
              </p>
              
              <div className="space-y-1 text-xs text-gray-500 mb-3">
                <div>📧 {credential.email_usuario}</div>
                <div>🔑 {credential.password_usuario}</div>
              </div>
              
              {/* Resultado del test */}
              {result && (
                <div className="text-xs mb-3">
                  {result.success ? (
                    <div className="text-green-600">
                      ✅ Success ({result.duration}ms)
                    </div>
                  ) : isTestingThis ? (
                    <div className="text-yellow-600">
                      ⏳ Testing...
                    </div>
                  ) : (
                    <div className="text-red-600">
                      ❌ {result.error}
                    </div>
                  )}
                </div>
              )}
              
              <button
                onClick={() => handleTestSingleCredential(credential)}
                disabled={isLoading || isRunningTests}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isTestingThis ? 'Testing...' : 'Test Login'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Panel de resultados */}
      {testResults.length > 0 && (
        <div className="border-t border-yellow-200 pt-4">
          <h4 className="font-medium text-yellow-800 mb-2">
            Resultados de Tests:
          </h4>
          
          <div className="bg-white rounded border border-gray-200 max-h-40 overflow-y-auto">
            {testResults.map((result, index) => (
              <div
                key={`${result.credentialId}-${index}`}
                className={`p-2 text-sm border-b border-gray-100 last:border-b-0 ${
                  result.success ? 'bg-green-50' : 'bg-red-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {testCredentials.find(c => c.id === result.credentialId)?.role}
                  </span>
                  
                  <span className="text-xs text-gray-500">
                    {result.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                
                <div className={`text-xs ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                  {result.success ? (
                    `✅ Login exitoso (${result.duration}ms)`
                  ) : (
                    `❌ ${result.error}`
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Información adicional */}
      <div className="border-t border-yellow-200 pt-4 mt-4">
        <p className="text-xs text-yellow-700">
          <strong>Nota:</strong> Este panel solo es visible en modo desarrollo. 
          Las credenciales de prueba están predefinidas para facilitar el testing.
        </p>
      </div>
    </div>
  );
};

export default TestingPanel;
