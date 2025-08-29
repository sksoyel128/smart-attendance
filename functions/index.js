const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.setCustomClaims = functions.auth.user().onCreate(async (user) => {
  const email = user.email;
  let role = 'student';

  if (email && email.endsWith('@teacher.school.com')) {
    role = 'teacher';
  } else if (email === 'admin@school.com') {
    role = 'teacher';
  }

  try {
    await admin.auth().setCustomUserClaims(user.uid, { role });
    console.log(`Successfully set custom claim role: ${role} for user: ${user.uid}`);
  } catch (error) {
    console.error(`Error setting custom claim for user: ${user.uid}`, error);
  }
});