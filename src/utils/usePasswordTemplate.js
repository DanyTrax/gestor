/**
 * Hook para usar plantillas de contraseña
 */

import { useState, useEffect } from 'react';
import { getTemplateByName } from './initializePasswordTemplates';
import { replaceTemplateVariables } from './templateVariables';

/**
 * Obtener y procesar una plantilla de contraseña
 */
export const usePasswordTemplate = (templateName, userData = {}, companySettings = {}, resetLink = null) => {
  const [template, setTemplate] = useState(null);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTemplate = async () => {
      try {
        setLoading(true);
        const templateData = await getTemplateByName(templateName);
        
        if (templateData) {
          setTemplate(templateData);
          
          // Preparar datos para reemplazo de variables
          const loginUrl = typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : '';
          const replacementData = {
            clientName: userData.fullName || userData.name || userData.email || 'Cliente',
            clientEmail: userData.email || '',
            resetPasswordUrl: resetLink || loginUrl + ' (El enlace se generará automáticamente)',
            ...userData
          };
          
          // Reemplazar variables en subject y body
          const processedSubject = replaceTemplateVariables(
            templateData.subject,
            replacementData,
            { companySettings }
          );
          
          const processedBody = replaceTemplateVariables(
            templateData.body,
            replacementData,
            { companySettings }
          );
          
          setSubject(processedSubject);
          setBody(processedBody);
        } else {
          console.warn(`Plantilla "${templateName}" no encontrada`);
        }
      } catch (error) {
        console.error('Error cargando plantilla:', error);
      } finally {
        setLoading(false);
      }
    };

    if (templateName) {
      loadTemplate();
    } else {
      setLoading(false);
    }
  }, [templateName, userData, companySettings, resetLink]);

  return { template, subject, body, loading };
};

