import { Session } from 'meteor/session';

import { Util } from '/imports/lib/util.js';

import './scoring-simulation-weighting.html';
import '/imports/ui/stylesheets/scoring/scoring-simulation-weighting.less'

import { Simulations } from '/imports/api/simulations/simulations.js'

Template.ScoringSimulationWeighting.onCreated(function() {

	Tracker.autorun(() => {
		Template.ScoringSimulationWeighting.__helpers.get("getSimulations").call();	
	})
	
});

Template.ScoringSimulationWeighting.onRendered(function() {

});

Template.ScoringSimulationWeighting.helpers({
	getSimulations() {

		// let $_sort = {
		// 	name: 1
		// };

		// console.log(Session.get("ScoringSimulationWeighting.sort"));

		// if(Session.get("ScoringSimulationWeighting.sort")) {			
		// 	let _direction = Session.get("ScoringSimulationWeighting.sort.direction") || 1;
			
		// 	$_sort = {
		// 		'workload.unitScore': _direction,
		// 		// name: 1
		// 	}

		// 	console.log($_sort);
		// }

		let _simulations = Simulations.find({
			status: 1,
			name: { $regex: '^((?!test).)*$', $options: 'i'}
		}).fetch();

		// console.log(_simulations);

		let 
			_simDict = [],
			_scoredSimsDict = [],
			_totalNumOfFindings = 0,
			_totalScoredSims = 10000, //-- default value
			_allCountFindings = [],
			_allDurations = [],
			_allDifficultyLevels = [],
			_avgPrtMedian = 0,
			_minMaxCntFindings = {min: 0, max: 0, maxMinDif: 0},
			_minMaxDurations = {min: 0, max: 0, maxMinDif: 0},
			_minMaxDifficultyLevels = {min: 0, max: 0, maxMinDif: 0};

		if(_simulations && _simulations.length > 0) {
			_simulations.forEach((s) => {
				if(s.id) {
					let 
						_skey = 's'+s.id,
						_sWorkload = s.workload || {
							findings: 0,
							entropy: 0,
							norm: 0,
							difficulty: 1,
							salt: 1.0
						};				

					s.workload = _sWorkload;

					_simDict[_skey] = s;

					_allDurations.push(s.time_hour);
					_allDifficultyLevels.push(s.workload.difficulty);
				}
			});
// console.log(_simDict)
			_allDurations = $.unique(_allDurations);
			_allDifficultyLevels = $.unique(_allDifficultyLevels);

			_minMaxDurations.min = Math.min(..._allDurations);
			_minMaxDurations.max = Math.max(..._allDurations);
			_minMaxDurations.maxMinDif = Math.abs(_minMaxDurations.max - _minMaxDurations.min);

			_minMaxDifficultyLevels.min = 1; //-- Math.min(..._allDifficultyLevels);
			_minMaxDifficultyLevels.max = 5; //- Math.max(..._allDifficultyLevels);
			_minMaxDifficultyLevels.maxMinDif = Math.abs(_minMaxDifficultyLevels.max - _minMaxDifficultyLevels.min);
		}

		// console.log(_simDict);
		// console.log(_simulations);

		let _scorers = Meteor.users.find({
			'profile.role': '7',
			'profile.status': 1
		}).fetch();

		// console.log(_scorers);
		let 
			_numScorers = _scorers && _scorers.length,
			_pScorers = 1/_numScorers;

		// console.log(_scorers, _scorers.length);

		Session.set("ScoringSimulationWeighting.scorers.count", _numScorers);

		Meteor.call("Findings.count", {}, (err, res) => {
			if(err) {
				sAlert.error("Something went wrong. Please try again.");
			} else {
				// console.log(res)
				if(res && res.success) {
					// if(res.data && res.data.length > 0) {
					if(res.data) {
						res.data.findings.forEach((f) => {
							if(f.sid) {
								let _skey = 's'+f.sid;
								if(_simDict[_skey]) {
									let _countFindings = f.count || 0;

									_simDict[_skey]['workload']['findings'] = _countFindings;
									_totalNumOfFindings += _countFindings;

									_allCountFindings.push(_countFindings);
								}
							}
						});	//-- res.data.findings.forEach((f) => {

						_allCountFindings = $.unique(_allCountFindings);
						
						// console.log("_allCountFindings => ", _allCountFindings);

						_minMaxCntFindings.min = Math.min(..._allCountFindings);
						_minMaxCntFindings.max = Math.max(..._allCountFindings);
						_minMaxCntFindings.maxMinDif = Math.abs(_minMaxCntFindings.max - _minMaxCntFindings.min);
// console.log(_allCountFindings, _minMaxCntFindings)

// console.log(_minMaxDifficultyLevels, _minMaxDurations, _minMaxCntFindings);

						//-- Fatigue factor calculation

						_totalScoredSims = res.data.simulations.total || 10000;

						res.data.simulations.sims.forEach((s) => {
							let _scoredSkey = 's' + s.sid;

							_scoredSimsDict[_scoredSkey] = s;
						});

						// res.data.simulations.sims.forEach((s) => {
						_simulations.forEach((s) => {
							// let _fatigue = 

							// let _skey = 's' + s.sid;
							let _skey = 's' + s.id;
// console.log(_skey);
							if(_simDict[_skey]) {
// console.log(_skey, "aaa");
								let 
									_duration = parseInt(_simDict[_skey]['time_hour']),
									_difficultyLevel = parseInt(_simDict[_skey]['workload']['difficulty']),
									_salt = _simDict[_skey]['workload']['salt'],
									_countFindings = parseFloat(_simDict[_skey]['workload']['findings']);

								let 
									// _ptr = s.pauseTimeRaw || [],
									_ptr = _scoredSimsDict[_skey] && _scoredSimsDict[_skey].pauseTimeRaw || [],
									_ptrSorted = _ptr.sort((a,b) => {
									return a - b;
								});
								
								let _ptrMedian = (_ptrSorted.length > 0 && _ptrSorted.length < 5 ? Math.min(..._ptrSorted) : Util.median(_ptrSorted)) || 1166; //-- 1166 is avg value of pauseTimeRaw median						

								// console.log(_ptrSorted);
								// console.log(_ptrMedian);
// if(_ptrMedian > 0) {
// 	_avgPrtMedian += _ptrMedian;
// }
								// if(_ptrSorted && _ptrSorted.length > 10) {

								// }

								let
									// _skey = 's' + s.sid, 
									// _countScored = s.count > 1 ? s.count : 2,
									_countScored = _scoredSimsDict[_skey] && _scoredSimsDict[_skey].count > 1 ? _scoredSimsDict[_skey] && _scoredSimsDict[_skey].count : 2,
									// _pSims = 1 / _countScored, //-- this is wrong b/c we need the probability of this sim to score, not the probability of this sim to be
									_pSims = _countScored / _totalScoredSims, //-- 
									_pScorersGivenSims = ( _pScorers * _pSims ) / _pSims,
									// _entropy = _pScorersGivenSims * Math.log2(1 / _pScorersGivenSims);
									// _normFindings = (_countFindings-_minMaxCntFindings.min)/ _minMaxCntFindings.maxMinDif || _minMaxCntFindings.maxMinDif,
									_normFindings = (_countFindings-_minMaxCntFindings.min)/ _minMaxCntFindings.maxMinDif || 0.5,
									// _normDifficultyLevel = (_difficultyLevel-_minMaxDifficultyLevels.min)/ _minMaxDifficultyLevels.maxMinDif || 2.5,
									_normDifficultyLevel = (_difficultyLevel-_minMaxDifficultyLevels.min)/ _minMaxDifficultyLevels.maxMinDif || 0.2,
									// _normDuration = (_duration-_minMaxDurations.min)/ _minMaxDurations.maxMinDif || _minMaxDurations.maxMinDif,
									_normDuration = (_duration-_minMaxDurations.min)/ _minMaxDurations.maxMinDif || 0.1,
									// _entropy =  (1/Math.log2(1 / _pSims)).toFixed(2) || 0.9;
									// _entropy =  (_normDifficultyLevel * Math.log2(_normFindings)),
									// _entropy =  (_normDifficultyLevel * Math.log2(_countFindings)),
									_entropy =  _pSims * Math.log2(1 / _pSims),
									_normValue = _normFindings * _normDuration * _normDifficultyLevel,
									// _normValue = _normFindings * _normDifficultyLevel,
									// _normValue = _normFindings + _normDuration + _normDifficultyLevel,
									// _fatigue = _normValue * _entropy,
									// _fatigue = (_countFindings * _ptrMedian * _difficultyLevel * (1/_entropy))/10000000,
									// _fatigue = (_normFindings * _ptrMedian * _normDifficultyLevel * (1/_entropy)),
									// _fatigue = (_normFindings * _ptrMedian * _normDifficultyLevel * _entropy * _normDuration)/1000,
									// _fatigue = (_normFindings * _ptrMedian * _normDifficultyLevel * _entropy * _normDuration)/100,
									_fatigue = (_normFindings * _ptrMedian * _normDifficultyLevel * _entropy * _normDuration)/100,
									// _fatigue = (_normFindings * _ptrMedian * _normDifficultyLevel * _entropy )/100,
									// _workloadScore = _fatigue / _ptrMedian;
									// _workloadScore = _fatigue * _normValue;
									// _combinedScore = ((_fatigue * 1000) * (_normValue * 1000))/1000000;
									// _combinedScore = _fatigue + _normValue;
									_combinedScore = (_fatigue/100) + _normValue;
// console.log(s.id, _normValue);
							// if(_simDict[_skey]) {

								// let 
								// 	_duration = parseInt(_simDict[_skey]['time_hour']),
								// 	_difficultyLevel = parseInt(_simDict[_skey]['workload']['difficulty']),
								// 	_salt = parseFloat(_simDict[_skey]['workload']['salt']);

								// let 
									// _normFindings = (_count-_minMaxCntFindings.min)/ _minMaxCntFindings.maxMinDif || _entropy,
									// _normDuration = (_duration-_minMaxDurations.min)/ _minMaxDurations.maxMinDif || _entropy,
									// _normDifficultyLevel = (_difficultyLevel-_minMaxDifficultyLevels.min)/ _minMaxDifficultyLevels.maxMinDif || _entropy;

								// let _normValue = Math.abs(_normFindings * _normDuration * _normDifficultyLevel).toFixed(3);
								// if(s.id === 27) {
								// 	console.log("sim => ", s.sname);
								// 	console.log("scored => ", _countScored, _pSims);
								// 	console.log("normFindings => ", _countFindings, _minMaxCntFindings, _countFindings-_minMaxCntFindings.min, _normFindings);
								// 	console.log("normDifficultyLevel => ", _normDifficultyLevel);
								// 	console.log("normDuration => ", _normDuration);
								// 	console.log("prtMedian => ", _ptrMedian);
								// 	console.log("entropy => ", _entropy);
								// 	console.log("fatigue => ", _fatigue);
								// 	console.log("workloadScore => ", _workloadScore);
								// 	console.log("normValue => ", _normValue);
								// }
	
								// let _unitScore = (_normValue * _salt).toFixed(3);
								let _workloadScore = (_combinedScore * _salt);

								// console.log("unitScore => ", _unitScore);

								_simDict[_skey]['workload']['entropy'] = _entropy;
								// _simDict[_skey]['workload']['fatigue'] = _fatigue.toFixed(6);
								// _simDict[_skey]['workload']['norm'] = _normValue.toFixed(6);
								// _simDict[_skey]['workload']['unitScore'] = _workloadScore.toFixed(6);
								_simDict[_skey]['workload']['fatigue'] = (Math.round(_fatigue * 100000) / 1000).toFixed(3);
								_simDict[_skey]['workload']['norm'] = (Math.round(_normValue * 100000) / 1000).toFixed(3);
								// _simDict[_skey]['workload']['unitScore'] = (Math.round(_workloadScore * 100000) / 1000).toFixed(3);
								_simDict[_skey]['workload']['unitScore'] = (Math.round(_workloadScore * 100000) / 10000).toFixed(3);
								_simDict[_skey]['workload']['salt'] = _salt.toFixed(1);
							}

						});	//-- res.data.sims.forEach((s) => {					

						// console.log("Total Avg PRT Median => ", _avgPrtMedian);
						// console.log("Avg PRT Median => ", _avgPrtMedian/27);

						let _sims = Object.entries(_simDict).map(([k,v]) => {
							return v;
						});

						// console.log(_sims);
						// console.log(Session.get("ScoringSimulationWeighting.sort"));

						if(Session.get("ScoringSimulationWeighting.sort")) {

							let _direction = Session.get("ScoringSimulationWeighting.sort.direction");

							_sims.sort((a,b) => {									
								return a.workload.unitScore - b.workload.unitScore;
							});							

							if(_direction === -1) {								
								_sims.reverse();											
							}

						}

						Session.set("ScoringSimulationWeighting.simulations", _sims);
						Session.set("ScoringSimulationWeighting.totalNumOfFindings", _totalNumOfFindings);

						// return _sims;

					}
				} else {
					sAlert.error("Something went wrong. Please try again.");
				}
			}
		})		
	},
	Simulations() {
		if(Session.get("ScoringSimulationWeighting.simulations")) {
			return Session.get("ScoringSimulationWeighting.simulations")
		}
	}
});

