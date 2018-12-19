Template.get.onCreated(function(){
    this.sshl = Meteor.subscribe("keys");
})

Template.get.helpers({
    key: function(){
        if(Template.instance().sshl.ready())
            return keys.findOne({}).key; //params
    },
    fpr: function(){
        return Template.instance().data.fingerprint;
    }
})
