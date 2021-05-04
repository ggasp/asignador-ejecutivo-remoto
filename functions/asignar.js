const fs = require('fs');
const admin = require('firebase-admin');
const serviceAccount = require('../ejecutivo-remoto-firebase-adminsdk-bleza-f2f5ea4c78.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

let getExecutives = (zona) => {

    return new Promise((resolve, reject) => {

        let executives = db.collection('ejecutivo').where('zona', '==', zona);

        executives.get().then((data) => {

            let eData = {};
            let eDataJson;
            let eDataArr = [];

            data.forEach((doc) => {
                eData.id = doc.id;
                eData.data = doc.data();
                eDataJson = JSON.stringify(eData, null, 4);
                eDataArr.push(eDataJson);
            });

            if (!eDataArr)
                reject(`No existen ejecutivos asociados a la zona: ${ zona }`);
            else
                resolve(eDataArr);
        });
    });
};

let assignExecutives = async(baseId, lastDoc, executives) => {

    return new Promise((resolve, reject) => {

        let contacts = db.collection('contacto').where('base_id', '==', baseId).where('ejecutivo_id', '==', '').where('is_worked','==','false').orderBy('id').startAfter(lastDoc).limit(10000);

        if (!contacts)
            reject('Error al consultar la collection contacto');

        contacts.get()
            .then((data) => {

                let cData = {};
                let cDataStr;
                let cDataArr = [];
                let cDataArrJson = [];
                let eDataArrJson = [];
                let eSize;
                let cSize;

                if (data.docs.length == 0) {
                    lastDoc = null;
                } else {
                    lastDoc = data.docs[data.docs.length - 1];
                    data.forEach((doc) => {
                        cData.id = doc.id;
                        cData.data = doc.data();
                        cDataStr = JSON.stringify(cData, null, 4);
                        cDataArr.push(cDataStr);
                    });


                    eSize = executives.length;
                    cSize = cDataArr.length;

                    for (let i = 0; i < cSize; i++) {
                        cDataArrJson.push(JSON.parse(cDataArr[i]));
                    }

                    for (let i = 0; i < eSize; i++) {
                        eDataArrJson.push(JSON.parse(executives[i]));
                    }

                    console.log(`Cantidad de registros a asignar: ${ cSize }`);
                    console.log(`Cantidad de ejecutivos: ${ eSize }`);

                    for (let i = 0; i < cSize; i++) {
                        db.collection('contacto').doc(cDataArrJson[i].id).update({
                            ejecutivo_id: eDataArrJson[i % eSize].id
                        });
                    }

                    console.log('Registros asignados correctamente.');
                }

            })
            .then(() => {
                if (lastDoc == null) {
                    console.log(`No hay registros para la base: ${ baseId }`);
                    return console.log('Proceso Finalizado correctamente');
                } else {
                    assignExecutives(baseId, lastDoc, executives);
                }
            })
            .catch(err => {
                console.log(err);
            });
    });
};

module.exports = {
    assignExecutives,
    getExecutives
}