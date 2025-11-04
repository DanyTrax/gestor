// Script para crear usuarios de prueba
// Ejecutar en la consola del navegador para crear usuarios de prueba

import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db, appId } from '../config/firebase';

export const createTestUsers = async () => {
  try {
    // Crear usuario administrador de prueba
    const adminCredential = await createUserWithEmailAndPassword(auth, 'admin@test.com', 'admin123');
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', adminCredential.user.uid), {
      email: 'admin@test.com',
      fullName: 'Administrador de Prueba',
      identification: '12345678',
      role: 'superadmin',
      status: 'active',
      isProfileComplete: true,
      createdAt: Timestamp.now(),
      requiresPasswordChange: false
    });

    // Crear usuario cliente de prueba
    const clientCredential = await createUserWithEmailAndPassword(auth, 'cliente@test.com', 'cliente123');
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', clientCredential.user.uid), {
      email: 'cliente@test.com',
      fullName: 'Cliente de Prueba',
      identification: '87654321',
      role: 'client',
      status: 'active',
      isProfileComplete: true,
      createdAt: Timestamp.now(),
      requiresPasswordChange: false
    });

    console.log('✅ Usuarios de prueba creados exitosamente');
    console.log('Admin: admin@test.com / admin123');
    console.log('Cliente: cliente@test.com / cliente123');
    
  } catch (error) {
    console.error('❌ Error creando usuarios de prueba:', error);
  }
};

// Función para crear datos de prueba
export const createTestData = async () => {
  try {
    // Crear configuración de empresa de prueba
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'company_info'), {
      companyName: 'Empresa de Prueba',
      identification: '123.456.789-0',
      address: 'Calle Falsa 123, Ciudad Demo',
      phone: '+57 300 123 4567',
      email: 'contacto@empresa-demo.com',
      website: 'www.empresa-demo.com',
      isDemoMode: true,
      createdAt: Timestamp.now()
    });

    // Crear servicios de prueba
    const services = [
      {
        clientName: 'Juan Pérez',
        clientEmail: 'juan@test.com',
        serviceType: 'Hosting',
        description: 'Plan Pro',
        amount: 25.00,
        currency: 'USD',
        dueDate: Timestamp.fromDate(new Date()),
        billingCycle: 'Monthly',
        status: 'Pendiente',
        clientNotes: 'A la espera del pago',
        adminNotes: 'Contactado por teléfono'
      },
      {
        clientName: 'María García',
        clientEmail: 'maria@test.com',
        serviceType: 'Dominio',
        description: 'nuevositio.co',
        amount: 50000,
        currency: 'COP',
        dueDate: Timestamp.fromDate(new Date()),
        billingCycle: 'Annually',
        status: 'Pagado',
        clientNotes: '',
        adminNotes: ''
      }
    ];

    for (const service of services) {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'services'), {
        ...service,
        createdAt: Timestamp.now()
      });
    }

    console.log('✅ Datos de prueba creados exitosamente');
    
  } catch (error) {
    console.error('❌ Error creando datos de prueba:', error);
  }
};






