import { Session } from 'meteor/session'

import { Util } from '/imports/lib/util.js'

import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

// Import needed templates
import '/imports/ui/layouts/layout/layout.js';
// import '../../ui/pages/home/home.js';

// let FlowRouter = FlowRouter.group({  //- Not working on Desktop version
//   prefix: '/'+___aR,
//   name: 'admin',
//   triggersEnter: [function(context, redirect) {    
//     Session.set("___aR", ___aR)
//   }]
// })

// Set up all routes in the app
___aR = 'uPXcEmlsQPxgFpO91UY9wN4lTX3x6X7EpwwRx06sXQbabcxPAV3ggaNqah02Ylu'

Session.set("___aR", ___aR)

FlowRouter.route('/', {
  name: 'App.home',
  action() {
    // import('/imports/ui/pages/home/home.js').then(home => {
    //   BlazeLayout.render('Layout', {Header: 'Header', Leftbar: '', Main: 'Home', Rightbar: '', Footer: 'Footer'})
    // })

    if(Meteor.isDesktop || process.env.NODE_ENV === "development") {
    // if(Meteor.isDesktop) {
      FlowRouter.go('/'+___aR+'/signin')
      // _route('/'+___aR+'signin')
    } else {
      alert("Access Denied!")
    }
  },
});

FlowRouter.route('/'+___aR+'/signin', {
  name: 'App.signin',
  action() {
    import('/imports/ui/pages/signin/signin.js').then(signin => {
      BlazeLayout.render('Layout', {Header: '', Leftbar: '', Main: 'SignIn', Rightbar: '', Footer: 'Footer'})
      Util.log(Meteor.user(), "signin", "signin")
    })    
  },
});

FlowRouter.route('/'+___aR+'/home', {
  name: 'App.home',
  action() {
    if(Meteor.user()) {
      import('/imports/ui/pages/home/home.js').then(home => {
        BlazeLayout.render('Layout', {Header: 'Header', Leftbar: '', Main: 'Home', Rightbar: '', Footer: 'Footer'})

        Util.log(Meteor.user(), "home", "home")
      })
    } else {
      FlowRouter.go('/'+___aR+'/signin')
    }
  },
});

FlowRouter.route('/'+___aR+'/simulations', {
  name: 'App.simulations',
  subscriptions: (params, queryParams) => {
    Meteor.subscribe('all_active_simulations')
  },  
  action() {

    if(Meteor.user()) {
      import('/imports/ui/pages/simulations/simulations.js').then(simulations => {
        // BlazeLayout.setRoot('body')
        BlazeLayout.render('Layout', {Header: 'Header', Leftbar: '', Main: 'Simulations', Rightbar: '', Footer: 'Footer'})

        Util.log(Meteor.user(), "sims", "sims")
      }) 
    } else {
      FlowRouter.go('/'+___aR+'/signin')
    }       
  },
});

FlowRouter.route('/'+___aR+'/simulation/:_simulation_id', {
  name: 'App.simulation',
  subscriptions: (params, queryParams) => {
    // console.log(params, queryParams)
    if(params._simulation_id) {
      
      let sid = parseInt(params._simulation_id)

      Session.set('Simulations.id', sid)

      Meteor.subscribe('simulation_w_sid', sid);
      
      Meteor.subscribe('document_folders_w_sid', sid);
      Meteor.subscribe('documents_w_sid', sid);
      Meteor.subscribe('document_files_w_sid', sid);

      Meteor.subscribe('protocols_w_sid', sid);

      Meteor.subscribe('findings_w_sid', sid);

      //-- EDC Management-related subscriptions
      // Meteor.subscribe('edc_protocols_w_sid', sid);
      // Meteor.subscribe('edc_sites_w_sid', sid);
      // Meteor.subscribe('edc_subjects_w_sid', sid);
    }
  },
  action() {
    if(Meteor.user()) {
      import('/imports/ui/pages/simulations/simulation-management.js').then(simulations => {         
        BlazeLayout.render('Layout', {Header: 'Header', Leftbar: '', Main: 'SimulationManagement', Rightbar: '', Footer: 'Footer'})
        Util.log(Meteor.user(), Session.get('Simulations.id'), "simmgmt")
      })
    } else {
      FlowRouter.go('/'+___aR+'/signin')
    }           
  },
});

