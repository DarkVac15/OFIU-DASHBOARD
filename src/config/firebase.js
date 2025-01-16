require('dotenv').config()


const admin = require('firebase-admin')
const { getFirestore,FieldValue  } = require('firebase-admin/firestore')
const{getAuth } = require('firebase-admin/auth')



const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

admin.initializeApp({
    credential: admin.credential.cert(require(serviceAccountPath)),
});

const db= getFirestore();
const auth = getAuth();

//const serverTimestamp =serverTimestamp();

getAuth().generateSignInWithEmailLink


module.exports={
    db,auth,//serverTimestamp
    serverTimestamp: FieldValue.serverTimestamp, 
};