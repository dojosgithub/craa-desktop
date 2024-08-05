import { SimUsersSummary } from '/imports/api/sim-users-summary/sim-users-summary.js';
import { ScoringTempTimerLog } from '/imports/api/scoring-temp-timer-log/scoring-temp-timer-log.js';

Meteor.methods({
	"ScoringTempTimerLog.norm"() {
		// this.unblock();

    let output = Meteor.wrapAsync((args, callback) => {
      
      let pipelineSUS = 
      [
				{
					$match: {
						checked: true,
						$or: [
							{ resultStage: 'Published' },
							{ resultStage: 'Exported' },
							{ resultStage: 'Distributed' }
						]
					}
				},
				{
					$lookup: {
						from: 'scoring-temp-timer-log',
						localField: 'assessmentId',
						foreignField: 'assessment_id',
						as: 'sttl' 
					}
				},
				{
					$unwind: "$sttl"
				},
				{
					$group: {
						_id: "$simulationId",
						pauseTimeRaw: {
							$addToSet: "$sttl.pause_time_raw"
						}
					}
				},
				{
					$sort: {
						"sttl.pause_time_raw": 1
					}
				} 
      ]
      
      let _sus = Promise.await(SimUsersSummary.rawCollection().aggregate(pipelineSUS).toArray());   

      callback(null, {success: true, data: _sus})

      

    })

    let result = output('dk')

    if(result) {
      return result
    }		
	}
});