FlowRouter.route('/'+___aR+'/all-findings', {
  name: 'App.allFindings',
  subscriptions: (params, queryParams) => {
    Meteor.subscribe('all_active_simulations')
  },  
  action() {

    if(Meteor.user()) {
      import('/imports/ui/pages/all-findings/all-findings.js').then(allFindings => {        
        BlazeLayout.render('Layout', {Header: 'Header', Leftbar: '', Main: 'AllFindings', Rightbar: '', Footer: 'Footer'})

        Util.log(Meteor.user(), "all-findings", "all-findings")
      }) 
    } else {
      FlowRouter.go('/'+___aR+'/signin')
    }       
  },
});

FlowRouter.route('/'+___aR+'/findings-requirements', {
  name: 'App.findingsRequirements',
  subscriptions: (params, queryParams) => {
    Meteor.subscribe('all_active_simulations');
    Meteor.subscribe('all_findings_requirements');
  },  
  action() {

    if(Meteor.user()) {
      import('/imports/ui/pages/all-findings/findings-requirements.js').then(allFindings => {        
        BlazeLayout.render('Layout', {Header: 'Header', Leftbar: '', Main: 'FindingsRequirements', Rightbar: '', Footer: 'Footer'})

        Util.log(Meteor.user(), "findings-requirements", "findings-requirements")
      }) 
    } else {
      FlowRouter.go('/'+___aR+'/signin')
    }       
  },
});

FlowRouter.route('/'+___aR+'/findings-tips', {
  name: 'App.findingsTips',
  subscriptions: (params, queryParams) => {
    Meteor.subscribe('all_active_simulations');
    Meteor.subscribe('all_active_domains');    
  },  
  action() {

    if(Meteor.user()) {
      import('/imports/ui/pages/all-findings/findings-tips.js').then(allFindingsTips => {        
        BlazeLayout.render('Layout', {Header: 'Header', Leftbar: '', Main: 'FindingsTips', Rightbar: '', Footer: 'Footer'})

        Util.log(Meteor.user(), "findings-tips", "findings-tips")
      }) 
    } else {
      FlowRouter.go('/'+___aR+'/signin')
    }       
  },
});

FlowRouter.route('/'+___aR+'/findings-selected', {
  name: 'App.findingsSelected',
  subscriptions: (params, queryParams) => {
    Meteor.subscribe('all_active_simulations');
    Meteor.subscribe('all_findings_selected');   
  },  
  action() {

    if(Meteor.user()) {
      import('/imports/ui/pages/all-findings/findings-selected.js').then(allFindingsTips => {        
        BlazeLayout.render('Layout', {Header: 'Header', Leftbar: '', Main: 'FindingsSelected', Rightbar: '', Footer: 'Footer'})

        Util.log(Meteor.user(), "findings-selected", "findings-selected")
      }) 
    } else {
      FlowRouter.go('/'+___aR+'/signin')
    }       
  },
});

FlowRouter.route('/'+___aR+'/etl', {
  name: 'App.etl',
  action() {    
    if(Meteor.user() && Meteor.user().profile.role === '1') {
      import('/imports/ui/pages/etl/etl.js').then(etl => {      
        BlazeLayout.render('Layout', {Header: 'Header', Leftbar: '', Main: 'ETL', Rightbar: '', Footer: 'Footer'})
      })
    } else {
      FlowRouter.go('/'+___aR+'/signin')
    }    
  },
});

FlowRouter.route('/'+___aR+'/datadump', {
  name: 'App.datadump',
  subscriptions: (params, queryParams) => {
    Meteor.subscribe('clients_mini')
    Meteor.subscribe('all_active_simulations')
  },
  action() {    
    import('/imports/ui/pages/datadump/datadump-management.js').then(etl => {      
      BlazeLayout.render('Layout', {Header: 'Header', Leftbar: '', Main: 'DatadumpManagement', Rightbar: '', Footer: 'Footer'})
      Util.log(Meteor.user(), "datadump", "datadump");
    })   
  },
});

FlowRouter.route('/'+___aR+'/export', {
  name: 'App.export',
  subscriptions: (params, queryParams) => {
    // Meteor.subscribe("email_template_w_key", "email-verification")
    // Meteor.subscribe("all_assessee_users_fullnames")
    Meteor.subscribe('all_active_simulations')
  },
  action() {    
    if(Meteor.user()) {
      import('/imports/ui/pages/export/export.js').then(tools => {      
        BlazeLayout.render('Layout', {Header: 'Header', Leftbar: '', Main: 'Export', Rightbar: '', Footer: 'Footer'})
        Util.log(Meteor.user(), "export", "export")
      })
    } else {
      FlowRouter.go('/'+___aR+'/signin')
    }    
  },
});

