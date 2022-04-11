import faker from "faker";
import moment from "moment";

function fakeDate() {
  return faker.date.between(
    moment().format("YYYY-MM-DD"),
    moment()
      .add(10, "days")
      .unix()
  );
}
export const taskMocks = [
  {
    id: faker.random.uuid(),
    title: "Sample approval",
    icon: "check square outline",
    taskType: "approval",
    dueDate: fakeDate(),
    active: true,
    __typename: "Task"
  },
  {
    id: faker.random.uuid(),
    title: "Sample manual task",
    icon: "hand paper outline",
    tasktype: "task",
    dueDate: fakeDate(),
    active: false,
    __typename: "Task"
  },
  {
    id: faker.random.uuid(),
    title: "Task test title",
    icon: "hand paper outline",
    type: "task",
    dueDate: fakeDate(),
    active: true,
    __typename: "Task"
  },
  {
    id: faker.random.uuid(),
    title: "Task test title",
    icon: "hand paper outline",
    type: "task",
    dueDate: fakeDate(),
    active: false,
    __typename: "Task"
  },
  {
    id: faker.random.uuid(),
    title: "Task test title",
    icon: "hand paper outline",
    type: "task",
    dueDate: fakeDate(),
    active: true,
    __typename: "Task"
  },
  {
    id: faker.random.uuid(),
    title: "Task test title",
    icon: "hand paper outline",
    type: "task",
    dueDate: fakeDate(),
    active: true,
    __typename: "Task"
  }
];
