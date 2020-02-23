import { get } from "svelte/store";
import sut from "../src/storez";

describe("'Set' method unit test suite", () => {
  it("Should save the string value on set", () => {
    const store = sut("intialValue");
    store.set("changed value");
    expect(get(store)).toEqual("changed value");
  });

  it("Should save the object value on set", () => {
    const store = sut({ name: "initial" });
    store.set({ name: "changed" });
    expect(get(store).name).toEqual("changed");
  });

  it("Should save the array value on set", () => {
    const store = sut([1, 2, 3, 4]);
    store.set([1, 2, 3]);
    expect(get(store)).toEqual([1, 2, 3]);
  });

  it("Should save the value on multiple stores", () => {
    const store1 = sut("coucou");
    const store2 = sut([1, 2, 3]);
    store1.set("coucouChanged");
    store2.set([3, 2, 1]);
    expect(get(store1)).toEqual("coucouChanged");
    expect(get(store2)).toEqual([3, 2, 1]);
  });
});

describe("'Update' method unit test suite", () => {
  it("Should save the string value on update", () => {
    const store = sut("intialValue");
    store.update(n => n + "Changed");
    expect(get(store)).toEqual("intialValueChanged");
  });

  it("Should save the object value on update", () => {
    const store = sut({ name: "initial" });
    store.update(n => {
      n.name += "Changed";
      return n;
    });
    expect(get(store).name).toEqual("initialChanged");
  });

  it("Should save the array value on update", () => {
    const initial = [1, 2, 3];
    const store = sut(initial);
    store.update(n => n.concat(4));
    expect(get(store)).toEqual(initial.concat(4));
  });
});

describe("'Subscribe' method unit test suite", () => {
  it("Should call the subscription with old and new value on set", () => {
    const store = sut("initialValue");
    const spy = jest.fn();

    store.subscribe(spy);
    store.set("changedValue");

    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.mock.calls[0][0]).toEqual("initialValue");
    expect(spy.mock.calls[0][1]).not.toBeDefined();
    expect(spy.mock.calls[1][0]).toEqual("changedValue");
    expect(spy.mock.calls[1][1]).toEqual("initialValue");
  });

  it("Should call the subscription with old and new value on update", () => {
    const store = sut("initialValue");
    const spy = jest.fn();

    store.subscribe(spy);
    store.update(n => n + "Changed");

    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.mock.calls[0][0]).toEqual("initialValue");
    expect(spy.mock.calls[0][1]).not.toBeDefined();
    expect(spy.mock.calls[1][0]).toEqual("initialValueChanged");
    expect(spy.mock.calls[1][1]).toEqual("initialValue");
  });

  it("Should work with objects", () => {
    const store = sut({ name: "initial" });
    const spy = jest.fn();

    store.subscribe(spy);
    store.set({ name: "changed" });

    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.mock.calls[0][0]).toEqual({ name: "initial" });
    expect(spy.mock.calls[0][1]).not.toBeDefined();
    expect(spy.mock.calls[1][0]).toEqual({ name: "changed" });
    expect(spy.mock.calls[1][1]).toEqual({ name: "initial" });
  });

  it("Should work with arrays", () => {
    const initial = [1, 2, 3];
    const changed = [3, 2, 1];
    const store = sut(initial);
    const spy = jest.fn();

    store.subscribe(spy);
    store.set(changed);

    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.mock.calls[0][0]).toEqual(initial);
    expect(spy.mock.calls[0][1]).not.toBeDefined();
    expect(spy.mock.calls[1][0]).toEqual(changed);
    expect(spy.mock.calls[1][1]).toEqual(initial);
  });

  it("Should unsubscribe correctly", () => {
    const store = sut("initialValue");
    const spy = jest.fn();

    const unsubscribe = store.subscribe(spy);
    store.set("changedValue");
    unsubscribe();
    store.set("changedAgainValue");

    expect(spy).toHaveBeenCalledTimes(2);
  });

  it("Should work with multiple subscriptions", () => {
    const store = sut("initialValue");
    const spy1 = jest.fn();
    const spy2 = jest.fn();

    const unsubscribe1 = store.subscribe(spy1);
    store.subscribe(spy2);
    store.set("changed");
    unsubscribe1();
    store.set("changedAgainValue");
    expect(spy1.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          "initialValue",
        ],
        Array [
          "changed",
          "initialValue",
        ],
      ]
    `);
    expect(spy2.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          "initialValue",
        ],
        Array [
          "changed",
          "initialValue",
        ],
        Array [
          "changedAgainValue",
          "changed",
        ],
      ]
    `);
  });
});
