import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { Promise } from 'meteor/promise'

const XLSX = require('xlsx');

const ExcelJS = require('exceljs'); //-- added as an experiment for Findins Comparison (dqk, 01/14/2021)
// import { StreamBuf} from 'exceljs/dist/es5/utils/stream-buf';

import { Util } from '/imports/lib/server/util.js'

import { UsersScoreSummary } from './users-score-summary.js';
import { SimUsersSummary } from '/imports/api/sim-users-summary/sim-users-summary.js';
import { Documents } from '/imports/api/documents/documents.js';

import { Assessments } from '/imports/api/assessments/assessments.js';
import { Findings } from '/imports/api/findings/findings.js';

import fs from 'fs';

Meteor.methods({
	"UsersScoreSummary.UnidentifiedFindingsResults.export"(obj) {
		check(obj, {
			client_id: String,
			bu_id: String,
			simulation_id: Number
		})
		this.unblock()

		let output = Meteor.wrapAsync((args, callback) => {

		let pipelineScores = 
		[
			{
				$match: {
					client_id: obj.client_id,
					bu_id: obj.bu_id,
					simulation_id: obj.simulation_id
				}
			},     
			{
			$lookup: {
				from: "sim_users_summary",
				localField: "assessment_id",
				foreignField: "assessmentId",
				as: "sus"          
			}
			},
			{
			$unwind: "$sus"
			},
			// {
			//   $lookup: {
			//     from: "documents",
			//     localField: "simulation_id",
			//     foreignField: "simulation_id",
			//     as: "docs"          
			//   }
			// },
			// {
			//   $unwind: "$docs"
			// },        
			{
			$project: {
				assessment_id: "$assessment_id",
				assessee_id: "$assessee_id",
				client_id: "$client_id",
				bu_id: "$bu_id",
				simulation_id: "$simulation_id",
				client_name: "$sus.clientName",
				bu_name: "$sus.buName",
				simulation_name: "$sus.simulationName",
				firstname: "$sus.firstname",
				lastname: "$sus.lastname",
				fullname: "$sus.fullname",
				manager: "$sus.managerName",
				country: "$sus.country",
				documents: "$docs",

				// unidentifiedFindings: "$unidentified_findings.findings.id"
				// unidentifiedFindings: {
				//   $map: {
				//     input: "$unidentified_findings.findings",
				//     as: "test",
				//     in: "$$test.id"
				//   }
				// }
				unidentifiedFindings: "$unidentified_findings.findings"
				
			}
			},
			{
				$sort: {
					"fullname": 1
				}
			}
		];

		// let _scores = aggregateQueryScores(pipelineScores)
		let _scores = Promise.await(UsersScoreSummary.rawCollection().aggregate(pipelineScores).toArray());

			if(_scores && _scores.length > 0) {

				let documents = Documents.find({
					simulation_id: obj.simulation_id,
					status: 1
				}).fetch()

				let docDict = [];

				documents.forEach((d) => {
					let docKey = 'd_'+d.id;

					if(!docDict[docKey]) {
						docDict[docKey] = d;
					}
				})


				let
					client_name = _scores[0].client,
					bu_name = _scores[0].bu,
					simName = _scores[0].simulation_name;

			let data = [["Name", "Country", "Simulation", "Finding Not Identified", "Domain", "Document 1", "Document 2", "Evaluation"]]

			let
				ufDict = [], 
				dataObj = [];

			_scores.forEach((s) => {

				if(s.unidentifiedFindings && s.unidentifiedFindings.length > 0) {
					s.unidentifiedFindings.forEach((uf) => {
						if(uf.evaluation !== 'N/A') {
							let 
								fKey = 'f_'+uf.id,
								d1Key = 'd_'+uf.document_id;
								d2Key = 'd_'+uf.compare_with;

							if(!ufDict[fKey]) {
								ufDict[fKey] = [];
							}

							let sObj = {
									name: s.fullname,
									country: s.country,
									simulation: s.simulation_name,
									finding: uf.finding,
									domain: uf.category,
									document1: docDict[d1Key].name,
									document2: docDict[d2Key].name,
									eval: uf.evaluation
								}

							ufDict[fKey].push(sObj);
						}
					})
				}
				})

			Object.entries(ufDict).forEach(([k,v]) => {        	
				if(v && v.length > 0) {
					v.forEach((o) => {
						dataObj = [o.name, o.country, o.simulation, o.finding, o.domain, o.document1, o.document2, o.eval];
						data.push(dataObj);
					})
				}
				// dataObj = [v[0].name, v[0].country, v[0].simulation, v[0].finding, v[0].domain, v[0].document1, v[0].document2, v[0].eval];
			});

			// console.log(data)
			const ws = XLSX.utils.aoa_to_sheet(data);
			const wb = {SheetNames: ["Sheet1"], Sheets:{Sheet1:ws }};

			callback(null, {success: true, data: wb})

			}

		}) 

		let result = output('dk')

		if(result) {      
		return result
		}
   },
   "UsersScoreSummary.FindingsComparisonSummary.export"(obj) {
		check(obj, {
			fus_id: Number,
			baseline_id: Number,
			fus_findings: Array,
			baseline_findings: Array,
			filename: String,
			clientId: Match.Optional(Match.OneOf(undefined, null, String)),
			buId: Match.Optional(Match.OneOf(undefined, null, String))
		})

		// this.unblock()

		let _filename = obj.filename + "_"+Date.now()+".xlsx";

		let 
			_fus_id = obj.fus_id,
			_base_id = obj.baseline_id;

		let 
        	meteorRoot = fs.realpathSync( process.cwd() + '/../' ),
			publicPath = meteorRoot + '/web.browser/app';
				
		let fileBase = (process.env.NODE_ENV === 'development' || Meteor.absoluteUrl().indexOf("localhost") !== -1) ?  process.env.PWD+'/public' : publicPath;

		const wb = new ExcelJS.Workbook();

		let 
			_baseFindings = [],
			_fusFindings = [];

		let _baseFindingsNeedle = obj.baseline_findings; //-- baseline finding ids to compare
		let _fuFindingsNeedle =  obj.fus_findings; //-- followup finding ids to compare

		let 
			_baseFDict = [], //-- full baseline finding data dict 
			_fuFDict = [], //-- full followup finding data dict 
			_fKeyCountDict = []; //-- finding idfed/unidfed sum count dict
			
		let _fidPairDict = []; //-- map between baselind and followup finding ids, assuming initial finding ids are in the same order

		obj.baseline_findings.forEach((f,i) => {
			_fidPairDict['f'+f] = obj.fus_findings[i]; //-- (eg.) _fidPairDict['f1160'] = 1189 (baselin finding 1160 is supposed to be compared with followup finding 1189)
		});

		// console.log(_fidPairDict);

		let output = Meteor.wrapAsync((args, callback) => {
				
			// let _baseFindingsNeedle = obj.baseline_findings;
			// let _fuFindingsNeedle =  obj.fus_findings;

			// let 
			// _baseFDict = [],
			// _fuFDict = [],
			// _fKeyCountDict = [];

			//-- all baseline findings with the selected findings to compare
			_baseFindings = Findings.find({
			// simulation_id: obj.simulation_id_1,
			// status: 1
				id: {$in: _baseFindingsNeedle}
				}, {
					fields: {id: 1, finding: 1},
					// sort: { order: 1, category_id: 1, id: 1}
					sort: { order: 1, id: 1,  category_id: 1}
			}).fetch();

			//-- all followup findings with the selected findings to compare
			_fuFindings = Findings.find({
				// simulation_id: obj.simulation_id_2,
				// status: 1
				id: {$in: _fuFindingsNeedle}
				}, {
					fields: {id: 1, finding: 1},
					// sort: { order: 1, category_id: 1, id: 1}
					sort: { order: 1, id: 1, category_id: 1}
			}).fetch();

			// console.log(_baseFindings);
			// console.log(_fuFindings);

			if(_baseFindings && _baseFindings.length > 0) {
				_baseFindings.map((bf) => {
					if(bf.id) {
						_baseFDict['f_'+bf.id] = bf; //-- baseline finding dictionary with finding id
						_fKeyCountDict['f_'+bf.id] = { //-- baseline finding sum dictionary with finding id
							BIFI: 0,
							BIFNI: 0,
							BNIFI: 0,
							BNIFNI: 0
						};
					}
				});
			}

			if(_fuFindings && _fuFindings.length > 0) {
				_fuFindings.map((ff) => {
					if(ff.id) {
						_fuFDict['f_'+ff.id] = ff; //-- followup finding dictionary with finding id
					}
				});
			}

			// console.log(_baseFDict)
			// console.log(_fuFDict)

			let _$susMatch = {
				simulationId: { $in: [ obj.fus_id, obj.baseline_id]},
				status: 'Active.',
				resultStage: { $in: [ 'Published', 'Exported', 'Distributed']}
			}
// console.log(obj)
			if(obj.clientId) {
				_$susMatch['clientId'] = obj.clientId
			}
			if(obj.buId) {
				_$susMatch['buId'] = obj.buId
			}			

			// console.log(_$susMatch)

			//-- Assessment ids of all published sim assessments
			let _allPubedAsmt = SimUsersSummary.find(_$susMatch).fetch().map((s) => {
				return s.assessmentId;
			})

			// console.log(_allPubedAsmt);

			let pipelineScores = 
			[
			{
				$match: {
					// status: { $gte: 3 },
					// $or: [
					// 	{ simulation_id: obj.simulation_id1 },
					// 	{ simulation_id: obj.simulation_id2 }
					// ]
					_id: { $in: _allPubedAsmt }
				}
			},
			{
				$lookup: {
					from: "users_score_summary",
					localField: "_id",
					foreignField: "assessment_id",
					as: "uss"
				}
			},
			{
				$unwind: "$uss"
			},             
			{
				$lookup: {
					from: "sim_users_summary",
					// localField: "_id",
					// foreignField: "assessmentId",            
					let: {
						client_id: "$client_id",
						bu_id: "$bu_id",
						assessee_id: "$assessee_id",
						// simulation_id: "$simulation_id",
						// fullname: "$fullname"
					},
					pipeline: [
						{
						$match: {
							// status: 'Active.',
							$or: [
								{simulationId: obj.fus_id},
								{simulationId: obj.baseline_id}
							],
							$expr: {
							$and: [
								{ $eq: [ "$clientId", "$$client_id" ] },
								{ $eq: [ "$buId", "$$bu_id" ] },
								{ $eq: [ "$userId", "$$assessee_id" ] }
							]
							}
						}
						},
						{ $project: { _id: 0, clientId: 0, buId: 0, userId: 0 } },
					],          
					as: "sus"
				}
			},
			{
				$unwind: "$sus"
			},
			// {
			//   $lookup: {
			//     from: "users_score_summary",
			//     localField: "_id",
			//     foreignField: "assessment_id",
			//     as: "uss"
			//   }
			// },
			// {
			//   $unwind: "$uss"
			// },        
			{
				$group: {
					_id: "$assessee_id",
					// ussData: { $addToSet: "$uss" },
					// susData: { $addToSet: "$sus" },
					fullname: { $first: "$sus.fullname" },
					client: { $first: "$sus.clientName" },
					bu: { $first: "$sus.buName" },
					simulations: { $addToSet: { 
						sid: "$sus.simulationId",
						sname: "$sus.simulationName"
					}},
					ussUFIDs: { $addToSet: {
						sid: "$uss.simulation_id", 
						ufids: "$uss.findingIds"
					}},
					// ussIFIDs: { $addToSet: {
					// 	sid: "$uss.simulation_id", 
					// 	ifids: "$uss.idfs"
					// }}					
				}
			},
			{
				$project: {
					// assessment_id: "$assessmentId",
					// assessee_id: "$assessee_id",
					// client_id: "$client_id",
					// bu_id: "$bu_id",
					// simulation_id: "$simulation_id",
					// client_name: "$sus.clientName",
					// bu_name: "$sus.buName",
					// simulation_name: "$sus.simulationName",
					// fullname: "$sus.fullname",
					// country: "$sus.country",
					// uss: "$uss.findingIds"
					// ussData: "$ussData",
					fullname: "$fullname",
					client: "$client",
					bu: "$bu",
					simulations: "$simulations",
					ussUFIDs: "$ussUFIDs",
					// ussIFIDs: "$ussIFIDs"
				}
			},
			// { "$replaceRoot": { "newRoot": "$uss" }},
			{
				$sort: {
				"fullname": 1,
				// "simulation_id": -1
				// "uss.simulation_id": 1,
				// "sus.simulationId": 1
				}
			}
			];
			
			//-- score (w/ unidentified finding ids) and user info of published sims
			let _scores = Promise.await(Assessments.rawCollection().aggregate(pipelineScores).toArray());

			callback(null, {success: true, data: _scores})
		});

		//-- Excel export logic should be outside the pipeline promise block
		let result = output('dq')

		if(result) {

			let _scores = result.data;

			// console.log(_scores.length)

			// console.log((_scores[0]))
			
			if(_scores && _scores.length > 0) {

				//   // let _data = ["First Last", "Client Name", ];
				// let
				// 	headData = {
				// 		baseFIDs: ["Baseline ID", ""],
				// 		baseFs: ["Baseline Finding", ""],
				// 		fuFIDs: ["Followup Finding ID", ""],
				// 		fuFs: ["Followup Finding", ""]
				// 	},
				// 	isHeadDataDone = false,
				// 	excelData = [],
				// 	_data = [],
				// 	_baseSimName = "";
				// 	_fuSimName = "";

				// _scores.map((s, i) => {
					
				// 	// console.log(s, s.ussUFIDs)

				// 	if(s.ussUFIDs && s.ussUFIDs.length > 1) { //-- only if the user has done both Base and FU sims

				// 		let 
				// 			_cpBIKey = "BI",
				// 			_cpBNIKey = "BNI",
				// 			_cpFIKey = "FI",
				// 			_cpFNIKey = "FNI";

				// 		// console.log((s))            

				// 		let
				// 			_dataObj = [],
				// 			_baseUFIDs = [],
				// 			_fuUFIDs = [];

				// 	}
				// });       

				// const wb = new ExcelJS.Workbook();

				//-- basic Excel file info
				wb.creator = 'David Kim';
				wb.lastModifiedBy = 'David Kim';
				// workbook.created = new Date(1985, 8, 30);
				wb.created = new Date();
				wb.modified = new Date();
				// workbook.lastPrinted = new Date();

				//-- Force workbook calculation on load
				wb.calcProperties.fullCalcOnLoad = true;

				//-- The Workbook views controls how many separate windows Excel 
				//-- will open when viewing the workbook.
				wb.views = [
					{
						x: 0, y: 0, width: 20000, height: 20000,
						firstSheet: 0, activeTab: 1, visibility: 'visible'
					}
				]

				// const worksheet = workbook.addWorksheet('My Sheet');

				// // create a sheet with red tab colour
				// const sheet = workbook.addWorksheet('My Sheet', {properties:{tabColor:{argb:'FFC0000'}}});
				
				// // create a sheet where the grid lines are hidden
				// const sheet = workbook.addWorksheet('My Sheet', {views: [{showGridLines: false}]});
				
				// // create a sheet with the first row and column frozen
				// const sheet = workbook.addWorksheet('My Sheet', {views:[{state: 'frozen', xSplit: 1, ySplit:1}]});
				
				// // Create worksheets with headers and footers
				// const sheet = workbook.addWorksheet('My Sheet', {
				// 	headerFooter:{firstHeader: "Hello Exceljs", firstFooter: "Hello World"}
				// });
				
				//-- create new sheet with pageSetup settings for A4 - landscape
				const ws =  wb.addWorksheet(obj.filename, {
					// pageSetup:{ paperSize: 9, orientation:'landscape', horizontalCentered: true },
					pageSetup:{ paperSize: 9, orientation:'landscape' },
					// pageSetup:{ paperSize: 9, orientation:'landscape', fitToPage: true, fitToHeight: 5, fitToWidth: 7 },
					// properties:{ tabColor: { argb:'FFC0000' } },					
					properties:{ tabColor: { argb:'2185d0' } },					
				});

				// ws.getColumn(5).outlineLevel = 10;
				// ws.pageSetup.margins = {
				// 	left: 0.7, right: 0.7,
				// 	top: 0.75, bottom: 0.75,
				// 	header: 0.3, footer: 0.3
				// };
				// ws.columns = [];

				// // Add column headers and define column keys and widths
				// // Note: these column structures are a workbook-building convenience only,
				// // apart from the column width, they will not be fully persisted.
				// ws.columns = [
				// 	{ header: 'Baseline ID', key: 'key_baselineId', width: 10 },
				// 	{ header: 'Baseline Finding', key: 'key_baselineFinding', width: 100 },
				// 	{ header: 'Followup Finding ID', key: 'key_followupFindingId', width: 20, outlineLevel: 1 },
				// 	{ header: 'Followup Finding', key: 'key_followupFinding', width: 100 },
				// ];

				//-- The first four columns that show Baseline and Followup findings
				// let _cols = [
				// 	{ header: 'Baseline ID', key: 'key_baselineId', width: 10 },
				// 	{ header: 'Baseline Finding', key: 'key_baselineFinding', width: 100 },
				// 	{ header: 'Followup Finding ID', key: 'key_followupFindingId', width: 25, outlineLevel: 1 },
				// 	{ header: 'Followup Finding', key: 'key_followupFinding', width: 100 },					
				// ];				

				//-- The array placeholders for the headers of first four columns
				let 
					_col1 = ['Baseline ID',''],
					_col2 = ['Baseline Finding',''],
					_col3 = ['Followup Finding ID',''],
					_col4 = ['Followup Finding',''];					

				//-- add data to the first four column arrays
				_baseFindings.forEach((f) => {
					let _fuFinding = _fuFDict['f_'+_fidPairDict['f'+f.id]];
					_col1.push(f.id);
					_col2.push(f.finding);
					_col3.push(_fuFinding.id)
					_col4.push(_fuFinding.finding)
				});

				//-- add values to the Excel columns
				ws.getColumn(1).values = _col1;
				ws.getColumn(2).values = _col2;
				ws.getColumn(3).values = _col3;
				ws.getColumn(4).values = _col4;

				//-- update column index
				let _userColIdx = 5;

				// let 
				// 	_sumBIFI = ["BIFI",''],
				// 	_sumBIFNI = ["BIFNI",''],
				// 	_sumBNIFI = ["BNIFI",''],
				// 	_sumBNIFNI = ["BNIFNI",''],
				// 	_percentBIFI = ["BIFI",''],
				// 	_percentBIFNI = ["BIFNI",''],
				// 	_percentBNIFI = ["BNIFI",''],
				// 	_percentBNIFNI = ["BNIFNI",''];

				//-- Dictionary for sum values of users identifed/unidenfied finding cases
				let _sumDict = [];

				_scores.forEach((s, i) => {
					
					// console.log(s, s.ussUFIDs)
					// console.log(s)

					//-- placeholder arryas for baseline and followup fids
					let 
						_myBaseUFids = [],
						_myFusUFids = [];

					//-- each user's the first two values: fullname and bu-name
					let _userColValues = [s.fullname, s.client + '-' + s.bu];

					//-- unidentified finding ids for baseline and followup sims, so, we want to proceed 
					//-- only if the user has done both Base and FU sims
					if(s.ussUFIDs && s.ussUFIDs.length > 1) {

						s.ussUFIDs.forEach((f) => {
							if(f.sid === _base_id) { //-- if the unidentified finding set is from baseline sim
								_myBaseUFids = f.ufids;
							}
							else if(f.sid === _fus_id) { //-- if the unidentified finding set is from followup sim
								_myFusUFids = f.ufids;
							}
						})

						_baseFindings.forEach((f,i) => {
							let 
								_fid = f.id,
								_key = ""; //-- identifying keys

							// console.log(_myBaseUFids, f, _myBaseUFids.includes(f.id));
							
							if(_myBaseUFids.includes(_fid)) { //-- if unidentified finding ids has this finding id
								_key = "BNI" //-- Baseline not identified							
							} else {
								_key = "BI"; //-- otherwise, we just assume this finding got identified
							}

							if(_myFusUFids.includes(_fidPairDict['f'+_fid])) { //-- _fidPairDict gets followup finding id mapped to this baseline finding id
								_key += "FNI"; //-- so, if unidentified followup finding ids has this finding id, it's not identified
							} else {
								_key += "FI" //-- otherwise, we just assume followup finding mapped to this baseline finding got identified whatever it is
							}

							//-- add the concatenated key values to the user data column
							_userColValues.push(_key);

							// if(!_sumDict['f'+_fid]) {
							// 	_sumDict['f'+_fid] = {
							if(!_sumDict[i]) { //-- if this is first sum data for this finding
								_sumDict[i] = {	//-- initiate sum data for this finding
									"total": 0,							
									"BIFI": 0,
									"BIFNI": 0,
									"BNIFI": 0,
									"BNIFNI": 0,
								}
							}

							_sumDict[i][_key]++; //-- sum each key count
							_sumDict[i]['total']++; //-- sum total count for percent calculation

						});

						ws.getColumn(_userColIdx).values = _userColValues; //-- add Excel values for this user column

						_userColIdx++; //-- update user column index
					}

				}); //-- _scores.forEach((s, i) => {				
				
				//-- sum data
				let _sumValues = [
					["BIFI",''],
					["BIFNI",''],
					["BNIFI",''],
					["BNIFNI",'']
				]

				//-- percent data
				let _percentValues = [
					["BIFI",''],
					["BIFNI",''],
					["BNIFI",''],
					["BNIFNI",'']
				]

				_baseFindings.forEach((f,i) => {

					//-- get total value per finding
					let _total = _sumDict[i].total;

					//-- collect sum data per finding and add to each column data
					_sumValues[0].push(_sumDict[i].BIFI);
					_sumValues[1].push(_sumDict[i].BIFNI);
					_sumValues[2].push(_sumDict[i].BNIFI);
					_sumValues[3].push(_sumDict[i].BNIFNI);

					// _percentValues[0].push(Math.round(_sumDict[i].BIFI/_total *100));
					// _percentValues[1].push(Math.round(_sumDict[i].BIFNI/_total *100));
					// _percentValues[2].push(Math.round(_sumDict[i].BNIFI/_total *100));
					// _percentValues[3].push(Math.round(_sumDict[i].BNIFNI/_total *100));

					// _percentValues[0].push( Math.round(_sumDict[i].BIFI/_total ));
					// _percentValues[1].push( Math.round(_sumDict[i].BIFNI/_total ));
					// _percentValues[2].push( Math.round(_sumDict[i].BNIFI/_total ));
					// _percentValues[3].push( Math.round(_sumDict[i].BNIFNI/_total ));	
					
					//-- collect percent data per finding and add to each column data
					_percentValues[0].push( _sumDict[i].BIFI/_total ); //-- this'd be float value for now, will be converted to integer by formatting each cell to be percentage later
					_percentValues[1].push( _sumDict[i].BIFNI/_total );
					_percentValues[2].push( _sumDict[i].BNIFI/_total );
					_percentValues[3].push( _sumDict[i].BNIFNI/_total );
					
				})

				let _sumIdx = _userColIdx +2; //-- skip 2 columns, then, start sum data column per key (so, 4 coulumns for sum data)

				//-- add sum data to Excel column values
				ws.getColumn(_sumIdx).values = _sumValues[0];
				ws.getColumn(_sumIdx+1).values = _sumValues[1];
				ws.getColumn(_sumIdx+2).values = _sumValues[2];
				ws.getColumn(_sumIdx+3).values = _sumValues[3];

				//-- add percentage data to Excel column values
				ws.getColumn(_sumIdx+5).values = _percentValues[0];
				ws.getColumn(_sumIdx+6).values = _percentValues[1];
				ws.getColumn(_sumIdx+7).values = _percentValues[2];
				ws.getColumn(_sumIdx+8).values = _percentValues[3];
				
				//-- skip 2 columns and start adding legend data to Excel coumns
				ws.getColumn(_sumIdx+11).values = ['Legend','','BIFI','BIFNI','BNIFI','BNIFNI'];
				ws.getColumn(_sumIdx+12).values = ['','','Baseline Identified, Followup Identified',
					'Baseline Identified, Followup Not Identified',
					'Baseline Not Identified, Followup Identified',
					'Baseline Not Identified, Followup Not Identified'];

				//-- all headers in the first row should be bold-faced
				// ws.getRow(1).font = { bold: true };

				//-- the width of first four columns
				ws.getColumn(1).width = 10; //-- Baseline ID
				ws.getColumn(2).width = 80; //-- Baseline Finding
				ws.getColumn(3).width = 17; //-- Followup Finding ID
				ws.getColumn(4).width = 80; //-- Followup Finding

				// let _lastRow = _baseFindings.length +2; 

				//-- apply styles to user column cells
				for(var i = 1;i < _userColIdx;i++) {

					//-- let values be the center of each cell
					ws.getColumn(i).alignment = { horizontal: 'center' };					

					//-- solid border line
					ws.getColumn(i).eachCell((cell, rowNumber) => {
						// console.log(cell.value)
						if(cell.value !== null) {
							cell.border = {
								top: {style:'thin'},
								left: {style:'thin'},
								bottom: {style:'thin'},
								right: {style:'thin'}
							};
							
							cell.font = { size: 12 };
					}	
					})					
				}

				let _fillStyles = [
					{
						type: 'pattern',								
						pattern:'solid',
						fgColor: { argb:'339966' } //-- BIFI
					},
					{
						type: 'pattern',								
						pattern:'solid',
						fgColor: { argb:'FFCC00' } //-- BIFNI
					},
					{
						type: 'pattern',								
						pattern:'solid',
						fgColor: { argb:'339966' } //-- BNIFI
					},
					{
						type: 'pattern',								
						pattern:'solid',
						fgColor: { argb:'FF0000' } //-- BNIFNI
					},															
				]

				for(var i = 5;i < _userColIdx;i++) {										
					
					//-- width of user columns
					ws.getColumn(i).width = 17;					

					//-- set cell color based on its cell/key value
					ws.getColumn(i).eachCell((cell, rowNumber) => {
						let _val = cell.value;
						if(_val === 'BIFI') {
							cell.style.fill = _fillStyles[0]
						}
						else if(_val === 'BIFNI') {
							cell.style.fill = _fillStyles[1]
						}
						else if(_val === 'BNIFI') {
							cell.style.fill = _fillStyles[2]
						}
						else if(_val === 'BNIFNI') {
							cell.style.fill = _fillStyles[3]
						}												
					})
				}

				//-- sum columns 
				for(var i = _sumIdx;i < _sumIdx+4;i++) {
					ws.getColumn(i).alignment = { horizontal: 'center' };

					// let _col = (i+9).toString(36).toUpperCase();
					let _col = colName(i); //-- get alphabet column name

					ws.getCell(`${_col}1`).style.fill = _fillStyles[i-_sumIdx]

					ws.getColumn(i).eachCell((cell, rowNumber) => {
						if(cell.value !== null) {
							cell.border = {
								top: {style:'thin'},
								left: {style:'thin'},
								bottom: {style:'thin'},
								right: {style:'thin'}
							};
							cell.font = { size: 12 };
						}
					})					
				}

				let _percentIdx = _sumIdx + 5;

				for(var i = _percentIdx;i < _percentIdx+4;i++) {
					ws.getColumn(i).alignment = { horizontal: 'center' };

					// let _col = (i+9).toString(36).toUpperCase();
					let _col = colName(i); //-- get alphabet column name

					ws.getCell(`${_col}1`).style.fill = _fillStyles[i-_percentIdx]

					ws.getColumn(i).eachCell((cell, rowNumber) => {
						if(cell.value !== null) {
							//-- draw border line for all cells in this range
							cell.border = {
								top: {style:'thin'},
								left: {style:'thin'},
								bottom: {style:'thin'},
								right: {style:'thin'}
							};

							if(rowNumber > 2) { //-- if it's the cell w/ percentage value
								cell.numFmt = '0%' //-- set cell format to be percentage with no decimal point
							}
							cell.font = { size: 12 };
						}
					})					
				}

				let _legendIdx = _percentIdx + 6;

				ws.getColumn(_legendIdx+1).width = 45;

				for(var i = _legendIdx;i < _legendIdx+2;i++) {
					
					ws.getColumn(i).eachCell((cell, rowNumber) => {

						if(rowNumber > 2 && rowNumber < 7) {

							//-- draw border line only for the cells with legend texts
							cell.border = {
								top: {style:'thin'},
								left: {style:'thin'},
								bottom: {style:'thin'},
								right: {style:'thin'}
							};
							// let _col = (i+9).toString(36).toUpperCase();	
							// let _col = printToLetter(i);
							let _col = colName(i); //-- get alphabet column name
							// console.log(i, rowNumber, _col)
							ws.getCell(`${_col}3`).style.fill = _fillStyles[0] //-- BIFI							
							ws.getCell(`${_col}4`).style.fill = _fillStyles[1] //-- BIFNI							
							ws.getCell(`${_col}5`).style.fill = _fillStyles[2] //-- BNIFI							
							ws.getCell(`${_col}6`).style.fill = _fillStyles[3] //-- BNIFNI							

							cell.font = { size: 12 };
							// ws.getCell(`${_col}3`).style = {
							// 	width: 100,
							// 	fill: _fillStyles[0]
							// }
							
						}
					})					
				}

				//-- all headers in the first row should be bold-faced
				ws.getRow(1).font = { size: 12, bold: true };				

				// ws.getRow(1).alignment = { horizontal: 'center' };

				// let _keySets = [
				// 	{},
				// 	{ header: 'BIFI', key: 'key_BIFI_1', width: 10 },
				// 	{ header: 'BIFNI', key: 'key_BIFNI_1', width: 10 },
				// 	{ header: 'BNIFI', key: 'key_BNIFI_1', width: 10 },
				// 	{ header: 'BNIFNI', key: 'key_BNIFNI_1', width: 10 },
				// 	{},
				// 	{ header: 'BIFI', key: 'key_BIFI_2', width: 10 },
				// 	{ header: 'BIFNI', key: 'key_BIFNI_2', width: 10 },
				// 	{ header: 'BNIFI', key: 'key_BNIFI_2', width: 10 },
				// 	{ header: 'BNIFNI', key: 'key_BNIFNI_2', width: 10 },					
				// ]

				// let _keySet2 = [
				// 	{},
				// 	{ header: 'BIFI', key: 'key_BIFI_2', width: 10 },
				// 	{ header: 'BIFNI', key: 'key_BIFNI_2', width: 10 },
				// 	{ header: 'BNIFI', key: 'key_BNIFI_2', width: 10 },
				// 	{ header: 'BNIFNI', key: 'key_BNIFNI_2', width: 10 },
				// ]

				// _cols = _cols.concat(_keySets);

				// ws.columns = _cols;

				// ws.getColumn(6).values = [1,2,3,4,5];

			} //-- if(_scores && _scores.length > 0) {

			// console.log(ws.columns)

			Future = Npm.require('fibers/future');
			var fut = new Future();

			let filename = "/fc_exports/"+_filename;
			// let filename = "fc_test.xlsx";
			// if(process.env.NODE_ENV === "development") {        				
			if(process.env.NODE_ENV === "production") {     				
		  
				// let buf = new StreamBuf()
				// const buffer = wb.xlsx.writeBuffer();

				// wb.xlsx.write(buffer)
				wb.xlsx.writeBuffer()
  					.then(function(buffer) {
    					// let buffer = buf.toBuffer();

						var headers = {
							'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
							'Content-Length': buffer.length,
							'x-amz-acl': 'public-read'
						};
			  
						// S3.config['bucket'] = 'craav2-exports/fc'
						var req = S3.knox.putBuffer(buffer, filename, headers, function(err, res){
							// console.log(err, res)
								fut["return"]({
								  // url:"http://localhost:3200/exports/"+filename,
								  filename: _filename,
								  err: false	
								//   res: res,
								//   error: err								  
								});
						  
						}); //upload image, assume its ok						
  				});

				// wb.writeToBuffer().then(function (buffer) {
				// 	// Do something with buffer 
				// 	// console.log(buffer)
		  
				// 	var headers = {
				// 		'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
				// 		'Content-Length': buffer.length,
				// 		'x-amz-acl': 'public-read'
				// 	};
		  
				// 	S3.config['bucket'] = 'craav2-exports/fc'
				// 	var req = S3.knox.putBuffer(buffer, filename, headers, function(err, res){
		  
				// 			fut["return"]({
				// 			  // url:"http://localhost:3200/exports/"+filename,
				// 			  filename: filename,
				// 			  error: false
				// 			});
					  
				// 	}); //upload image, assume its ok		  
				// });

			  } else {			
				wb
				.xlsx
					.writeFile(fileBase + "/fc_exports/"+_filename)
					.then(() => {
						// console.log("saved");
						fut["return"]({
							// url:"http://localhost:3200/exports/"+filename,
							filename: _filename,
							error: false
						});
					})
				.catch((err) => {
				// console.log("err", err);
				fut["return"]({
					// url:"http://localhost:3200/exports/"+filename,
					// filename: filename,
					error: err
				  });
				});	
			
			// result['wb'] = wb.xlsx;
			}
			// return result;
			return fut.wait(); // this resolves the partial downloading issue.

		} //-- if(result) {

				// console.log(_cols)
				// ws.addRow({id: 1, name: 'John Doe', dob: new Date(1970, 1, 1)});
				// ws.addRow({id: 2, name: 'Jane Doe', dob: new Date(1965, 1, 7)});

				// console.log(workbook)

				// save workbook to disk
// wb
// .xlsx
// .writeFile(fileBase + '/sample.xlsx')
// .then(() => {
//   console.log("saved");
// })
// .catch((err) => {
//   console.log("err", err);
// });
				
				// const buf = await workbook.xlsx.writeBuffer()

			// 	try {
			// 		callback(null, {success: true, data: _scores, wb: wb})
			// 	} catch(e) {

			// 	}

			// } else { //-- if(_scores && _scores.length > 0) { } else 
			// 	callback(null, {success: false, data: []})
			// }

		// })

		// let result = output('dq')

		// if(result) {

		// 	wb
		// 	.xlsx
		// 	.writeFile(fileBase + '/sample.xlsx')
		// 	.then(() => {
		// 	  console.log("saved");
		// 	})
		// 	.catch((err) => {
		// 	  console.log("err", err);
		// 	});

		// 	return result
		// }
	},    
   "UsersScoreSummary.FindingsComparison.export0"(obj) {
		check(obj, {
			fus_id: Number,
			baseline_id: Number,
			fus_findings: Array,
			baseline_findings: Array
		})

		// this.unblock()

		let output = Meteor.wrapAsync((args, callback) => {
				
			let _baseFindingsNeedle = obj.baseline_findings;
			let _fuFindingsNeedle =  obj.fus_findings;

			let 
			_baseFDict = [],
			_fuFDict = [],
			_fKeyCountDict = [];

			let _baseFindings = Findings.find({
			// simulation_id: obj.simulation_id_1,
			// status: 1
				id: {$in: _baseFindingsNeedle}
				}, {
					fields: {id: 1, finding: 1},
					sort: { order: 1, category_id: 1, id: 1}
			}).fetch();

			let _fuFindings = Findings.find({
				// simulation_id: obj.simulation_id_2,
				// status: 1
				id: {$in: _fuFindingsNeedle}
				}, {
					fields: {id: 1, finding: 1},
					sort: { order: 1, category_id: 1, id: 1}
			}).fetch();

			// console.log(_baseFindings);
			// console.log(_fuFindings);

			if(_baseFindings && _baseFindings.length > 0) {
				_baseFindings.map((f1) => {
					if(f1.id) {
						_baseFDict['f_'+f1.id] = f1;
						_fKeyCountDict['f_'+f1.id] = {
							BIFI: 0,
							BIFNI: 0,
							BNIFI: 0,
							BNIFNI: 0
						};
					}
				});
			}

			if(_fuFindings && _fuFindings.length > 0) {
				_fuFindings.map((f2) => {
					if(f2.id) {
						_fuFDict['f_'+f2.id] = f2;
					}
				});
			}

			// console.log(_baseFDict)
			// console.log(_fuFDict)

			let _allPubedAsmt = SimUsersSummary.find({
				simulationId: { $in: [ obj.fus_id, obj.baseline_id]},
				status: 'Active.',
				resultStage: { $in: [ 'Published', 'Exported', 'Distributed']}
			}).fetch().map((s) => {
				return s.assessmentId;
			})

			// console.log(_allPubedAsmt);

			let pipelineScores = 
			[
			{
				$match: {
					// status: { $gte: 3 },
					// $or: [
					// 	{ simulation_id: obj.simulation_id1 },
					// 	{ simulation_id: obj.simulation_id2 }
					// ]
					_id: { $in: _allPubedAsmt }
				}
			},
			{
				$lookup: {
					from: "users_score_summary",
					localField: "_id",
					foreignField: "assessment_id",
					as: "uss"
				}
			},
			{
				$unwind: "$uss"
			},             
			{
				$lookup: {
					from: "sim_users_summary",
					// localField: "_id",
					// foreignField: "assessmentId",            
					let: {
						client_id: "$client_id",
						bu_id: "$bu_id",
						assessee_id: "$assessee_id",
						// simulation_id: "$simulation_id",
						// fullname: "$fullname"
					},
					pipeline: [
						{
						$match: {
							// status: 'Active.',
							$or: [
								{simulationId: obj.fus_id},
								{simulationId: obj.baseline_id}
							],
							$expr: {
							$and: [
								{ $eq: [ "$clientId", "$$client_id" ] },
								{ $eq: [ "$buId", "$$bu_id" ] },
								{ $eq: [ "$userId", "$$assessee_id" ] }
							]
							}
						}
						},
						{ $project: { _id: 0, clientId: 0, buId: 0, userId: 0 } },
					],          
					as: "sus"
				}
			},
			{
				$unwind: "$sus"
			},
			// {
			//   $lookup: {
			//     from: "users_score_summary",
			//     localField: "_id",
			//     foreignField: "assessment_id",
			//     as: "uss"
			//   }
			// },
			// {
			//   $unwind: "$uss"
			// },        
			{
				$group: {
				_id: "$assessee_id",
				// ussData: { $addToSet: "$uss" },
				// susData: { $addToSet: "$sus" },
				fullname: { $first: "$sus.fullname" },
				client: { $first: "$sus.clientName" },
				simulations: { $addToSet: { 
					sid: "$sus.simulationId",
					sname: "$sus.simulationName"
				}},
				ussUFIDs: { $addToSet: {
					sid: "$uss.simulation_id", 
					ufids: "$uss.findingIds"
				}}
				}
			},
			{
				$project: {
				// assessment_id: "$assessmentId",
				// assessee_id: "$assessee_id",
				// client_id: "$client_id",
				// bu_id: "$bu_id",
				// simulation_id: "$simulation_id",
				// client_name: "$sus.clientName",
				// bu_name: "$sus.buName",
				// simulation_name: "$sus.simulationName",
				// fullname: "$sus.fullname",
				// country: "$sus.country",
				// uss: "$uss.findingIds"
				// ussData: "$ussData",
				fullname: "$fullname",
				client: "$client",
				simulations: "$simulations",
				ussUFIDs: "$ussUFIDs"           
				}
			},
			// { "$replaceRoot": { "newRoot": "$uss" }},
			{
				$sort: {
				"fullname": 1,
				// "simulation_id": -1
				// "uss.simulation_id": 1,
				// "sus.simulationId": 1
				}
			}
			];
			
			let _scores = Promise.await(Assessments.rawCollection().aggregate(pipelineScores).toArray());

			// console.log(_scores.length)

			// console.log((_scores[0]))

			if(_scores && _scores.length > 0) {

				//   // let _data = ["First Last", "Client Name", ];
				let
					headData = {
						baseFIDs: ["Baseline ID", ""],
						baseFs: ["Baseline Finding", ""],
						fuFIDs: ["Followup Finding ID", ""],
						fuFs: ["Followup Finding", ""]
					},
					isHeadDataDone = false,
					excelData = [],
					_data = [],
					_baseSimName = "";
					_fuSimName = "";

				_scores.map((s, i) => {
					
					// console.log(s, s.ussUFIDs)

					if(s.ussUFIDs && s.ussUFIDs.length > 1) { //-- only if the user has done both Base and FU sims

						let 
							_cpBIKey = "BI",
							_cpBNIKey = "BNI",
							_cpFIKey = "FI",
							_cpFNIKey = "FNI";

						// console.log((s))            

						let
							_dataObj = [],
							_baseUFIDs = [],
							_fuUFIDs = [];


						_dataObj.push(s.fullname);
						_dataObj.push(s.client);

						s.ussUFIDs.forEach((uf, i) => {
							if(uf.sid === obj.baseline_id) { //-- Baseline
								_baseSimName = uf.sname;
								_baseUFIDS = uf.ufids;
							} else { //-- Followup
								_fuSimName = uf.sname;
								_fuUFIDs = uf.ufids;
							}
						})

						_baseFindingsNeedle.forEach((bf, i) => {
							
							// console.log(bf, _baseFDict['f_'+bf])
							
							if(!isHeadDataDone) {

								// if(_baseFDict['f_'+bf]) {
									headData.baseFIDs.push(bf);
									headData.baseFs.push(_baseFDict['f_'+bf].finding);

									headData.fuFIDs.push(_fuFindingsNeedle[i]);
									headData.fuFs.push(_fuFDict['f_'+_fuFindingsNeedle[i]].finding);
								// }

								if(i === _baseFindingsNeedle.length -1) {
									isHeadDataDone = true;
								}                
							} 

							let _cpKey = "";

							if(_baseUFIDS.includes(bf)) {
								_cpKey += _cpBNIKey
							} else {
								_cpKey += _cpBIKey
							}

							if(_fuUFIDs.includes(_fuFindingsNeedle[i])) {
								_cpKey += _cpFNIKey
							} else {
								_cpKey += _cpFIKey
							}

							_fKeyCountDict['f_'+bf][_cpKey] += 1;

							_dataObj.push(_cpKey)
						});            

						_data.push(_dataObj)            

					} //-- if(s.ussUFIDs && s.ussUFIDs.length > 1) {

				}) //-- _scores.map((s, i) => {

				excelData.push(headData.baseFIDs);
				excelData.push(headData.baseFs);
				excelData.push(headData.fuFIDs);
				excelData.push(headData.fuFs);

				let finalData = excelData.concat(_data);        

				// console.log(_fKeyCountDict)

				let _countData = [
					["BIFI",""],
					["BIFNI",""],
					["BNIFI",""],
					["BNIFNI",""]
				];

				Object.entries(_fKeyCountDict).forEach(([k,v]) => {
					_countData[0].push(v.BIFI);
					_countData[1].push(v.BIFNI);
					_countData[2].push(v.BNIFI);
					_countData[3].push(v.BNIFNI);
				})

				finalData.push([]);
				finalData = finalData.concat(_countData);

				finalData.push([]);
				finalData.push(["Legend"]);
				finalData.push(["BIFI", "Baseline Identified, Followup Identified"]);
				finalData.push(["BIFNI", "Baseline Identified, Followup Not Identified"]);
				finalData.push(["BNIFI", "Baseline Not Identified, Followup Identified"]);
				finalData.push(["BNIFNI", "Baseline Not Identified, Followup Not Identified"]);        

				const ws = XLSX.utils.aoa_to_sheet(finalData);
				// const wb = {SheetNames: ["Findings Comparison"], Sheets:{Sheet1:ws }};        
				// const wb = {SheetNames: ["Sheet1"], Sheets:{Sheet1:ws }};        
				const wb = {SheetNames: ["Report"], Sheets:{"Report":ws }};        

				callback(null, {success: true, data: wb})

			} else { //-- if(_scores && _scores.length > 0) { } else 
				callback(null, {success: false, data: []})
			}

		})

		let result = output('dq')

		if(result) {
			return result
		}      
  }   
})

let _alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
let _result = "";

// function printToLetter(number){
//     var charIndex = number % _alphabet.length
//     var quotient = number/_alphabet.length
//     if(charIndex-1 == -1){
//         charIndex = _alphabet.length
//         quotient--;
//     }
//     _result =  _alphabet.charAt(charIndex-1) + _result;
//     if(quotient>=1){
//         printToLetter(parseInt(quotient));
//     }else{
//         console.log("Letter => ", _result)
// 		// _result = ""
		
// 		return _result;
// 	}
	
// 	// return _result;
// }

// function colName0(n) {
// 	var ordA = 'a'.charCodeAt(0);
// 	var ordZ = 'z'.charCodeAt(0);
// 	var len = ordZ - ordA + 1;
  
// 	var s = "";
// 	while(n >= 0) {
// 		s = String.fromCharCode(n % len + ordA) + s;
// 		n = Math.floor(n / len) - 1;
// 	}
// 	return s.toUpperCase();
// }

function colName(n) {	 
	let num = n-1;
    let letters = ''
    while (num >= 0) {
        letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[num % 26] + letters
        num = Math.floor(num / 26) - 1
    }
    return letters
}
