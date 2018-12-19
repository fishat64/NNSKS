Template.delete.events({
    "click #submit": function(){
        Meteor.call("delete", $("#fingerprint").val(), Template.instance().data, function(err, res){
            if(!err && !!res){
                swal("Success", "Your PGP Key was deleted.", "success");
            } else swal("Error", "Something went wrong :"+err, "error")
        })
    }
})
