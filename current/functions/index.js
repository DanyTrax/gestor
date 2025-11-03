const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// Función para eliminar usuario de Authentication
exports.deleteUser = functions.https.onCall(async (data, context) => {
  // Verificar que el usuario esté autenticado y sea superadmin
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado');
  }

  const { uid } = data;
  if (!uid) {
    throw new functions.https.HttpsError('invalid-argument', 'UID es requerido');
  }

  try {
    // Verificar que el usuario que hace la petición sea superadmin
    const userDoc = await admin.firestore()
      .collection('artifacts')
      .doc(functions.config().app.id || 'alojamientos-3c46b')
      .collection('public')
      .collection('data')
      .collection('users')
      .doc(context.auth.uid)
      .get();

    if (!userDoc.exists || userDoc.data().role !== 'superadmin') {
      throw new functions.https.HttpsError('permission-denied', 'No tienes permisos para eliminar usuarios');
    }

    // Eliminar de Firestore
    await admin.firestore()
      .collection('artifacts')
      .doc(functions.config().app.id || 'alojamientos-3c46b')
      .collection('public')
      .collection('data')
      .collection('users')
      .doc(uid)
      .delete();

    // Eliminar de Authentication
    await admin.auth().deleteUser(uid);

    return { success: true, message: 'Usuario eliminado exitosamente' };
  } catch (error) {
    console.error('Error deleting user:', error);
    throw new functions.https.HttpsError('internal', 'Error al eliminar usuario: ' + error.message);
  }
});