Template.ScoringSimulationWeighting.events({
	'click .btn-save-simulation-weighting'(e, tpl) {
		e.preventDefault();

		// console.log(this);
		if(this._id && this.id) { //-- sim _id & id
			let 
				_sid = this.id,
				_duration = $('#duration_'+_sid).val(),
				_num_findings = $('#num_findings_'+_sid).text(),
				_df_level = $('#df_level_'+_sid).val(),
				_salt = $('#salt_'+_sid).val(),
				_fatigue = $('#fatigue_'+_sid).text(),
				_norm = $('#norm_'+_sid).text(),
				_unitScore = $('#unitScore_'+_sid).text();

			// console.log(_sid, _duration, _df_level)
// console.log(_unitScore)
			let _obj = {
				_id: this._id,
				simulationId: parseInt(_sid),
				duration: parseInt(_duration),
				numOfFindings: parseInt(_num_findings),				
				difficultyLevel: parseInt(_df_level),
				workloadSalt: parseFloat(_salt), 
				fatigue: parseFloat(_fatigue), 
				norm: parseFloat(_norm), 
				workloadUnitScore: parseFloat(_unitScore) 
			}

			// console.log(_obj);

			Meteor.call("Simulations.workload.settings.save", _obj, (err, res) => {
				if(err) {
					// console.log(err);
					sAlert.error("Something went wrong. Please try again.");
				} else {
					// console.log(res);
					sAlert.info("Successfully updated.");

					Util.log(Meteor.user(), "scoring/sim-weighting/save/"+_sid, "scoring")
				}
			})
		} else {

		}
	},
	'change #chbx_sort_by_workload_score'(e, tpl) {
		e.preventDefault();

		let 
			_sort = $(e.currentTarget).is(':checked'),
			_direction = $("#sel_sort_direction").val();

		if(_sort) {
			Session.set("ScoringSimulationWeighting.sort", true);
			Session.set("ScoringSimulationWeighting.sort.direction", parseInt(_direction));
		} else {
			Session.set("ScoringSimulationWeighting.sort", false);
		}

		Template.ScoringSimulationWeighting.__helpers.get("getSimulations").call();
	},
	'change #sel_sort_direction'(e, tpl) {
		e.preventDefault();

		let _direction = $("#sel_sort_direction").val();

		Session.set("ScoringSimulationWeighting.sort.direction", parseInt(_direction));

		if(Session.get("ScoringSimulationWeighting.sort")) {
			Template.ScoringSimulationWeighting.__helpers.get("getSimulations").call();
		}
	}	
});