FlowRouter.route('/'+___aR+'/regions', {
  name: 'App.regions',
  subscriptions: (params, queryParams) => {
    Meteor.subscribe("all_active_countries_quintiles")
  },
  action() {    
    if(Meteor.user()) {
      import('/imports/ui/pages/regions/regions.js').then(tools => {      
        BlazeLayout.render('Layout', {Header: 'Header', Leftbar: '', Main: 'Regions', Rightbar: '', Footer: 'Footer'})
        Util.log(Meteor.user(), "regions", "regions")
      })
    } else {
      FlowRouter.go('/'+___aR+'/signin')
    }    
  },
});

FlowRouter.route('/'+___aR+'/scoring', {
  name: 'App.scoring',
  subscriptions: (params, queryParams) => {    
    Meteor.subscribe('all_active_simulations')
    Meteor.subscribe('craa_scorers')
  },
  action() {    
    if(Meteor.user()) {

      import('/imports/ui/pages/scoring/scoring.js').then(tools => {      
        BlazeLayout.render('Layout', {Header: 'Header', Leftbar: '', Main: 'Scoring', Rightbar: '', Footer: 'Footer'})
        Util.log(Meteor.user(), "scoring", "scoring")
      })
    } else {
      FlowRouter.go('/'+___aR+'/signin')
    }    
  },
});

FlowRouter.route('/'+___aR+'/scoring/:_asmtid/:_cid/:_buid/:_sid/:_uid/:_s1id/:_s2id/:_adjid/:_sname/:_uname/:_initial/:_s1name/:_s2name/:_adjname/:_qa/:_which', {
  name: 'App.scoring.scorer',
  subscriptions: (params, queryParams) => {

    let idsObj = {
      client_id: params._cid,
      bu_id: params._buid,
      simulation_id: params._sid,
      creator: params._uid
    }

    Meteor.subscribe('active_document_folders_w_sid', parseInt(params._sid))
    Meteor.subscribe('active_documents_w_sid', parseInt(params._sid))
    Meteor.subscribe('monitoring_notes_w_ids', idsObj)
    Meteor.subscribe('scoring_viewed_w_asmtId', params._asmtid)
    Meteor.subscribe('non_errors_w_asmtId', params._asmtid)
    Meteor.subscribe('findings_w_sid', parseInt(params._sid))
    Meteor.subscribe('scoring_behaviors_w_asmtid', params._asmtid)
    Meteor.subscribe('scoring_adjudication_w_asmtid', params._asmtid);
    Meteor.subscribe('sim_users_summary_by_assessment_id', params._asmtid);

    // Meteor.subscribe('sim_users_summary_w_qa');
  },
  action(params, queryParams) {    

    // if(!Session.get("Scoring.view")) {
    //   Session.set("Scoring.view", [])
    // }
    Util.loading(true)

    let
      asmtid = params._asmtid,
      cid = params._cid,
      buid = params._buid,
      sid = params._sid,
      uid = params._uid,
      which = parseInt(params._which),
      _wKey = cid+buid+sid+uid;

    let _scoringObj = {
      asmtid: asmtid,
      cid: cid,
      buid: buid,
      sid: parseInt(sid),
      uid: uid,
      s1id: params._s1id,
      s2id: params._s2id,
      adjid: params._adjid,
      sname: params._sname,
      uname: params._uname,
      initial: params._initial,
      s1name: params._s1name,
      s2name: params._s2name,
      adjname: params._adjname,
      which: which,
      qa: params._qa //-- added for QA(08/20/2019, dq)
    }

    let scoringView = Session.get('Scoring.view') || []
    let scoringObj = { //-- only this way works, Session doesn't get Array[string_key]
      name: _wKey,
      value: _scoringObj
    }

    // scoringView[_wKey] = scoringObj //-- not working, Session doesn't get Array[string_key]
    scoringView.push(scoringObj)

    Session.set('Scoring.view', scoringView)

    // if(Meteor.user()) {      
      import('/imports/ui/pages/scoring/scoring-view.js').then(scoringView => {        
        BlazeLayout.render('Layout', {Header: '', Leftbar: '', Main: 'ScoringView', Rightbar: '', Footer: 'Footer'})
        // Util.log(Meteor.user(), "scoring/view", "scoring")
      })
    // } else {
    //   FlowRouter.go('/'+___aR+'/signin')
    // }    
  },
});

