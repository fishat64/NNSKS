// Client entry point, imports all client code

Template.registerHelper("NNSKSURI", function(){
    return Meteor.settings.public.NNSKSURI;
})

Template.registerHelper("dataprotectionpolicy", function(){
    return Meteor.settings.public.dataprotectionpolicy;
})

Template.registerHelper("home", function(){
    return Meteor.settings.public.home;
})
