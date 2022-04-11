/* eslint-disable no-use-before-define */
import { createWorkflow } from "/imports/api/bpmn-workflows/services/mutation.createWorkflow";

const getCustomWorkflow = () => {
  return simpleWorkflow;
};

/**
 * starts a workflow with parameters
 * @param {Object} obj
 * @param {String} obj.event origin of the trigger, used to select workflow template
 * @param {String} obj.initiatorId originating account, used to select workflow template
 * @param {String} obj.accountId account on which the workflow will be applied
 * @param {Object} obj.data relevant data for the workflow
 * @param {Array[String]} obj.data.userIds userIds of context
 * @param {Date} obj.data.dueDate workflow dueDate
 * @param {Object} obj.references link to origin context
 * @param {String} obj.references.type type [priceRequest, tender, tenderBid,...]
 * @param {String} obj.references.id document id
 */
export const startWorkflow = ({ accountId, userId }) => ({
  accountId,
  userId,
  async start({
    event,
    initiatorId,
    accountId: referencedAccountId,
    data,
    references
  }) {
    // TODO [#243]: user event & initiatorId to get custom workflow
    const workflow = getCustomWorkflow({ event, accountId: initiatorId });

    await createWorkflow({
      accountId: this.accountId
    }).create({
      references,
      workflow,
      data: { ...data, event },
      accountId: referencedAccountId
    });
    return true;
  }
});

const simpleWorkflow = {
  name: "Manual task",
  schema: `
<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xmlns:camunda="http://camunda.org/schema/1.0/bpmn" id="Definitions_1onqrs5" targetNamespace="http://bpmn.io/schema/bpmn" exporter="Camunda Modeler" exporterVersion="3.7.1">
  <bpmn:process id="SimpleTask" name="Assign manual task" isExecutable="true" camunda:candidateStarterGroups="candidate_groups" camunda:candidateStarterUsers="candidate_users" camunda:versionTag="1">
    <bpmn:startEvent id="StartEvent_1">
      <bpmn:outgoing>SequenceFlow_0h0qqqx</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:sequenceFlow id="SequenceFlow_0h0qqqx" sourceRef="StartEvent_1" targetRef="task" />
    <bpmn:endEvent id="EndEvent_176293l">
      <bpmn:incoming>SequenceFlow_00n8ya4</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="SequenceFlow_00n8ya4" sourceRef="task" targetRef="EndEvent_176293l" />
    <bpmn:userTask id="manualTask" name="perform task">
      <bpmn:extensionElements>
        <camunda:properties>
          <camunda:property />
        </camunda:properties>
        <camunda:inputOutput>
          <camunda:inputParameter name="userIds">
            <camunda:list />
          </camunda:inputParameter>
          <camunda:inputParameter name="groupId">
            <camunda:list />
          </camunda:inputParameter>
        </camunda:inputOutput>
      </bpmn:extensionElements>
      <bpmn:incoming>SequenceFlow_0h0qqqx</bpmn:incoming>
      <bpmn:outgoing>SequenceFlow_00n8ya4</bpmn:outgoing>
    </bpmn:userTask>
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="SimpleTask">
      <bpmndi:BPMNEdge id="SequenceFlow_00n8ya4_di" bpmnElement="SequenceFlow_00n8ya4">
        <di:waypoint x="410" y="117" />
        <di:waypoint x="642" y="117" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="SequenceFlow_0h0qqqx_di" bpmnElement="SequenceFlow_0h0qqqx">
        <di:waypoint x="215" y="117" />
        <di:waypoint x="310" y="117" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">
        <dc:Bounds x="179" y="99" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="EndEvent_176293l_di" bpmnElement="EndEvent_176293l">
        <dc:Bounds x="642" y="99" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="UserTask_0cvubb2_di" bpmnElement="task">
        <dc:Bounds x="310" y="77" width="100" height="80" />
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>
`
};
