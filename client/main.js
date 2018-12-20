// Client entry point, imports all client code
Template.registerHelper("split", function(fpr, grp=4, parts=2){
    let fingerprint=fpr.split("");
    let result = "";
    for(let i=0; i<fingerprint.length; i++){
        if(i%grp===0) result +=" ";
        if(i===fingerprint.length/parts) result+="\n ";
        result+=fingerprint[i];
    }
    console.log(result);
    return result;
})

Template.registerHelper("NNSKSURI", function(){
    return Meteor.settings.public.NNSKSURI;
})

Template.registerHelper("dataprotectionpolicy", function(){
    return Meteor.settings.public.dataprotectionpolicy;
})

Template.registerHelper("home", function(){
    return Meteor.settings.public.home;
})
