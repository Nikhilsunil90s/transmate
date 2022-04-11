import React from "react";

import {
  actions,
  makePropGetter,
  ensurePluginOrder,
  useGetLatest,
  useMountedLayoutEffect
} from "react-table";

const pluginName = "useRowSelect";

// Actions
actions.resetSelectedRows = "resetSelectedRows";
actions.toggleAllRowsSelected = "toggleAllRowsSelected";
actions.toggleRowSelected = "toggleRowSelected";

const IndeterminateCheckbox = React.forwardRef(
  ({ indeterminate, onChange, ...rest }, ref) => {
    const defaultRef = React.useRef();
    const resolvedRef = ref || defaultRef;

    React.useEffect(() => {
      resolvedRef.current.indeterminate = indeterminate;
    }, [resolvedRef, indeterminate]);

    function handleChange(event) {
      event.stopPropagation();
      onChange(event);
    }

    return (
      <div
        role="button"
        tabIndex="0"
        onKeyDown={event => event.stopPropagation()}
        onClick={event => event.stopPropagation()}
      >
        <input
          type="checkbox"
          ref={resolvedRef}
          onChange={handleChange}
          {...rest}
        />
      </div>
    );
  }
);

const defaultGetToggleRowSelectedProps = (props, { instance, row }) => {
  const { manualRowSelectedKey = "isSelected" } = instance;
  let checked = false;

  if (row.original && row.original[manualRowSelectedKey]) {
    checked = true;
  } else {
    checked = row.isSelected;
  }

  return [
    props,
    {
      onChange: e => {
        row.toggleRowSelected(e.target.checked);
      },
      style: {
        cursor: "pointer"
      },
      checked,
      title: "Toggle Row Selected",
      indeterminate: row.isSomeSelected
    }
  ];
};

const defaultGetToggleAllRowsSelectedProps = (props, { instance }) => [
  props,
  {
    onChange: e => {
      instance.toggleAllRowsSelected(e.target.checked);
    },
    style: {
      cursor: "pointer"
    },
    checked: instance.isAllRowsSelected,
    title: "Toggle All Rows Selected",
    indeterminate: Boolean(
      !instance.isAllRowsSelected &&
        Object.keys(instance.state.selectedRowIds).length
    )
  }
];

function getRowIsSelected(row, selectedRowIds) {
  if (selectedRowIds[row.id]) {
    return true;
  }

  if (row.subRows && row.subRows.length) {
    let allChildrenSelected = true;
    let someSelected = false;

    row.subRows.forEach(subRow => {
      // Bail out early if we know both of these
      if (someSelected && !allChildrenSelected) {
        return;
      }

      if (getRowIsSelected(subRow, selectedRowIds)) {
        someSelected = true;
      } else {
        allChildrenSelected = false;
      }
    });
    // eslint-disable-next-line no-nested-ternary
    return allChildrenSelected ? true : someSelected ? null : false;
  }

  return false;
}

function reducer(state, action, previousState, instance) {
  if (action.type === actions.init) {
    return {
      selectedRowIds: {},
      ...state
    };
  }

  if (action.type === actions.resetSelectedRows) {
    return {
      ...state,
      selectedRowIds: instance.initialState.selectedRowIds || {}
    };
  }

  if (action.type === actions.toggleAllRowsSelected) {
    const { value: setSelected } = action;
    const {
      isAllRowsSelected,
      rowsById,
      nonGroupedRowsById = rowsById
    } = instance;

    const selectAll =
      typeof setSelected !== "undefined" ? setSelected : !isAllRowsSelected;

    // Only remove/add the rows that are visible on the screen
    //  Leave all the other rows that are selected alone.
    const selectedRowIds = { ...state.selectedRowIds };

    if (selectAll) {
      Object.keys(nonGroupedRowsById).forEach(rowId => {
        selectedRowIds[rowId] = true;
      });
    } else {
      Object.keys(nonGroupedRowsById).forEach(rowId => {
        delete selectedRowIds[rowId];
      });
    }

    return {
      ...state,
      selectedRowIds
    };
  }

  if (action.type === actions.toggleRowSelected) {
    const { id, value: setSelected } = action;
    const { rowsById, selectSubRows = true } = instance;

    // Join the ids of deep rows
    // to make a key, then manage all of the keys
    // in a flat object
    const row = rowsById[id];
    const { isSelected } = row;
    const shouldExist =
      typeof setSelected !== "undefined" ? setSelected : !isSelected;

    if (isSelected === shouldExist) {
      return state;
    }

    const newSelectedRowIds = { ...state.selectedRowIds };

    const handleRowById = selectedId => {
      const selectedRow = rowsById[selectedId];

      if (!selectedRow.isGrouped) {
        if (shouldExist) {
          newSelectedRowIds[selectedId] = true;
        } else {
          delete newSelectedRowIds[selectedId];
        }
      }

      if (selectSubRows && selectedRow.subRows) {
        return selectedRow.subRows.forEach(subRow => handleRowById(subRow.id));
      }
      return undefined;
    };

    handleRowById(id);

    return {
      ...state,
      selectedRowIds: newSelectedRowIds
    };
  }
  return null;
}

