import Two from "two.js";
import Matter from "matter-js";
import { useEffect, useRef, useState } from "react";

const topConst = 50;
let newCopy = "";
let initialized = false;
const entities = [];
const vector = new Two.Vector();
let mouseConstraint;

const two = new Two({
  type: Two.Types.canvas,
  fullscreen: true,
  autostart: true,
}).appendTo(document.body);

const engine = Matter.Engine.create();
engine.world.gravity.y = 0.6;

const bounds = createBounds();

const defaultStyles = {
  size: two.width * 0.05,
  weight: 400,
  fill: "white",
  leading: two.width * 0.05 * 0.5,
  family: "Helvetica, Arial, sans-serif",
  alignment: "center",
  baseline: "baseline",
  margin: {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
};

resize();
mouseConstraint = addMouseInteraction();
two.bind("resize", resize).bind("update", update);

/**
 * Adds mouse interaction for the Matter.js engine.
 * @returns {Matter.MouseConstraint} The mouse constraint.
 */
function addMouseInteraction() {
  const mouse = Matter.Mouse.create(document.body);
  const mouseConstraint = Matter.MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
      stiffness: 0.2,
    },
  });

  Matter.Composite.add(engine.world, mouseConstraint);
  return mouseConstraint;
}

/**
 * Resizes the boundaries based on the canvas dimensions.
 */
function resize() {
  const length = bounds.length;
  const thickness = bounds.thickness;

  setPosition(bounds.left.entity, -thickness / 2, two.height / 2);
  setPosition(bounds.right.entity, two.width + thickness / 2, two.height / 2);
  setPosition(bounds.bottom.entity, two.width / 2, two.height + thickness / 2);
}

/**
 * Sets the position of a Matter.js body.
 * @param {Matter.Body} body The Matter.js body.
 * @param {number} x The x-coordinate.
 * @param {number} y The y-coordinate.
 */
function setPosition(body, x, y) {
  vector.set(x, y);
  Matter.Body.setPosition(body, vector);
}

/**
 * Creates the boundaries for the simulation.
 * @returns {object} The boundaries.
 */
function createBounds() {
  const length = 5000;
  const thickness = 50;
  const properties = { isStatic: true };

  const left = createBoundary(thickness, length);
  const right = createBoundary(thickness, length);
  const bottom = createBoundary(length, thickness);

  Matter.Composite.add(engine.world, [left.entity, right.entity, bottom.entity]);

  return { length, thickness, properties, left, right, bottom };
}

/**
 * Creates a boundary for the simulation.
 * @param {number} width The width of the boundary.
 * @param {number} height The height of the boundary.
 * @returns {object} The boundary.
 */
function createBoundary(width, height) {
  const rectangle = two.makeRectangle(0, 0, width, height);
  rectangle.visible = false;

  rectangle.entity = Matter.Bodies.rectangle(0, 0, width, height, bounds.properties);
  rectangle.entity.position = rectangle.position;

  return rectangle;
}

/**
 * Saves the entities to localStorage.
 * @param {Array} data The entities to save.
 */
const saveToLocalStorage = (data) => {
  const entityLabels = data.map(entity => entity.label);
  localStorage.setItem('entityLabels', JSON.stringify(entityLabels));
};

/**
 * Updates the simulation on each frame.
 * @param {number} frameCount The frame count.
 * @param {number} timeDelta The time delta.
 */
function update(frameCount, timeDelta) {
  const allBodies = Matter.Composite.allBodies(engine.world);
  Matter.MouseConstraint.update(mouseConstraint.mouse, allBodies);
  Matter.MouseConstraint._triggerEvents(mouseConstraint);

  Matter.Engine.update(engine);
  entities.forEach(entity => {
    entity.object.position.copy(entity.position);
    entity.object.rotation = entity.angle;
  });
}

/**
 * The main component for the rectangles.
 */
