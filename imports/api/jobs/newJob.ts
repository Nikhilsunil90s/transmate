import { BullJob } from "./BullJobs";
import JobCollection from "./JobCollection";

const newJob = (collection: JobCollection, name: string, data: any) => {
  return new BullJob(collection, name, data);
};

export default newJob;
