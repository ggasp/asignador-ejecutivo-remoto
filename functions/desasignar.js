const fs = require('fs');
const admin = require('firebase-admin');
const serviceAccount = require('../ejecutivo-remoto-firebase-adminsdk-bleza-f2f5ea4c78.json');

// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount)
// });

var db = admin.firestore();
var LIMIT = 2500;

let unassignExecutives = (baseId, lastDoc) => {

    return new Promise((resolve, reject) => {


        let cDataArr = [];
        let cDataArrJson = [];
        let cData = {};
        let cDataStr;
        let cSize;

        let contacts = db.collection('contacto').where('base_id', '==', baseId).where('is_worked', '==', 'false').orderBy('id').startAfter(lastDoc).limit(LIMIT);
        contacts.get()
            .then((data) => {
                if (data.docs.length == 0) {
                    lastDoc = null;
                } else {
                    lastDoc = data.docs[data.docs.length - 1];
                    data.forEach(async(doc) => {
                        if (doc.data().ejecutivo_id != '') {
                            cData.id = doc.id;
                            cData.data = doc.data();
                            cDataStr = JSON.stringify(cData, null, 4);
                            cDataArr.push(cDataStr);
                        }
                    });

                    cSize = cDataArr.length;

                    for (let i = 0; i < cSize; i++) {
                        cDataArrJson.push(JSON.parse(cDataArr[i]));
                    }
                    if (cSize > 0)
                        console.log(`Cantidad de registros a desasignar: ${ cSize }`);

                    for (let i = 0; i < cSize; i++) {
                        db.collection('contacto').doc(cDataArrJson[i].id)
                            .update({
                                ejecutivo_id: ''
                            });
                    }

                    if (cSize > 0)
                        console.log('Registros deasignados correctamente.');
                }
            })
            .then(() => {
                if (lastDoc == null) {
                    console.log(`No hay registros para la base: ${ baseId }`);
                    return console.log('Proceso Finalizado correctamente');
                } else {
                    unassignExecutives(baseId, lastDoc);
                }
            })
            .catch(err => {
                console.log(err);
            });
    });


}

module.exports = {
    unassignExecutives
}