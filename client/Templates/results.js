Template.results.onCreated(function(){
    this.sshl= Meteor.subscribe('keys');
})

Template.results.helpers({
    result: function(){
        var result = Template.instance().data;
        result.forEach(function(entry){
            let emailpart="";
            let cnt = 1;
            let fnpart="";
            for(let i=0; i<entry.uids.length; i++){
                if(entry.uids[i].verified){
                    if(cnt === 1) {
                        emailpart+="EMAIL;PREF;INTERNET:";
                        fnpart = entry.uids[i].uid.join(" ");  //TODO Which uid to choose?
                    } else {
                        emailpart+="EMAIL;"+cnt+";INTERNET:";
                    }
                    cnt++;
                    emailpart+=entry.uids[i].mail+"\n";
                }
            }
            entry.qrdata = "BEGIN:VCARD\n" +
                "FN:"+fnpart+ "\n" +
                emailpart +
                "KEY:OPENPGP4FPR:" + entry.fingerprint + "\n"
                "END:VCARD\n"
        });

        return result;
    }
})

Template.results.events({
    "click #search": function(){
        Router.go("/search/"+$("#query").val());
    },
})