FlowRouter.route('/'+___aR+'/training', {
  name: 'App.training',
  subscriptions: (params, queryParams) => {
    // import '/imports/api/training/training-module-user-logs/training-module-user-logs.js'

    // Meteor.subscribe('all_trainee_logs', {
    //   onReady() {
    //     gdTrainingModuleUserLogs.keep(TrainingModuleUserLogs.find({}, {reactive: false}));
    //   }
    // })

    // gdTrainingModuleUserLogs.once('loaded', () => { console.log('loaded'); });

    // Meteor.subscribe('all_trainee_logs')
    // Meteor.subscribe('all-trainee-logs')
  },
  action() {
    if(Meteor.user()) {
      
      import('/imports/ui/pages/training/logs/trainee-logs.js').then(tools => {      
        BlazeLayout.render('Layout', {Header: 'Header', Leftbar: '', Main: 'TraineeLogs', Rightbar: '', Footer: 'Footer'})
        Util.log(Meteor.user(), "training", "training")
      })
    } else {
      FlowRouter.go('/'+___aR+'/signin')
    }    
  },
});

FlowRouter.route('/'+___aR+'/users', {
  name: 'App.users',
  action() {    
    if(Meteor.user()) {
      import('/imports/ui/pages/users/users.js').then(users => {      
        BlazeLayout.render('Layout', {Header: 'Header', Leftbar: '', Main: 'Users', Rightbar: '', Footer: 'Footer'})
        Util.log(Meteor.user(), "users", "users")
      })
    } else {
      FlowRouter.go('/'+___aR+'/signin')
    }    
  },
});

FlowRouter.route('/'+___aR+'/tools', {
  name: 'App.tools',
  subscriptions: (params, queryParams) => {
    Meteor.subscribe("document_folder_colors");
    Meteor.subscribe('all_active_simulations');
  },
  action() {    
    if(Meteor.user()) {
      import('/imports/ui/pages/tools/tools.js').then(tools => {      
        BlazeLayout.render('Layout', {Header: 'Header', Leftbar: '', Main: 'Tools', Rightbar: '', Footer: 'Footer'})
        Util.log(Meteor.user(), "tools", "tools")
      })
    } else {
      FlowRouter.go('/'+___aR+'/signin')
    }    
  },
});

FlowRouter.route('/'+___aR+'/notices', {
  name: 'App.notices',
  subscriptions: (params, queryParams) => {
    // Meteor.subscribe("email_template_w_key", "email-verification")
  },
  action() {    
    if(Meteor.user()) {
      import('/imports/ui/pages/notices/notices.js').then(tools => {      
        BlazeLayout.render('Layout', {Header: 'Header', Leftbar: '', Main: 'Notices', Rightbar: '', Footer: 'Footer'})
        Util.log(Meteor.user(), "noticeshome", "notices")
      })
    } else {
      FlowRouter.go('/'+___aR+'/signin')
    }    
  },
});

FlowRouter.route('/'+___aR+'/requests', {
  name: 'App.requests',
  subscriptions: (params, queryParams) => {  
    if(Meteor.userId()) {
      Meteor.subscribe("my_requests", Meteor.userId())
    }
  },
  action() {    
    if(Meteor.user()) {
      import('/imports/ui/pages/requests/requests.js').then(tools => {      
        BlazeLayout.render('Layout', {Header: 'Header', Leftbar: '', Main: 'Requests', Rightbar: '', Footer: 'Footer'})
        Util.log(Meteor.user(), "requestshome", "requests")
      })
    } else {
      FlowRouter.go('/'+___aR+'/signin')
    }    
  },
});

FlowRouter.route('/'+___aR+'/uba', {
  name: 'App.uba',
  subscriptions: (params, queryParams) => {
    Meteor.subscribe('all_active_simulations');
    Meteor.subscribe('clients_mini');
    Meteor.subscribe('valid_user_comparison');
    Meteor.subscribe('init_collaboration_audit_above_80');
    Meteor.subscribe('count_collaboration_audit_above_80');
  },  
  action() {    
    // if(Meteor.user() && Meteor.user().profile.role === '1') {
      import('/imports/ui/pages/uba/uba.js').then(uba => {      
        BlazeLayout.render('Layout', {Header: 'Header', Leftbar: '', Main: 'UBA', Rightbar: '', Footer: 'Footer'})
        Util.log(Meteor.user(), "uba", "uba")
      })
    // } else {
    //   FlowRouter.go('/'+___aR+'/signin')
    // }    
  },
});

FlowRouter.notFound = {
  action() {
    import '/imports/ui/pages/not-found/not-found.js';
    BlazeLayout.render('Layout', { main: 'NotFound' });
  },
};

// FlowRouter.route('/'+___aR+'/update/:platform/:version', {
//   name: 'App.autoUpdater',
//   action() {
//     let platform = FlowRouter.getParam("platform");

//     // console.log(platform)
//     // import('/update/'+platform+'/RELEASES').then(autoUpdater => {
//     //   console.log('aaa')
//     // })
//   }
// });
