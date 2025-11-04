// Script de diagnóstico de Firebase
import { auth, db, appId } from '../config/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc, collection, getDocs, Timestamp } from 'firebase/firestore';

export const debugFirebase = async () => {
  console.log('🔍 Iniciando diagnóstico de Firebase...');
  
  try {
    // 1. Verificar configuración de Firebase
    console.log('📋 Configuración de Firebase:');
    console.log('- App ID:', appId);
    console.log('- Auth:', auth ? '✅ Configurado' : '❌ No configurado');
    console.log('- Firestore:', db ? '✅ Configurado' : '❌ No configurado');
    
    // 2. Verificar usuarios existentes
    console.log('\n👥 Verificando usuarios existentes...');
    const usersCollection = collection(db, 'artifacts', appId, 'public', 'data', 'users');
    const usersSnapshot = await getDocs(usersCollection);
    
    if (usersSnapshot.empty) {
      console.log('⚠️ No hay usuarios en la base de datos');
      return { success: false, message: 'No hay usuarios registrados' };
    }
    
    const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log('📊 Usuarios encontrados:', users.length);
    users.forEach(user => {
      console.log(`- ${user.email} (${user.role}) - Estado: ${user.status}`);
    });
    
    // 3. Verificar configuración de empresa
    console.log('\n🏢 Verificando configuración de empresa...');
    const settingsRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'company_info');
    const settingsDoc = await getDoc(settingsRef);
    
    if (settingsDoc.exists()) {
      console.log('✅ Configuración de empresa encontrada');
      console.log('- Nombre:', settingsDoc.data().companyName);
    } else {
      console.log('⚠️ No hay configuración de empresa');
    }
    
    return { success: true, users, settings: settingsDoc.exists() ? settingsDoc.data() : null };
    
  } catch (error) {
    console.error('❌ Error en diagnóstico:', error);
    return { success: false, error: error.message };
  }
};

export const createTestUser = async (email, password, role = 'client') => {
  try {
    console.log(`🔧 Creando usuario de prueba: ${email}`);
    
    // Crear usuario en Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Crear documento en Firestore
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', userCredential.user.uid), {
      email,
      fullName: `Usuario ${role}`,
      identification: '12345678',
      role,
      status: 'active',
      isProfileComplete: true,
      createdAt: Timestamp.now(),
      requiresPasswordChange: false
    });
    
    console.log('✅ Usuario creado exitosamente');
    return { success: true, user: userCredential.user };
    
  } catch (error) {
    console.error('❌ Error creando usuario:', error);
    return { success: false, error: error.message };
  }
};

export const testLogin = async (email, password) => {
  try {
    console.log(`🔐 Probando login: ${email}`);
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('✅ Login exitoso');
    
    // Cerrar sesión inmediatamente
    await signOut(auth);
    console.log('🚪 Sesión cerrada');
    
    return { success: true, user: userCredential.user };
    
  } catch (error) {
    console.error('❌ Error en login:', error);
    return { success: false, error: error.message };
  }
};

// Función para crear usuarios de prueba por defecto
export const createDefaultTestUsers = async () => {
  const testUsers = [
    { email: 'admin@test.com', password: 'admin123', role: 'superadmin' },
    { email: 'cliente@test.com', password: 'cliente123', role: 'client' }
  ];
  
  console.log('🚀 Creando usuarios de prueba por defecto...');
  
  for (const userData of testUsers) {
    const result = await createTestUser(userData.email, userData.password, userData.role);
    if (result.success) {
      console.log(`✅ ${userData.email} creado`);
    } else {
      console.log(`❌ Error creando ${userData.email}:`, result.error);
    }
  }
};

// Función para verificar y crear configuración básica
export const ensureBasicSetup = async () => {
  try {
    console.log('🔧 Verificando configuración básica...');
    
    // Verificar si hay configuración de empresa
    const settingsRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'company_info');
    const settingsDoc = await getDoc(settingsRef);
    
    if (!settingsDoc.exists()) {
      console.log('📝 Creando configuración básica de empresa...');
      await setDoc(settingsRef, {
        companyName: 'Gestor de Cobros',
        identification: '123.456.789-0',
        address: 'Dirección de Prueba',
        phone: '+57 300 123 4567',
        email: 'contacto@gestor-cobros.com',
        website: 'www.gestor-cobros.com',
        isDemoMode: false,
        createdAt: Timestamp.now()
      });
      console.log('✅ Configuración de empresa creada');
    }
    
    // Verificar si hay usuarios
    const usersCollection = collection(db, 'artifacts', appId, 'public', 'data', 'users');
    const usersSnapshot = await getDocs(usersCollection);
    
    if (usersSnapshot.empty) {
      console.log('👥 Creando superadmin inicial...');
      await createTestUser('admin@gestor-cobros.com', 'admin123', 'superadmin');
    }
    
    console.log('✅ Configuración básica completada');
    return { success: true };
    
  } catch (error) {
    console.error('❌ Error en configuración básica:', error);
    return { success: false, error: error.message };
  }
};