export const RectanglesGPTish = () => {
  const [inputValue, setInputValue] = useState("");
  const [entityList, setEntityList] = useState<Matter.Body[]>([]);
  const inputRef = useRef(null);
  const [lastTap, setLastTap] = useState(0);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setTimeout(() => {
          inputRef.current.focus();
        }, 10);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    Matter.Events.on(mouseConstraint, "mousedown", () => {
      const currentTime = Date.now();
      const tapLength = currentTime - lastTap;
      if (tapLength < 300 && tapLength > 0) {
        handleDelete(mouseConstraint.body);
      }
      setLastTap(currentTime);
    });
  }, [lastTap]);

  useEffect(() => {
    if (initialized) return;
    initialized = true;

    const labelsFromMemory = JSON.parse(localStorage.getItem('entityLabels') || '[]');
    labelsFromMemory.forEach(label => {
      addNewEntity(false, label);
    });
  }, []);

  const handleDelete = (body) => {
    if (body) {
      Matter.Composite.remove(engine.world, body);
      setTimeout(() => {
        body.position = { x: -100000, y: -100000 };
      }, 100);
      const newEntityList = entityList.filter(item => item !== body);
      saveToLocalStorage(newEntityList);
      setEntityList(newEntityList);
    }
  };

  const addNewEntity = (toSave, textFromMemory) => {
    console.log('new entity');
    const allObjectsForGroup = [];
    let x = defaultStyles.margin.left + Math.floor(Math.random() * 1000);
    let y = -two.height;

    const word = textFromMemory || newCopy;
    const group = new Two.Group();
    const text = new Two.Text("", 0, 0, defaultStyles);

    group.isWord = true;
    text.value = word;

    const rect = text.getBoundingClientRect();
    rect.height += 30;
    rect.width += 20;

    const ox = x + rect.width / 2;
    const oy = y + rect.height / 2;
    if (x + rect.width >= two.width) {
      x = defaultStyles.margin.left;
      y += defaultStyles.leading + defaultStyles.margin.top + defaultStyles.margin.bottom;
    }

    group.translation.set(ox, oy);
    text.translation.y = 22;

    const rectangle = new Two.Rectangle(0, 0, rect.width, rect.height);
    rectangle.fill = getRandomColor();
    rectangle.noStroke();
    rectangle.opacity = 1;
    rectangle.visible = true;

    allObjectsForGroup.push(rectangle);

    if (text.value.length >= 20) {
      const part1 = text.value.slice(0, 20);
      const part2 = text.value.slice(20);
      const text1 = new Two.Text(part1, 0, 0, defaultStyles);
      const text2 = new Two.Text(part2, 0, text1.getBoundingClientRect().height + defaultStyles.leading, defaultStyles);
      allObjectsForGroup.push(text1, text2);
      rect.height += 360;
    } else {
      allObjectsForGroup.push(text);
    }

    const entity = Matter.Bodies.rectangle(ox, oy, 1, 1);
    Matter.Body.scale(entity, rect.width, rect.height);

    entity.scale = new Two.Vector(rect.width, rect.height);
    entity.object = group;
    entity.label = text.value;

    x += rect.width + defaultStyles.margin.left + defaultStyles.margin.right;

    group.text = text;
    group.rectangle = rectangle;
    group.entity = entity;
    entities.push(entity);

    group.add(...allObjectsForGroup);
    two.add(group);

    Matter.Composite.add(engine.world, [entity]);
    const newEntities = [...entityList, entity];
    setEntityList(newEntities);
    if (toSave) {
      saveToLocalStorage(newEntities);
    }
  };

  const getRandomColor = () => {
    const colors = ["#7953F9", "#95CDFF", "#FFEB71", "#EB6348", "#A9D37A"];
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
  };

  return (
    <div>
      <form onSubmit={(e) => e.preventDefault()}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <input
            className="input"
            onChange={(e) => setInputValue(e.target.value)}
            value={inputValue}
            autoFocus
            ref={inputRef}
          />
          <button
            className="button"
            style={{ marginLeft: "10px" }}
            onClick={() => {
              if (inputValue === "") return;
              newCopy = inputValue;
              addNewEntity(true);
              setInputValue("");
            }}
          >
            Add
          </button>
        </div>
      </form>
      <div id="rectangles"></div>
    </div>
  );
};
