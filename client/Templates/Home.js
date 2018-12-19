Template.Home.events({
    "click #insert": function(){
        Meteor.call("putKey", $("#pgpkey").val(), function (err, res) {
            if(res) swal("Success", "Key has been submitted", "success");
            else swal("Error", "Key was not submitted", "error");
        })
    },
    "click #search": function(){
        Router.go("/search/"+$("#query").val());
    },
    "click #delete": function(){
        Meteor.call("del", $("#mail").val(), function (err, res) {
            swal("Success", "Please look in your E-Mail folder for further instructions", "success");
        })
    }
})
