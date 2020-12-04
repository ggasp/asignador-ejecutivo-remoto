const argv = require('yargs')
    .command('asignar', 'asigna registros a cada ejecutivo asociado a una base en particular', {
        base: {
            demand: true,
            alias: 'b'
        },
        zona: {
            demand: true,
            alias: 'z'
        }
    })
    .command('desasignar', 'desasignar registros a cada ejecutivo asociado a una base en particular', {
        base: {
            demand: true,
            alias: 'b'
        }
    })
    .help()
    .argv;

let { getExecutives, assignExecutives } = require('./functions/asignar');
let { unassignExecutives } = require('./functions/desasignar');

let comando = argv._[0];

//let base = '20201201-TOTALIZACI-263-BASE263';
//let zona = "TOTALIZACION FIJA";

let base = argv.base;
let zona = argv.zona;
let lastDoc = null;

switch (comando) {
    case 'asignar':
        getExecutives(zona).then(executives => {

                return executives;
            })
            .then(async(de) => {
                let resp = await assignExecutives(base, lastDoc, de);
                console.log(resp);
            })
            .catch(err => {
                console.log(err);
            });
        break;
    case 'desasignar':
        unassignExecutives(base, lastDoc).then(resp => {
            console.log(resp);
        });
        break;
    default:
        console.log('Debe ingresar una comando válido, utilice el comando --help');
}