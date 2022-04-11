import gql from "graphql-tag";

export const GET_TASK_OVERVIEW = gql`
  query getTaskOverView {
    tasks: getTaskOverView {
      id
      title
      icon
      taskType
      dueDate
      active
      references {
        id
        type
      }
    }
  }
`;

export const UPDATE_TASK_MUTATION = gql`
  mutation updateTask($input: UpdateTaskInput!) {
    updateTask(input: $input)
  }
`;
