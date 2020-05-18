import React, {
  useEffect,
  useRef,
  useReducer,
  useState,
  Fragment,
  memo,
} from "react";
import "./App.css";
import sortBy from "lodash/sortBy";

import { empty, oldWidth } from "./utils";
import { registerCustomEvents } from "./registerCustomEvent";

const initialState = {
  toRender: [],
  firstRender: [],
  buffer: [],
  show: false,
  more: false,
  itemsWidth: {},
};

const SET_TO_BUFFER = "SET_TO_BUFFER";
const DELETE_FROM_BUFFER = "DELETE_FROM_BUFFER";
const SET_TO_RENDER = "SET_TO_RENDER";
const DELETE_FROM_RENDER = "DELETE_FROM_RENDER";
const SET_FIRST_TO_RENDER = "SET_FIRST_TO_RENDER";
const SET_MORE = "SET_MORE";
const SET_SHOW = "SET_SHOW";
const SET_ITEM_WIDTH = "SET_ITEM_WIDTH";

function reducer(state, action) {
  switch (action.type) {
    case SET_MORE:
      return {
        ...state,
        more: action.payload.more,
      };

    case SET_SHOW:
      return {
        ...state,
        show: action.payload.show,
      };

    case SET_TO_BUFFER:
      return {
        ...state,
        buffer: sortBy([...state.buffer, action.payload.index]),
      };

    case DELETE_FROM_BUFFER: {
      const { index } = action.payload;

      const isDelete =
        !state.toRender.includes(index) && state.buffer.includes(index);

      return {
        ...state,
        buffer: isDelete
          ? sortBy(state.buffer.filter((predicate) => predicate !== index))
          : state.buffer,
        toRender: isDelete
          ? sortBy([...state.toRender, index])
          : state.toRender,
      };
    }

    case DELETE_FROM_RENDER: {
      const { index } = action.payload;

      const isDelete =
        !state.buffer.includes(index) && state.toRender.includes(index);

      return {
        ...state,
        toRender: isDelete
          ? sortBy(state.toRender.filter((predicate) => predicate !== index))
          : state.toRender,
        buffer: isDelete ? sortBy([...state.buffer, index]) : state.buffer,
      };
    }

    case SET_TO_RENDER:
      return {
        ...state,
        toRender: sortBy([...state.toRender, action.payload.index]),
      };

    case SET_FIRST_TO_RENDER:
      return {
        ...state,
        firstRender: sortBy(action.payload.items.map((_, index) => index)),
      };

    case SET_ITEM_WIDTH: {
      const { index, width } = action.payload;

      return {
        ...state,
        itemsWidth: {
          ...state.itemsWidth,
          [index]: width,
        },
      };
    }

    default:
      return state;
  }
}

const ContainerItem = memo(
  ({
    children,
    index,
    containerRef,
    containerState,
    dispatch,
    itemHide = false,
  }) => {
    const itemRef = useRef(null);

    useEffect(() => {
      const container = containerRef.current;
      const item = itemRef.current;

      if (container && item) {
        const itemWidth = item.offsetWidth;
        const containerWidth = container.offsetWidth;

        dispatch({
          type: SET_ITEM_WIDTH,
          payload: {
            index,
            width: itemWidth,
          },
        });

        if (index === 0 && empty.width === 0) {
          empty.width = containerWidth;
        }

        if (empty.width > itemWidth) {
          dispatch({
            type: SET_TO_RENDER,
            payload: {
              index,
              item,
            },
          });

          oldWidth.width = containerWidth;
          empty.width -= itemWidth;
        } else if (
          empty.width <= itemWidth &&
          !containerState.buffer.includes(index)
        ) {
          oldWidth.width = containerWidth;
          dispatch({
            type: SET_TO_BUFFER,
            payload: {
              index,
              item,
            },
          });
        }
      }
    }, [itemRef]);

    return (
      <div
        className={`containerItem ${itemHide ? "item-hide" : ""}`}
        ref={itemRef}
      >
        {children}
      </div>
    );
  }
);

const Container = ({ items }) => {
  const containerRef = useRef(null);
  const buttonRef = useRef(null);
  const [state, dispatch] = useReducer(reducer, initialState);
  // Copy constructor
  useState(() => {
    dispatch({
      type: SET_FIRST_TO_RENDER,
      payload: {
        items,
      },
    });
  });

  const { show, more, buffer, toRender, itemsWidth } = state;

  const toggleMore = () =>
    dispatch({
      type: SET_MORE,
      payload: { more: !more },
    });

  const setShow = (flag) =>
    dispatch({
      type: SET_SHOW,
      payload: { show: flag },
    });

  const textLess = "Show Less";
  const textMore = "Show More";

  const resizeHandler = () => {
    const container = containerRef.current;

    if (container) {
      const newContainerWidth = container.offsetWidth;

      if (newContainerWidth > oldWidth.width + itemsWidth[buffer[0]]) {
        const index = buffer[0];
        dispatch({
          type: DELETE_FROM_BUFFER,
          payload: {
            index,
            item: items[index],
          },
        });

        oldWidth.width = oldWidth.width + itemsWidth[index];
      } else if (
        newContainerWidth <= oldWidth.width &&
        newContainerWidth >= itemsWidth[toRender.length - 1]
      ) {
        const index = toRender.length - 1;

        dispatch({
          type: DELETE_FROM_RENDER,
          payload: {
            index,
            item: items[index],
          },
        });

        oldWidth.width = oldWidth.width - itemsWidth[index];
      }
    }
  };

  useEffect(() => {
    window.addEventListener("optimizedResize", resizeHandler);

    return () => {
      console.log("unMount");

      window.removeEventListener("optimizedResize", resizeHandler);
    };
  }, [itemsWidth, buffer]);

  useEffect(() => {
    return () => {
      console.log("unMount CONTAINER");
    };
  }, []);

  useEffect(() => {
    if (buttonRef.current && more) {
      buttonRef.current.focus();
    }
  }, [buttonRef, more]);

  useEffect(() => {
    if (buffer.length !== 0) {
      setShow(true);
    } else {
      setShow(false);
    }
  }, [buffer]);

  const button = (
    <button className="btn" ref={buttonRef} onClick={toggleMore}>
      {more ? textLess : textMore}
      <div className="icon">^</div>
    </button>
  );

  return (
    <div style={{ width: "100%", display: "flex" }}>
      <div className={`container ${more ? "more" : ""}`} ref={containerRef}>
        {items.map((item, index) => {
          return (
            <Fragment key={index}>
              <ContainerItem
                index={index}
                itemHide={buffer.includes(index) && !more}
                containerRef={containerRef}
                dispatch={dispatch}
                containerState={state}
              >
                <div style={{ position: "relative" }}>
                  {item}
                  {!more &&
                    show &&
                    toRender[toRender.length - 1] === index &&
                    button}
                </div>
              </ContainerItem>
            </Fragment>
          );
        })}

        {more && show && button}
      </div>

      {!more && <div style={{ minWidth: 100 }} />}
    </div>
  );
};

export default function App() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    registerCustomEvents();
  }, []);

  const items = Array.from({ length: 10 }).map((_, index) => (
    <div key={index} className={"item"}>
      item {index}
    </div>
  ));

  return (
    <div className={"App"}>
      <button onClick={() => setShow(!show)}>{show ? "hide" : "show"}</button>
      {show && <Container items={items} />}
    </div>
  );
}
