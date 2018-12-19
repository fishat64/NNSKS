import { Router, RouteController } from 'meteor/iron:router';

Router.route('/', function () {
    this.render('Home');
});

Router.route('/verify/:_id', function () {
    var params = this.params;
    var id = params._id;
    Meteor.call("verify", id);
    this.render('verified');
});

Router.route('/search/:_id', {
    template: "results",
    subscriptions: function() {
        this.subscribe('keys', this.params._id);
        this.subscribe('keys', this.params._id).wait();
    },
    waitOn: function () {
        return Meteor.subscribe('keys', this.params._id);
    },
    data: function () {
        let id = this.params._id
        return keys.find({$or: [{fingerprint: id}, {short: id}, {long:id}, {"uids.email": id}, {"uids.uid":id}]}).fetch();
    }
});

Router.route('/get/:_fpr', function () {
    var params = this.params;
    var id = params._fpr;
    this.render('get', {
        data: function () {
            return keys.findOne({fingerprint: id});
        }
    });
});


Router.route('/DLKEY/:_fpr', function () {
    var params = this.params;
    var id = params._fpr;
    this.response.statusCode = 200;
    this.response.setHeader('Content-Description',' File Transfer');
    this.response.setHeader('Content-Type',' text/plain');
    this.response.setHeader('Content-Disposition',' attachment; filename="'+id+'.asc"');
    this.response.end(keys.findOne({fingerprint: id}).key);
}, {
    where: 'server'
});

Router.route('/delete/:_id', function () {
    var params = this.params;
    var id = params._id;
    this.render('delete', { data: id });
});
