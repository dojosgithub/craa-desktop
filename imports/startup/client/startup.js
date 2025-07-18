BlazeLayout.setRoot('body');

Meteor.startup(() => {    
    
    sAlert.config({
        effect: '',
        position: 'bottom-right',
        timeout: 5000,
        html: true,
        onRouteClose: true,
        stack: true,
        // or you can pass an object:
        // stack: {
        //     spacing: 10 // in px
        //     limit: 3 // when fourth alert appears all previous ones are cleared
        // }
        offset: 0, // in px - will be added to first alert (bottom or top - depends of the position in config)
        beep: false,
        // examples:
        // beep: '/beep.mp3'  // or you can pass an object:
        // beep: {
        //     info: '/beep-info.mp3',
        //     error: '/beep-error.mp3',
        //     success: '/beep-success.mp3',
        //     warning: '/beep-warning.mp3'
        // }
        onClose: _.noop //
        // examples:
        // onClose: function() {
        //     /* Code here will be executed once the alert closes. */
        // }
    });

    // Meteor.subscribe('users')
    // Meteor.subscribe('all_active_simulations')
    // Meteor.subscribe('all_trainee_logs')
    // Meteor.subscribe('all_assessee_logs')
    // Ground.Collection(Meteor.users);

    // Meteor.subscribe('all_trainee_logs', {
    //   onReady() {
    //     gdTrainingModuleUserLogs.keep(TrainingModuleUserLogs.find({}, {reactive: false}));
    //   }
    // })

    // gdTrainingModuleUserLogs.once('loaded', () => { 
    //   console.log('loaded'); 
    //   console.log(gdTrainingModuleUserLogs.find().fetch().length)
    // });
    
})