function useInstance(instance) {
  const {
    data,
    rows,
    getHooks,
    plugins,
    rowsById,
    nonGroupedRowsById = rowsById,
    autoResetSelectedRows = true,
    state: { selectedRowIds },
    selectSubRows = true,
    dispatch
  } = instance;

  ensurePluginOrder(
    plugins,
    ["useFilters", "useGroupBy", "useSortBy"],
    "useRowSelect"
  );

  const selectedFlatRows = React.useMemo(() => {
    const flatRowsArray = [];

    rows.forEach(row => {
      const isSelected = selectSubRows
        ? getRowIsSelected(row, selectedRowIds)
        : !!selectedRowIds[row.id];
      row.isSelected = !!isSelected;
      row.isSomeSelected = isSelected === null;

      if (isSelected) {
        flatRowsArray.push(row);
      }
    });

    return flatRowsArray;
  }, [rows, selectSubRows, selectedRowIds]);

  let isAllRowsSelected = Boolean(
    Object.keys(nonGroupedRowsById).length && Object.keys(selectedRowIds).length
  );

  if (isAllRowsSelected) {
    if (Object.keys(nonGroupedRowsById).some(id => !selectedRowIds[id])) {
      isAllRowsSelected = false;
    }
  }

  const getAutoResetSelectedRows = useGetLatest(autoResetSelectedRows);

  useMountedLayoutEffect(() => {
    if (getAutoResetSelectedRows()) {
      dispatch({ type: actions.resetSelectedRows });
    }
  }, [dispatch, data]);

  const toggleAllRowsSelected = React.useCallback(
    value => dispatch({ type: actions.toggleAllRowsSelected, value }),
    [dispatch]
  );

  const toggleRowSelected = React.useCallback(
    (id, value) => dispatch({ type: actions.toggleRowSelected, id, value }),
    [dispatch]
  );

  const getInstance = useGetLatest(instance);

  const getToggleAllRowsSelectedProps = makePropGetter(
    getHooks().getToggleAllRowsSelectedProps,
    { instance: getInstance() }
  );

  Object.assign(instance, {
    selectedFlatRows,
    isAllRowsSelected,
    toggleRowSelected,
    toggleAllRowsSelected,
    getToggleAllRowsSelectedProps
  });
}

function prepareRow(row, { instance }) {
  row.toggleRowSelected = set => instance.toggleRowSelected(row.id, set);

  row.getToggleRowSelectedProps = makePropGetter(
    instance.getHooks().getToggleRowSelectedProps,
    { instance, row }
  );
}

const useSelectable = hooks => {
  hooks.visibleColumns.push(columns => {
    return [
      {
        id: "selection",
        groupByBoundary: true,
        Header: ({ getToggleAllRowsSelectedProps }) => (
          <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
        ),
        Cell: ({ row }) => (
          <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
        )
      },
      ...columns
    ];
  });

  hooks.getToggleRowSelectedProps = [defaultGetToggleRowSelectedProps];
  hooks.getToggleAllRowsSelectedProps = [defaultGetToggleAllRowsSelectedProps];
  hooks.stateReducers.push(reducer);
  hooks.useInstance.push(useInstance);
  hooks.prepareRow.push(prepareRow);
};

useSelectable.pluginName = pluginName;

export default useSelectable;
