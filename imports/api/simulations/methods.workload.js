import { Simulations } from './simulations.js';

Meteor.methods({
	"Simulations.workload.settings.save"(obj) {
		check(obj, {
			_id: String,
			simulationId: Number,
			duration: Number,
			numOfFindings: Number,
			difficultyLevel: Match.Optional(Match.OneOf(undefined, null, Number)),
			workloadSalt: Match.Optional(Match.OneOf(undefined, null, Number)),
			// entropy: Match.Optional(Match.OneOf(undefined, null, Number)),
			fatigue: Match.Optional(Match.OneOf(undefined, null, Number)),
			norm: Match.Optional(Match.OneOf(undefined, null, Number)),
			workloadUnitScore: Match.Optional(Match.OneOf(undefined, null, Number))
		})
		// this.unblock();
			
		let $_set = {
			time_hour: obj.duration,
			workload: {
				findings: obj.numOfFindings,
				difficulty: obj.difficultyLevel,
				salt: obj.workloadSalt,
				// entropy: obj.entropy,
				fatigue: obj.fatigue,
				norm: obj.norm,
				unitScore: obj.workloadUnitScore
			}			
		}

		// if(obj.difficultyLevel && obj.difficultyLevel > 0) {
		// 	$_set['difficultyLevel'] = obj.difficultyLevel;
		// }

		// if(obj.workloadSalt && obj.workloadSalt > 0) {
		// 	$_set['workloadSalt'] = obj.workloadSalt;
		// }

		let result = Simulations.update(obj._id, {
			$set: $_set
		});

		return result;

	}
});
