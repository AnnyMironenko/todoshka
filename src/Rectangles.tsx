import Two from "two.js";
import Matter from "matter-js";
import { useEffect, useRef, useState } from "react";

const topConst = 50;
let newCopy = "";
let inited = false;

const entities: unknown = [];

const vector = new Two.Vector();
let mouse: unknown;

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

// bounds.top = createBoundary(bounds.length, bounds.thickness);
bounds.left = createBoundary(bounds.thickness, bounds.length);
bounds.right = createBoundary(bounds.thickness, bounds.length);
bounds.bottom = createBoundary(bounds.length, bounds.thickness);

Matter.Composite.add(engine.world, [
  /*bounds.top.entity,*/ bounds.left.entity,
  bounds.right.entity,
  bounds.bottom.entity,
]);

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

// addSlogan();
resize();
mouse = addMouseInteraction();

two.bind("resize", resize).bind("update", update);

function addMouseInteraction() {
  // add mouse control
  var mouse = Matter.Mouse.create(document.body);
  var mouseConstraint = Matter.MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
      stiffness: 0.2,
    },
  });

  Matter.Composite.add(engine.world, mouseConstraint);

  return mouseConstraint;
}

function resize() {
  var length = bounds.length;
  var thickness = bounds.thickness;

  // vector.x = two.width / 2;
  // vector.y = - thickness / 2;
  // Matter.Body.setPosition(bounds.top.entity, vector);

  vector.x = -thickness / 2;
  vector.y = two.height / 2;
  Matter.Body.setPosition(bounds.left.entity, vector);

  vector.x = two.width + thickness / 2;
  vector.y = two.height / 2;
  Matter.Body.setPosition(bounds.right.entity, vector);

  vector.x = two.width / 2;
  vector.y = two.height + thickness / 2;
  Matter.Body.setPosition(bounds.bottom.entity, vector);

  var size;

  // if (two.width < 480) {
  //   size = two.width * 0.12;
  // } else if (two.width > 1080 && two.width < 1600) {
  //   size = two.width * 0.07;
  // } else if (two.width > 1600) {
  //   size = two.width * 0.06;
  // } else {
  //   size = two.width * 0.08;
  // }

  // const getRandomConst = () => Math.floor(Math.random() * 50);
  // if (two.width < 480) {
  //   size = two.width * 0.12 + getRandomConst();
  // } else if (two.width > 1080 && two.width < 1600) {
  //   size = two.width * 0.07 + getRandomConst();
  // } else if (two.width > 1600) {
  //   size = two.width * 0.06 + getRandomConst();
  // } else {
  //   size = two.width * 0.08 + getRandomConst();
  // }

  // var leading = size * 0.8;

  // for (var i = 0; i < two.scene.children.length; i++) {
  //   var child = two.scene.children[i];

  //   if (!child.isWord) {
  //     continue;
  //   }

  //   var text = child.text;
  //   var rectangle = child.rectangle;
  //   var entity = child.entity;

  //   text.size = size;
  //   text.leading = leading;

  //   var rect = text.getBoundingClientRect(true);
  //   rectangle.width = rect.width;
  //   rectangle.height = rect.height;

  //   Matter.Body.scale(entity, 1 / entity.scale.x, 1 / entity.scale.y);
  //   Matter.Body.scale(entity, rect.width, rect.height);
  //   entity.scale.set(rect.width, rect.height);

  //   text.size = size / 3;
  // }
}

const saveToLS = (data) => {
  const entLabels = data.map((ent) => {
    return ent.label;
  });

  localStorage.setItem("entLabels", JSON.stringify(entLabels));
};

const mouseConstraint = Matter.MouseConstraint.create(engine, {
  element: document.body,
});

//удаление помышки

function update(frameCount, timeDelta) {
  var allBodies = Matter.Composite.allBodies(engine.world);
  Matter.MouseConstraint.update(mouse, allBodies);
  Matter.MouseConstraint._triggerEvents(mouse);

  Matter.Engine.update(engine);
  for (var i = 0; i < entities.length; i++) {
    var entity = entities[i];
    entity.object.position.copy(entity.position);
    entity.object.rotation = entity.angle;
  }
}

function createBoundary(width, height) {
  var rectangle = two.makeRectangle(0, 0, width, height);
  rectangle.visible = false;

  rectangle.entity = Matter.Bodies.rectangle(
    0,
    0,
    width,
    height,
    bounds.properties
  );
  rectangle.entity.position = rectangle.position;

  return rectangle;
}

//
interface Todo {
  id: number;
  text: string;
  done: boolean;
}

