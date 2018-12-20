// Server entry point, imports all server code
import {Meteor} from 'meteor/meteor';
import {Email} from 'meteor/email';
const openpgp = require('openpgp');
const privkey = Meteor.settings.privkey.join("");
const pubkey = Meteor.settings.pubkey.join("");
const passphrase = Meteor.settings.passphrase;
const debug = Meteor.settings.debug || false;
if (debug) console.log(Meteor.settings);

var privKeyObj="";
var spawn = require('child_process').spawnSync;
function shspawn(command) {
    if (debug) console.log("command: "+command);
    return spawn('sh', ['-c', command], { stdio: 'pipe' });
}

function getKID(key){
    if (debug) pr_st(shspawn('echo "'+key+'" | gpg2  --with-colons --fingerprint --dry-run  | awk -F: \'/fpr:/ {print $10}\' | head -n 1\n'));
    return shspawn('echo "'+key+'" | gpg2  --with-colons --with-fingerprint | awk -F: \'/fpr:/ {print $10}\' ').stdout.toString();//gpg2 --import-options import-show --dry-run --import | grep -Pzo \'.+(\\s{1}[0-9A-F]+\\s{1})\'').stdout.toString();
}

const enc = async (key, txt) =>{
    const options = {
        message: openpgp.message.fromText(txt),       // input as Message object
        publicKeys: (await openpgp.key.readArmored(key)).keys, // for encryption
        privateKeys: [privKeyObj]                                 // sign outgoing mail
    }

    return await openpgp.encrypt(options);
}
 function pr_st(obj){
     ["stdout", "stderr"].forEach(function (el){
         if (debug) console.log(obj[el].toString());
     })
 }

 function log(string){
     if (debug) console.log(string);
    return string;
 }
