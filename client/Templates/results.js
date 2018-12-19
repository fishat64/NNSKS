Template.results.onCreated(function(){
    this.sshl= Meteor.subscribe('keys');
})

Template.results.helpers({
    result: function(){
        return Template.instance().data;
    }
})

Template.results.events({
    "click #search": function(){
        Router.go("/search/"+$("#query").val());
    },
})
