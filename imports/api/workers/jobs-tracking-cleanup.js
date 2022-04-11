// Meteor.startup(function() {});

// TODO [#157]: re-activate when tracking is activated
/*
new Job( TrackingJobs, 'cleanup', {} )
	.repeat( schedule: TrackingJobs.later.parse.text 'every 10 hours' )
	.save( cancelRepeats: true )

TrackingJobs.processJobs 'cleanup',
	pollInterval: 1000*60*60 # every hour
	workTimeout: 15*1000
	( job, callback ) ->
		ids = TrackingJobs.find(
			status: $in: Job.jobStatusRemovable
			updated: $lt: moment().subtract( 1, 'month' ).toDate()
		,
			fields: _id: 1
		).map ({ _id }) -> _id

		if ids.length
			TrackingJobs.removeJobs( ids )

		job.done "#{ids.length} jobs removed"
		callback()
*/