Meteor.startup(async function(){
    process.env.MAIL_URL = Meteor.settings.mailuri;
    openpgp.initWorker({ path:'openpgp.worker.js' })
    privKeyObj = (await openpgp.key.readArmored(privkey)).keys[0]
    await privKeyObj.decrypt(passphrase)



    if (debug) console.log(shspawn("gpg2 --no-default-keyring --keyring mykeys.gpg --fingerprint"));
    shspawn("echo \""+privkey+"\" | gpg2 --no-default-keyring --keyring mykeys.gpg --import");
    shspawn("echo \""+pubkey+"\" | gpg2 --no-default-keyring --keyring mykeys.gpg --import");
    if (debug) log(log(log(getKID(privkey)).replace("\n", "")).slice(-16))

    pr_st(shspawn('echo "trust\n5\ny\nsave\n" | gpg2  --no-tty --command-fd 0   --no-default-keyring --keyring mykeys.gpg  --trusted-key '+getKID(privkey).replace("\n", "").slice(-16)+' --local-user '+getKID(privkey).replace("\n", "").slice(-16)+' --edit-key '+getKID(pubkey).replace("\n", "").slice(-16)+''));
    pr_st(shspawn('echo "trust\n5\ny\nsave\n" | gpg2  --no-tty --command-fd 0   --no-default-keyring --keyring mykeys.gpg  --trusted-key '+getKID(privkey).replace("\n", "").slice(-16)+' --local-user '+getKID(privkey).replace("\n", "").slice(-16)+' --edit-key '+getKID(privkey).replace("\n", "").slice(-16)+''));


    SyncedCron.add({
        name: 'Remove old Entries (7 Days)',
        schedule: function(parser) {
            return parser.text('every 1 hour');
        },
        job: function() {
            var today = new Date();
            var targetDate = new Date();

            targetDate.setDate(today.getDate() - 7);
            targetDate.setHours(0);
            targetDate.setMinutes(0);
            targetDate.setSeconds(0);

            // Remove matchng Documents
            dkey.remove({createdAt: {$lt: targetDate}});
            ukey.remove({createdAt: {$lt: targetDate}});
        }
    });
    SyncedCron.start();

})
Meteor.methods({
    "putKey": async function(key){
        let emails = shspawn('echo "'+key+'" | gpg2  --with-colons --dry-run  | awk -F: \'/uid:/ {print $10}\' ').stdout.toString(); //TODO
        if (debug) console.log(emails);

        if(emails.length==0) return false;




        let emailno = emails.split(">").length-1;


        for(let i=0; i<emailno; i++){
            let firstmail= emails.split("<")[i+1].split(">")[0];
            let securecode = Random.id(50);
            Email.send({
                from: "admin@toerder.eu",
                to: firstmail,
                subject: "[encrypted message] verify your email address",
                text: (await enc(key, "Dear Sir or Madam,\n " +
                    "a public key was uploaded to the keyserver at "+Meteor.settings.public.NNSKSURI+", with this associated email address. \n" +
                    "If you have done that, please visit:\n "+Meteor.settings.public.NNSKSURI+"verify/"+securecode+" \n to verify this E-Mail Adress. \n" +
                    "In any other case ignore this E-Mail.\n Best regards, \n Admin at "+Meteor.settings.public.home+"\n\n\n---\n Data Protection Policy can be found at "+Meteor.settings.public.dataprotectionpolicy)).data
            });
            ukey.insert({
                _id: Random.id(),
                key: key,
                secureCode: securecode,
                email: firstmail,
                createdAt: new Date(),
                emailno: emailno,
                NOMail: i+1
            })
        }

        return true;
    },
    "verify": function(id) {
        let wobj = ukey.findOne({secureCode: id});
        if (wobj === undefined) return;

        let luser = getKID(pubkey).replace("\n", "").slice(-16);
        let utosign = getKID(wobj.key).replace("\n", "").slice(-16);

        pr_st(shspawn("echo \"" + wobj.key + "\" | gpg2 --no-default-keyring --keyring mykeys.gpg --import"));
        pr_st(shspawn('gpg2 --list-keys --no-default-keyring --keyring mykeys.gpg'));
        if (wobj.emailno > 1) {
            pr_st(shspawn('echo -ne \'4\nsave\n\' | gpg2 --no-tty  --command-fd 0   --no-default-keyring --keyring mykeys.gpg  --local-user ' + luser + ' --edit-key ' + utosign + ' trust '));
            pr_st(shspawn('echo -ne \'n\n' + wobj.NOMail + '\nsign\nj\nsave\n\' | gpg2  --passphrase "' + passphrase + '" --no-tty --command-fd 0   --no-default-keyring --keyring mykeys.gpg  --local-user ' + luser + ' --edit-key ' + utosign + ' sign'));
        } else {
            pr_st(shspawn('echo -ne \'4\nsave\n\' | gpg2 --no-tty --command-fd 0 --no-default-keyring --keyring mykeys.gpg  --local-user ' + luser + ' --edit-key ' + utosign + ' trust '));
            pr_st(shspawn('echo -ne \'j\nsave\n\' | gpg2 --passphrase "' + passphrase + '" --no-tty --command-fd 0 --no-default-keyring --keyring mykeys.gpg --local-user ' + luser + '  --edit-key ' + utosign + ' sign'));
        }
        let firstmail = ukey.findOne({secureCode: id}).email;
        let emails = shspawn('echo "' + wobj.key + '" | gpg2  --with-colons --dry-run  | awk -F: \'/uid:/ {print $10}\' ').stdout.toString().split("\n");

        if(debug) console.log(emails);

        emails.pop();


        if(debug) console.log(emails);
        emails = emails.map(function (mail) {
            return {
                mail: mail,
                verified: false,
                secureCode: null,
                email: mail.split("<")[1].split(">")[0],
                uid: mail.split("<")[0].split(" ")
            }
        });

        if (debug) console.log("153: " + (keys.findOne({_id: getKID(wobj.key).replace("\n", "")}) === undefined) + '\n' +
            '154: '+JSON.stringify({_id: getKID(wobj.key).replace("\n", "")})+ '\n' +
            '155: '+JSON.stringify(keys.findOne({_id: getKID(wobj.key).replace("\n", "")})));
        if (keys.findOne({_id: getKID(wobj.key).replace("\n", "")}) === undefined){
            for (let i = 0; i < emails.length; i++) {
                if (emails[i].email === firstmail) {
                    emails[i].verified = true;
                    emails[i].secureCode = id;
                    break;
                }
            }
            keys.insert({
                _id: getKID(wobj.key).replace("\n", ""),
                short: getKID(wobj.key).replace("\n", "").slice(-8),
                long: getKID(wobj.key).replace("\n", "").slice(-16),
                fingerprint: getKID(wobj.key).replace("\n", ""),
                uids: emails,
                key: shspawn('gpg2 --no-default-keyring --keyring mykeys.gpg --armor --export '+getKID(wobj.key).replace("\n", "")).stdout.toString()
            });
        }
        else {
            let oldmails = keys.findOne({_id: getKID(wobj.key).replace("\n", "")}).uids;
            for(let i=0; i<oldmails.length; i++){
                if(oldmails[i].email===firstmail){
                    oldmails[i].verified = true;
                    oldmails[i].secureCode = id;
                    break;
                }
            }

            keys.update({_id: getKID(wobj.key).replace("\n", "")}, {$set: {uids:oldmails, key: shspawn('gpg2 --no-default-keyring --keyring mykeys.gpg --armor --export '+getKID(wobj.key).replace("\n", "")).stdout.toString()}});
        }

        if(!debug) ukey.remove({secureCode: id});

        return true;
    },
    "delete": function(fingerprint, secureCode){
        if(dkey.findOne({secureCode:secureCode, fingerprint:fingerprint})==undefined) return false;
        keys.remove({fingerprint: fingerprint});
        pr_st(shspawn('gpg2 --no-default-keyring --keyring mykeys.gpg --delete-key '+fingerprint));
        dkey.remove({secureCode: secureCode, fingerprint:fingerprint});
        return true;
    },
    "del": function(mail){

        let k = keys.find({"uids.email": mail}).fetch();
        if(k.length===0) return;

        let txt = "\n"
        for( let i=0; i<k.length; i++){
            let securecode = Random.id(50);
            dkey.insert({
                _id:Random.id(),
                createdAt: new Date(),
                secureCode: securecode,
                fingerprint: k[i].fingerprint
            });
            txt+=Meteor.settings.public.NNSKSURI+"delete/"+securecode+" for the Key with the Fingerprint: "+k[i].fingerprint+" , \n"
        }
        txt+="\n";
        Email.send({
            from: "admin@toerder.eu",
            to: mail,
            subject: "Request to delete your PGP-Key from our server",
            text: "Dear Sir or Madam,\n " +
                    "a public key was uploaded to the keyserver at "+Meteor.settings.public.NNSKSURI+", with this associated email address. \n It was requested to be DELETED." +
                "If you have done that, please visit following addresse(s) to delete your PGP-Key(s) associated with this E-Mail address from our Database \n" +
                txt +
                "In any other case ignore this E-Mail.\n Best regards, \n Admin at "+Meteor.settings.public.NNSKSURI+"\n\n\n---\n Data Protection Policy can be found at "+Meteor.settings.public.dataprotectionpolicy
        });


    }
})


Meteor.publish("keys",function(id){
    if (id==undefined) return keys.find();
    else return keys.find({$or: [{fingerprint: id}, {short: id}, {long:id}, {"uids.email": id}, {"uids.uid":id}]});
})
