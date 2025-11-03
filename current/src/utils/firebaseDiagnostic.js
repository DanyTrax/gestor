// Diagnóstico avanzado de Firebase
import { collection, getDocs, doc, getDoc, query, orderBy, limit } from 'firebase/firestore';
import { db, appId } from '../config/firebase';

export const diagnosticFirebaseStructure = async () => {
  console.log('🔍 DIAGNÓSTICO COMPLETO DE FIREBASE');
  console.log('=====================================');
  
  try {
    // 1. Verificar App ID
    console.log('📱 App ID:', appId);
    
    // 2. Verificar estructura de base de datos
    console.log('\n📁 Verificando estructura de base de datos...');
    
    // Verificar colección de usuarios
    const usersCollection = collection(db, 'artifacts', appId, 'public', 'data', 'users');
    console.log('👥 Ruta de usuarios:', `artifacts/${appId}/public/data/users`);
    
    try {
      const usersSnapshot = await getDocs(usersCollection);
      console.log('👥 Total de usuarios encontrados:', usersSnapshot.size);
      
      if (usersSnapshot.empty) {
        console.log('❌ No hay usuarios en la colección');
        return { hasUsers: false, users: [] };
      }
      
      const users = [];
      usersSnapshot.docs.forEach((doc, index) => {
        const userData = doc.data();
        const user = {
          id: doc.id,
          email: userData.email || 'Sin email',
          role: userData.role || 'Sin rol',
          status: userData.status || 'Sin estado',
          createdAt: userData.createdAt || 'Sin fecha',
          fullName: userData.fullName || 'Sin nombre'
        };
        users.push(user);
        console.log(`👤 Usuario ${index + 1}:`, user);
      });
      
      // 3. Verificar configuración de empresa
      console.log('\n🏢 Verificando configuración de empresa...');
      const settingsRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'company_info');
      const settingsDoc = await getDoc(settingsRef);
      
      if (settingsDoc.exists()) {
        console.log('✅ Configuración de empresa encontrada');
        console.log('📋 Configuración:', settingsDoc.data());
      } else {
        console.log('❌ No hay configuración de empresa');
      }
      
      // 4. Verificar permisos
      console.log('\n🔐 Verificando permisos...');
      try {
        // Intentar una operación de lectura simple
        const testQuery = query(usersCollection, limit(1));
        await getDocs(testQuery);
        console.log('✅ Permisos de lectura OK');
      } catch (permError) {
        console.error('❌ Error de permisos:', permError);
      }
      
      return { 
        hasUsers: true, 
        users, 
        hasSettings: settingsDoc.exists(),
        settings: settingsDoc.exists() ? settingsDoc.data() : null
      };
      
    } catch (usersError) {
      console.error('❌ Error accediendo a usuarios:', usersError);
      return { hasUsers: false, error: usersError.message };
    }
    
  } catch (error) {
    console.error('❌ Error en diagnóstico:', error);
    return { hasUsers: false, error: error.message };
  }
};

export const findOldestUser = async () => {
  try {
    console.log('🔍 Buscando usuario más antiguo...');
    
    const usersCollection = collection(db, 'artifacts', appId, 'public', 'data', 'users');
    
    // Intentar con ordenamiento por createdAt
    try {
      const usersQuery = query(usersCollection, orderBy('createdAt', 'asc'), limit(1));
      const usersSnapshot = await getDocs(usersQuery);
      
      if (!usersSnapshot.empty) {
        const oldestUser = usersSnapshot.docs[0];
        const userData = oldestUser.data();
        console.log('👑 Usuario más antiguo (con ordenamiento):', {
          id: oldestUser.id,
          email: userData.email,
          role: userData.role,
          createdAt: userData.createdAt
        });
        return { user: oldestUser, data: userData };
      }
    } catch (orderError) {
      console.warn('⚠️ Error con ordenamiento, usando método alternativo:', orderError);
    }
    
    // Método alternativo: obtener todos y encontrar el más antiguo
    const allUsersSnapshot = await getDocs(usersCollection);
    if (allUsersSnapshot.empty) {
      console.log('❌ No hay usuarios');
      return null;
    }
    
    let oldestUser = null;
    let oldestDate = null;
    
    allUsersSnapshot.docs.forEach(doc => {
      const userData = doc.data();
      const createdAt = userData.createdAt;
      
      if (createdAt) {
        if (!oldestDate || createdAt < oldestDate) {
          oldestDate = createdAt;
          oldestUser = { user: doc, data: userData };
        }
      }
    });
    
    if (oldestUser) {
      console.log('👑 Usuario más antiguo (método alternativo):', {
        id: oldestUser.user.id,
        email: oldestUser.data.email,
        role: oldestUser.data.role,
        createdAt: oldestUser.data.createdAt
      });
    } else {
      console.log('❌ No se pudo determinar el usuario más antiguo');
    }
    
    return oldestUser;
    
  } catch (error) {
    console.error('❌ Error buscando usuario más antiguo:', error);
    return null;
  }
};

export const testFirebaseConnection = async () => {
  try {
    console.log('🔌 Probando conexión a Firebase...');
    
    // Probar conexión básica
    const testCollection = collection(db, 'artifacts', appId, 'public', 'data', 'test');
    await getDocs(testCollection);
    console.log('✅ Conexión a Firebase OK');
    
    return true;
  } catch (error) {
    console.error('❌ Error de conexión a Firebase:', error);
    return false;
  }
};





