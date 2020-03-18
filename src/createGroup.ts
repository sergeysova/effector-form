import { createEvent, createStore, Event, Store, Unit } from 'effector';

export type GroupConfig = {
  name: string;
  initialValue?: string[] | Store<string[]>;
  reset?: Unit<void>;
  map?: (value: string[]) => string[];
  validator?: (value: string[]) => string | null;
};

export type GroupResult = {
  name: string;
  $value: Store<string[]>;
  $error: Store<string | null>;
  changed: Event<React.ChangeEvent<HTMLInputElement> | string[]>;
};

export function createGroup({
  name,
  initialValue = [],
  reset = createEvent(`${name}Reset`),
  map,
  validator,
}: GroupConfig): GroupResult {
  const changed = createEvent<React.ChangeEvent<HTMLInputElement> | string[]>(
    `${name}Changed`,
  );

  const $source = Array.isArray(initialValue)
    ? createStore(initialValue, { name: `${name}Store` })
    : initialValue;

  $source.on(reset, () => []);

  const $value = $source.map(map ? (value) => map(value) : (a) => a);
  const $error = $source.map(validator ?? (() => null));

  $source.on(changed, (state, payload) => {
    if (Array.isArray(payload)) return payload;

    const value = payload.currentTarget.value;
    const index = state.indexOf(value);

    if (index > -1) {
      return state.filter((selected) => selected !== value);
    }
    return [...state, value];
  });

  return { name, $value, $error, changed };
}