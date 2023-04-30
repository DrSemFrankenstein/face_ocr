import { makeAutoObservable, autorun } from "mobx";
import { createContext } from "react";

class ObjectStore {
  object = { imgFile: {} };

  constructor() {
    makeAutoObservable(this);

    // autorun(() => {
    //   console.log("Object changed:", this.object);
    // });
  }

  setObject(newObject) {
    this.object = newObject;
  }

  getObject() {
    return this.object;
  }

  addObjectProperty(path, value) {
    const keys = path.split(".");
    let obj = this.object;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in obj)) {
        obj[key] = {};
      }
      obj = obj[key];
    }

    const lastKey = keys[keys.length - 1];
    obj[lastKey] = value;
  }

  updateObjectProperty(path, value) {
    const keys = path.split(".");
    let obj = this.object;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      obj = obj[key];
    }

    const lastKey = keys[keys.length - 1];
    obj[lastKey] = value;
  }

  removeObjectProperty(path) {
    const keys = path.split(".");
    let obj = this.object;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      obj = obj[key];
    }

    const lastKey = keys[keys.length - 1];
    delete obj[lastKey];
  }

  getObjectProperty(path) {
    const keys = path.split(".");
    let obj = this.object;

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      obj = obj[key];
      if (!obj) {
        break;
      }
    }

    return obj;
  }
}

const objectStore = new ObjectStore();
export const ObjectContext = createContext(objectStore);

export default objectStore;
