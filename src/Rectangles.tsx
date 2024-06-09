import Two from "two.js";
import Matter from "matter-js";
import { useEffect, useRef, useState } from "react";

let newCopy = "";
let initialized = false;

const entities: Matter.Body[] = [];
let mouse: Matter.MouseConstraint;

const two = new Two({
  type: Two.Types.canvas,
  fullscreen: true,
  autostart: true,
}).appendTo(document.body);

const engine = Matter.Engine.create();
engine.world.gravity.y = 0.6;

const bounds = {
  length: 5000,
  thickness: 50,
  properties: {
    isStatic: true,
  },
};

bounds.left = createBoundary(bounds.thickness, bounds.length);
bounds.right = createBoundary(bounds.thickness, bounds.length);
bounds.bottom = createBoundary(bounds.length, bounds.thickness);

Matter.Composite.add(engine.world, [
  bounds.left.entity,
  bounds.right.entity,
  bounds.bottom.entity,
]);

const defaultStyles = {
  size: two.width * 0.05,
  weight: 400,
  fill: "black",
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
mouse = addMouseInteraction();

two.bind("resize", resize).bind("update", update);

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

function resize() {
  const { length, thickness } = bounds;

  Matter.Body.setPosition(bounds.left.entity, {
    x: -thickness / 2,
    y: two.height / 2,
  });
  Matter.Body.setPosition(bounds.right.entity, {
    x: two.width + thickness / 2,
    y: two.height / 2,
  });
  Matter.Body.setPosition(bounds.bottom.entity, {
    x: two.width / 2,
    y: two.height + thickness / 2,
  });
}

function update() {
  const allBodies = Matter.Composite.allBodies(engine.world);
  Matter.MouseConstraint.update(mouse, allBodies);
  Matter.MouseConstraint._triggerEvents(mouse);

  Matter.Engine.update(engine);
  entities.forEach((entity) => {
    entity.object.position.copy(entity.position);
    entity.object.rotation = entity.angle;
  });
}

function createBoundary(width: number, height: number) {
  const rectangle = two.makeRectangle(0, 0, width, height);
  rectangle.visible = false;

  const entity = Matter.Bodies.rectangle(
    0,
    0,
    width,
    height,
    bounds.properties
  );
  entity.position = rectangle.position;
  rectangle.entity = entity;

  return rectangle;
}

interface Todo {
  id: number;
  text: string;
  done: boolean;
}

export const Rectangles = () => {
  const [inputValue, setInputValue] = useState("");
  const [todoData, setTodoData] = useState<Matter.Body[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const addEntities = ({
    toSave,
    texts,
    textFromMemory,
  }: {
    toSave: boolean;
    texts?: string[];
    textFromMemory?: string;
  }) => {
    const textsArray = texts || [textFromMemory || newCopy];
    let newTodoData = [];

    textsArray.forEach((newText) => {
      const allObjectForGroup = [];
      let x = defaultStyles.margin.left + Math.random() * 1000;
      let y = -two.height;

      const word = newText || newCopy;
      const group = new Two.Group();
      const text = new Two.Text(word, 0, 0, defaultStyles);

      const rect = text.getBoundingClientRect();
      rect.height += 30;
      rect.width += 20;

      let ox = x + rect.width / 2;
      let oy = y + rect.height / 2;

      if (ox + rect.width >= two.width) {
        x = defaultStyles.margin.left;
        y +=
          defaultStyles.leading +
          defaultStyles.margin.top +
          defaultStyles.margin.bottom;
        ox = x + rect.width / 2;
        oy = y + rect.height / 2;
      }

      group.translation.set(ox, oy);
      text.translation.y = 22;

      const rectangle = new Two.Rectangle(0, 0, rect.width, rect.height);
      rectangle.fill = getRandomColor();
      rectangle.noStroke();
      rectangle.opacity = 1;
      rectangle.visible = true;

      allObjectForGroup.push(rectangle);
      if (text.value.length >= 20) {
        const part1 = text.value.slice(0, 20);
        const part2 = text.value.slice(20);
        const text1 = new Two.Text(part1, 0, 0, defaultStyles);
        const text2 = new Two.Text(
          part2,
          0,
          text1.getBoundingClientRect().height + defaultStyles.leading,
          defaultStyles
        );
        allObjectForGroup.push(text1, text2);
        rect.height += 360;
      } else {
        allObjectForGroup.push(text);
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

      group.add(...allObjectForGroup);
      two.add(group);
      Matter.Composite.add(engine.world, [entity]);

      newTodoData.push(entity);
    });

    const dataToSave = [...todoData, ...newTodoData];
    console.log("dataToSave", dataToSave);
    setTodoData(dataToSave);

    if (toSave) {
      saveToLocalStorage(dataToSave);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setTimeout(() => {
          inputRef.current?.focus();
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

  const handleDelete = (body: Matter.Body) => {
    if (body) {
      Matter.Composite.remove(engine.world, body);
      setTimeout(() => {
        body.position = { x: -100000, y: -100000 };
      }, 100);
      const newEntits = todoData.filter((item) => item !== body);
      setTodoData(newEntits);
      saveToLocalStorage(newEntits);
      console.log(newEntits);
    }
  };

  const [lastTap, setLastTap] = useState(0);

  useEffect(() => {
    Matter.Events.on(mouse, "mousedown", () => {
      const currentTime = Date.now();
      const tapLength = currentTime - lastTap;
      if (tapLength < 300 && tapLength > 0) {
        handleDelete(mouse.body);
      }
      setLastTap(currentTime);
    });
  }, [lastTap]);

  // логика сохранения и загрузки
  const localStorageID = "your_data";

  const saveToLocalStorage = (data: Matter.Body[]) => {
    const entLabels = data.map((ent) => ent.label);
    console.log(data);
    localStorage.setItem(localStorageID, JSON.stringify(entLabels));
  };
  useEffect(() => {
    if (initialized) return;
    initialized = true;

    const labelsFromMemory = JSON.parse(
      localStorage.getItem(localStorageID) || "[]"
    );
    addEntities({ toSave: false, texts: labelsFromMemory });
  }, []);

  return (
    <div>
      <form onSubmit={(e) => e.preventDefault()}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <input
            className="input"
            onChange={(e) => setInputValue(e.target.value)}
            value={inputValue}
            autoFocus
            ref={inputRef}
          />
          <button
            className="knopka"
            style={{ marginLeft: "10px" }}
            onClick={() => {
              if (inputValue === "") return;
              newCopy = inputValue;
              addEntities({ toSave: true, textFromMemory: newCopy });
              setInputValue("");
            }}
          ></button>
        </div>
      </form>
      <div id="rectangles"></div>
    </div>
  );
};

function getRandomColor() {
  const colors = ["#7953F9", "#95CDFF", "#FFEB71", "#EB6348", "#A9D37A"];
  const randomIndex = Math.floor(Math.random() * colors.length);
  return colors[randomIndex];
}
