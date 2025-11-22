/**
 * Inicializar plantillas de restablecimiento de contraseña
 * Se ejecuta automáticamente al iniciar la aplicación
 */

import { collection, query, where, getDocs, addDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { db, appId } from '../config/firebase';

const TEMPLATES = {
  nuevoUsuario: {
    name: 'Bienvenida - Nuevo Usuario - Crear Contraseña',
    subject: 'Bienvenido a {companyName} - Crea tu contraseña',
    body: `Hola {clientName},

¡Bienvenido a {companyName}!

Tu cuenta ha sido creada exitosamente en {companyName}.

📧 Tu email de acceso: {clientEmail}

🔐 CREAR TU CONTRASEÑA - ACCESO AL SISTEMA:

Para completar tu registro y acceder al sistema, necesitas crear tu contraseña personal.

📝 INSTRUCCIONES PASO A PASO:

1. Haz clic en el siguiente enlace para crear tu contraseña (este enlace es único y seguro):
   {resetPasswordUrl}

2. En la página de restablecimiento, ingresa una contraseña segura (mínimo 6 caracteres)

3. Confirma tu contraseña ingresándola nuevamente

4. Haz clic en "Restablecer Contraseña"

5. Una vez creada tu contraseña, serás redirigido automáticamente al inicio de sesión

6. Inicia sesión con:
   - Email: {clientEmail}
   - Contraseña: La que acabas de crear

⚠️ IMPORTANTE:
- El enlace para crear tu contraseña expirará en 24 horas
- Si el enlace expira, puedes solicitar uno nuevo desde la página de inicio de sesión haciendo clic en "¿Olvidaste tu contraseña?"
- Tu cuenta está activa y lista para usar una vez que crees tu contraseña

🔗 ENLACE DIRECTO AL SISTEMA:
{loginUrl}

Una vez que inicies sesión, podrás:
• Ver tus servicios contratados
• Crear tickets de soporte
• Gestionar tu perfil y pagos
• Acceder a todas las funcionalidades del sistema

Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.

¡Bienvenido!

Equipo de Soporte
{companyName}`,
    category: 'client'
  },
  notificarActivacion: {
    name: 'Notificación de Activación - Crear Contraseña',
    subject: 'Cuenta Activada - {companyName} - Crea tu contraseña',
    body: `Hola {clientName},

Tu cuenta ha sido activada exitosamente en {companyName}.

📧 Tu email de acceso: {clientEmail}

🔐 CREAR O CAMBIAR TU CONTRASEÑA:

Para acceder al sistema, necesitas crear o cambiar tu contraseña.

📝 INSTRUCCIONES PASO A PASO:

1. Haz clic en el siguiente enlace para crear/cambiar tu contraseña (este enlace es único y seguro):
   {resetPasswordUrl}

2. En la página de restablecimiento, ingresa una contraseña segura (mínimo 6 caracteres)

3. Confirma tu contraseña ingresándola nuevamente

4. Haz clic en "Restablecer Contraseña"

5. Una vez creada tu contraseña, serás redirigido automáticamente al inicio de sesión

6. Inicia sesión con:
   - Email: {clientEmail}
   - Contraseña: La que acabas de crear

⚠️ IMPORTANTE:
- El enlace para crear/cambiar tu contraseña expirará en 24 horas
- Si el enlace expira, puedes solicitar uno nuevo desde la página de inicio de sesión haciendo clic en "¿Olvidaste tu contraseña?"
- Tu cuenta está activa y lista para usar una vez que crees tu contraseña

🔗 ENLACE DIRECTO AL SISTEMA:
{loginUrl}

Una vez que inicies sesión, podrás:
• Ver tus servicios contratados
• Crear tickets de soporte
• Gestionar tu perfil y pagos
• Acceder a todas las funcionalidades del sistema

Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.

¡Bienvenido!

Equipo de Soporte
{companyName}`,
    category: 'client'
  },
  restablecerContrasena: {
    name: 'Restablecer Contraseña',
    subject: 'Restablecer tu contraseña - {companyName}',
    body: `Hola,

Has solicitado restablecer tu contraseña en {companyName}.

📝 INSTRUCCIONES:

1. Haz clic en el siguiente enlace para restablecer tu contraseña (este enlace es único y seguro):
   {resetPasswordUrl}

2. En la página de restablecimiento, ingresa una contraseña segura (mínimo 6 caracteres)

3. Confirma tu contraseña ingresándola nuevamente

4. Haz clic en "Restablecer Contraseña"

5. Una vez restablecida tu contraseña, serás redirigido automáticamente al inicio de sesión

⚠️ IMPORTANTE:
- El enlace expirará en 24 horas
- Si no solicitaste este restablecimiento, ignora este email
- Si tienes problemas, contacta con soporte

🔗 ENLACE DIRECTO AL SISTEMA:
{loginUrl}

Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.

Equipo de Soporte
{companyName}`,
    category: 'client'
  }
};

/**
 * Verificar si una plantilla existe
 */
const templateExists = async (templateName) => {
  try {
    const templatesCollection = collection(db, 'artifacts', appId, 'public', 'data', 'messageTemplates');
    const q = query(templatesCollection, where('name', '==', templateName));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error verificando plantilla:', error);
    return false;
  }
};

/**
 * Crear una plantilla si no existe
 */
const createTemplate = async (templateKey, templateData) => {
  try {
    const exists = await templateExists(templateData.name);
    if (exists) {
      console.log(`✅ Plantilla "${templateData.name}" ya existe`);
      return false;
    }

    const templatesCollection = collection(db, 'artifacts', appId, 'public', 'data', 'messageTemplates');
    await addDoc(templatesCollection, {
      ...templateData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log(`✅ Plantilla "${templateData.name}" creada exitosamente`);
    return true;
  } catch (error) {
    console.error(`❌ Error creando plantilla "${templateData.name}":`, error);
    return false;
  }
};

/**
 * Inicializar todas las plantillas de contraseña
 */
export const initializePasswordTemplates = async () => {
  try {
    console.log('🔧 Inicializando plantillas de restablecimiento de contraseña...');
    
    const results = await Promise.all([
      createTemplate('nuevoUsuario', TEMPLATES.nuevoUsuario),
      createTemplate('notificarActivacion', TEMPLATES.notificarActivacion),
      createTemplate('restablecerContrasena', TEMPLATES.restablecerContrasena)
    ]);
    
    const created = results.filter(r => r).length;
    if (created > 0) {
      console.log(`✅ ${created} plantilla(s) de contraseña creada(s)`);
    } else {
      console.log('✅ Todas las plantillas de contraseña ya existen');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error inicializando plantillas de contraseña:', error);
    return false;
  }
};

/**
 * Obtener una plantilla por nombre
 */
export const getTemplateByName = async (templateName) => {
  try {
    const templatesCollection = collection(db, 'artifacts', appId, 'public', 'data', 'messageTemplates');
    const q = query(templatesCollection, where('name', '==', templateName));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    }
    
    return null;
  } catch (error) {
    console.error('Error obteniendo plantilla:', error);
    return null;
  }
};

