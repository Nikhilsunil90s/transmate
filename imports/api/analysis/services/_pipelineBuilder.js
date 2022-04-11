import { Analysis } from "../Analysis";

export const pipelineBuilder = () => ({
  pipeline: [],

  getRootDoc({ query }) {
    this.pipeline = [
      ...this.pipeline,
      { $match: query },
      { $addFields: { id: "$_id" } }
    ];
    return this;
  },
  getSimulation({ fields }) {
    this.pipeline = [
      ...this.pipeline,
      {
        $lookup: {
          from: "analysis.simulationV2",
          let: { analysisId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$$analysisId", "$analysisId"] } } },
            ...(fields ? [{ $project: fields }] : [])
          ],
          as: "simulation"
        }
      },
      { $unwind: { path: "$simulation", preserveNullAndEmptyArrays: true } },
      { $addFields: { "simulation.id": "$simulation._id" } }
    ];
    return this;
  },
  getSwitchPoint({ fields }) {
    this.pipeline = [
      ...this.pipeline,

      {
        $lookup: {
          from: "analysis.switchPoint",
          let: { analysisId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$$analysisId", "$analysisId"] } } },
            ...(fields ? [{ $project: fields }] : [])
          ],
          as: "switchPoint"
        }
      },
      { $unwind: { path: "$switchPoint", preserveNullAndEmptyArrays: true } },
      { $addFields: { "switchPoint.id": "$switchPoint._id" } }
    ];
    return this;
  },
  projectName() {
    this.pipeline = [
      ...this.pipeline,
      {
        $addFields: {
          name: {
            $ifNull: [
              "$simulation.name",
              { $ifNull: ["$switchPoint.name", "$name"] }
            ]
          }
        }
      }
    ];
    return this;
  },
  addStages(stages = []) {
    this.pipeline = [...this.pipeline, ...stages];
    return this;
  },
  async aggregate(debug) {
    if (debug) console.log(JSON.stringify(this.pipeline));
    const res = await Analysis._collection.aggregate(this.pipeline);
    return res;
  }
});
