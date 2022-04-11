import { Workflow } from "../Workflow";

class WorkflowService {
  constructor({ accountId }) {
    this.accountId = accountId;
    this.workflow = {};
  }

  /**
   *
   * @param {{references?:any, type?: string, id?: string, workflow: any, data?: any}} param0
   * @returns
   */
  create({ references, type, id, workflow, data }) {
    const refs = references || { type, id };
    this.workflow = {
      accountId: this.accountId,
      references: refs,
      status: "waiting",
      name: workflow.name,
      schema: workflow.schema,
      data
    };
    return this;
  }

  store() {
    return Workflow.create_async(this.workflow);
  }
}

export { WorkflowService };