// dvizok ^^^^
// component here
export const Rectangles = () => {
  const [inputValue, setInputValue] = useState("");
  const [entits, setEntits] = useState<Matter.Body[]>([]);

  function addNewEntitity(toSave: boolean, textFromMemory?: string) {
    console.log("new entits");
    const allObjectForGroup = [];
    let x = defaultStyles.margin.left + Math.floor(Math.random() * 1000);
    let y = -two.height; // Header offset

    const word = textFromMemory || newCopy;
    const group = new Two.Group();
    const text = new Two.Text("", 0, 0, defaultStyles);

    group.isWord = true;

    // Override default styles
    if (word.value) {
      text.value = word.value;

      for (var prop in word.styles) {
        text[prop] = word.styles[prop];
      }
    } else {
      text.value = word;
    }

    console.log(text);
    //Тут размер фигуры и отсутпы
    var rect = text.getBoundingClientRect();

    rect.height = rect.height + 30;
    rect.width = rect.width + 20;
    // Math.floor(Math.random() * 50);

    var ox = x + rect.width / 2;
    var oy = y + rect.height / 2;

    var ca = x + rect.width;
    var cb = two.width;

    // New line
    if (ca >= cb) {
      x = defaultStyles.margin.left;
      y +=
        defaultStyles.leading +
        defaultStyles.margin.top +
        defaultStyles.margin.bottom;

      ox = x + rect.width / 2;
      oy = y + rect.height / 2;
    }

    group.translation.x = ox;
    group.translation.y = oy;
    // центрирование шрифта
    text.translation.y = 22;

    const rectangle = new Two.Rectangle(0, 0, rect.width, rect.height);
    const colors = ["#7953F9", "#95CDFF", "#FFEB71", "#EB6348", "#A9D37A"];

    function getRandomColor() {
      const randomIndex = Math.floor(Math.random() * colors.length);
      return colors[randomIndex];
    }

    // Установка случайного цвета для заливки прямоугольника
    rectangle.fill = getRandomColor();
    rectangle.noStroke();
    rectangle.opacity = 1;
    rectangle.visible = true;

    allObjectForGroup.push(rectangle);
    const textLength = text.value.length;

    if (textLength >= 20) {
      const part1 = text.value.slice(0, 20);
      const part2 = text.value.slice(20);
      console.log(part1, part2);
      const text1 = new Two.Text(part1, 0, 0, defaultStyles);
      const text2 = new Two.Text(
        part2,
        0,
        text1.getBoundingClientRect().height + defaultStyles.leading,
        defaultStyles
      );
      allObjectForGroup.push(text1, text2);
      rect.height = rect.height + 360;
    } else {
      allObjectForGroup.push(text);
    }

    var entity = Matter.Bodies.rectangle(ox, oy, 1, 1);
    Matter.Body.scale(entity, rect.width, rect.height);

    entity.scale = new Two.Vector(rect.width, rect.height);
    entity.object = group;
    entity.label = text.value;

    x += rect.width + defaultStyles.margin.left + defaultStyles.margin.right;

    group.text = text;
    group.rectangle = rectangle;
    group.entity = entity;
    entities.push(entity);

    // const text1 = new Two.Text('hello', 0, 0, defaultStyles);
    // const text2 = new Two.Text('there', 0, text1.getBoundingClientRect().height + defaultStyles.leading, defaultStyles);

    group.add(...allObjectForGroup);

    //group.add(rectangle, text);
    two.add(group);

    Matter.Composite.add(engine.world, [entity]);
    const newEntities = [...entits, entity];
    setEntits(newEntities);
    console.log(newEntities);
    if (toSave) {
      saveToLS(newEntities);
    }
  }

  //фокус импута
  const inputRef = useRef(null);
  useEffect(() => {
    // Функция для проверки, находится ли кликнутый элемент вне рефа
    function handleClickOutside(event) {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setTimeout(() => {
          inputRef.current.focus();
        }, 10); // Задержка в 10 миллисекунд
      }
    }

    // Добавляем обработчики событий на документ
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      // Удаляем обработчики при размонтировании компонента
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
      const newEntits = entits.filter((item) => item !== body);
      // setEntits(newEntits);
      console.log(entits);
      saveToLS(newEntits);
      // const ent = getEntitites();
      // entities = ent.filter((item) => item !== body);
    }
  };

  function getRandomNumber() {
    return Math.floor(Math.random() * 361); // 361, потому что Math.random() не включает верхнюю границу
  }

  const [lastTap, setLastTap] = useState(0);

  useEffect(() => {
    Matter.Events.on(mouseConstraint, "mousedown", () => {
      const currentTime = Date.now();
      const tapLength = currentTime - lastTap;
      if (tapLength < 300 && tapLength > 0) {
        // 300ms threshold for double tap
        handleDelete(mouseConstraint.body);
      }
      setLastTap(currentTime);
    });
  }, [lastTap]);

  useEffect(() => {
    console.log(inited);
    if (inited) return;
    inited = true;

    console.log("mmm");
    const lsString = localStorage.getItem("entLabels") || "[]";
    const labelsFromMemory = JSON.parse(lsString);
    console.log(labelsFromMemory);
    labelsFromMemory.forEach((label) => {
      addNewEntitity(false, label);
    });
  }, [inited]);

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
            style={{ marginLeft: "10px" }} // Add some space between the input and the button
            onClick={() => {
              if (inputValue === "") return;
              newCopy = inputValue;
              addNewEntitity(true);
              setInputValue("");
            }}
          ></button>
        </div>
      </form>
      <div id="rectangles"></div>
    </div>
  );
};

// ДВИЖОК ТУТ )))
