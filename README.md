# pubhop

A library that simplifies the pub-sub model for TypeScript and JavaScript.

## Installation

```sh
npm install pubhop
```

## Usage

This package exports several useful classes, each of which has a specific use-case.

When you need to handle a bare-bones publisher-subscriber model, which doesn't maintain any state,
you should use `Publisher`:

```typescript
import { Publisher } from "pubhop";

type Person = {
  name: string;
  age: number;
};

const publisher = new Publisher<(person: Person) => void>();

const unsub = publisher.subscribe((person) => {
  // this will be called whenever `publisher.publish` is called
});

publisher.publish({ name: "Evyatar", age: 19 });

unsub();

// from here on out, `publisher.publish` will no longer trigger our subscriber
```

If you have multiple publishers, you can handle them with a `Network`:

```typescript
import { Network } from "pubhop";

type Person = {
  name: string;
  age: number;
};

type BlogEvents = {
  newReader: (latest: Person, readers: Person[]) => void;
  like: (count: number) => void;
};

const network = new Network<BlogEvents>(); // we now essentially have "newReader" and "like" publishers

const unsub = network.subscribe("newReader", (latest, readers) => {
  // this will be called whenever "newReader" is published to
});

const unfollow = network.follow((...data) => {
  // this will be called whenever `publish` is called, no matter for what key
});

network.publish("newReader", { name: "Evyatar", age: 19 }, [{ name: "Evyatar", age: 19 }]);

// and as with `publisher`, we can use the returned functions to unsubscribe/unfollow
unsub();
unfollow();
```

When you also need to manage some sort of state, you should use a `Store`:

```typescript
import { Store } from "pubhop";

type Person = {
  name: string;
  age: number;
};

const store = new Store<Person>({ name: "Evyatar", age: 19 }); // we can pass initial values to a store, unlike a publisher

// we can subscribe just like with a publisher
const unsub = store.subscribe((person) => {
  // this will be called whenever the store is updated
});

// however, stores also maintain state
// which we can set, calling all subscribers with the new value
store.set({ name: "Joe", age: 27 });

// and which we can get
const person = store.get();

// and as always, when we subscribe we can unsubscribe
unsub();
```

Finally, if you have multiple stores, you can handle them with a `Client`:

```typescript
import { Client } from "pubhop";

type Person = {
  name: string;
  age: number;
};

type BlogInfo = {
  readers: Person[];
  latestReader: Person;
  likes: number;
};

const client = new Client<BlogInfo>(); // we now essentially have "readers", "latestReader", and "likes" stores

// we can subscribe to a specific store
const unsub = client.subscribe("latestReader", (person) => {
  // this will be called whenever the "latestReader" store is updated
});

// or follow all of them
const unfollow = client.follow((data) => {
  // this will be called whenever any store is updated
});

client.set("likes", 10);
client.set("readers", [{ name: "Evyatar", age: 19 }]);

// data, just like a store's, can be retrieved using `get`
const likes = client.get("likes");

// and as always, when we subscribe we can unsubscribe
unsub();
unfollow();
```

## API

### Publisher

A `Publisher` maintains a list of subscribers which it notifies of any publishes. It does not manage any internal state about the data that has been published, but simply passes the data along to its subscribers.

The `Publisher` class has one generic type argument, `TSub`, which is the type of the subscriber functions. `TSub` must be a function that returns `void`.

```typescript
class Publisher<TSub extends (...args: any) => void>;
```

#### Publisher.subscribe

```typescript
Publisher<TSub>.subscribe(cb: TSub): () => void;
```

Adds a new subscriber to the publisher.

Takes a `cb` parameter, which will be called on every `publish`.

Returns an `unsubscribe` function, which removes the function from the list of subscribers.

#### Publisher.publish

```typescript
Publisher<TSub>.publish(...params: Parameters<TSub>): void;
```

Notifies all subscribers with the specified data.

Takes `params`, which are passed to each of `Publisher`'s subscribers, in insertion order.

#### Publisher.clear

```typescript
Publisher<TSub>.clear(): void;
```

Removes all subscribers from the publisher.


### Store

A `Store` maintains a list of subscribers just like a `Publisher`, but also manages an internal state. This state is the determiner of when and with what to notify the subscribers.

The `Store` class has one generic type argument, `TData`, which is the type of the internal state and the parameter for the subscriber functions.

```typescript
class Store<TData>;
```

#### Store() constructor

```typescript
new Store<TData>(initialValue?: TData);
```

`Store` can be initialized with a value, or be left empty.

#### Store.get

```typescript
Store<TData>.get(): TData | undefined;
```

Gets a snapshot of the store's state.

Returns `TData` if the store was initialized with data or has had its data set, and `undefined` otherwise.

#### Store.set

```typescript
Store<TData>.set(data: TData): void;
```

Updates the store's state, and notifies all subscribers.

Takes a `data` parameter, which will be inserted into the store's state (accessed by `get`), and which all subscribers will be called with.

#### Store.subscribe

```typescript
Store<TData>.subscribe(cb: (data: TData) => void): () => void;
```

Adds a new subscriber to the store.

Takes a `cb` parameter, which will be called on every `set`.

Returns an `unsubscribe` function, which removes the function from the list of subscribers.

### Network

A `Network` maintains as a collection of subscribers, each listening for a specific "event", along with a collection of followers, which listen for every update that the network provides. It does not manage any internal state about the data that has been published, but simply passes the data along to its subscribers and followers.

The `Network` class has one generic type argument, `THandlers`. Each key of `THandlers` signifies an event "name" or "key", while each value (which must all be functions that return void) signifies the types of that event's subscribers.

```typescript
class Network<THandlers extends Record<PropertyKey, (...args: any) => void>>;
```

#### Network.subscribe

```typescript
Network<THandlers>.subscribe<TEvent extends keyof THandlers>(
    event: TEvent,
    cb: THandlers[TEvent]
): () => void;
```

Adds a new subscriber to a specific event within the network.

Takes an `event` parameter, which specifies which of the network's events to listen for.
Takes a `cb` parameter, which will be called on every `publish` to `event`.

Returns an `unsubscribe` function, which removes the function from the list of subscribers.

#### Network.publish

```typescript
Network<THandlers>.publish<TEvent extends keyof THandlers>(
    event: TEvent,
    ...args: Parameters<THandlers[TEvent]>,
): void;
```

Notifies all subscribers of a specific event, along with all of the network's followers, with the specified data.

Takes an `event` parameter, which specifies which event's subscribers should be notified.
Takes `params`, which are passed to each of `event`'s' subscribers and all of the network's followers, in insertion order.


#### Network.follow

```typescript
// it should be noted that this type signature is an oversimplification;
// `Network` uses a mapped type to ensure that `event` and `...data` are always synced up.
Network<THandlers>.follow(cb: (event: keyof THandlers, ...data: THandlers[typeof event])): () => void
```

Adds a follower to the network, which is notified of every `publish`, regardless of key.

Takes a `cb` parameter, which will be called with the event's name and the associated data on every `publish`.

Returns an `unfollow` function, which removes the function from the list of followers.

#### Network.clear

```typescript
Network<THandlers>.clear(event: keyof THandlers): void;
```

Removes all subscribers for a specific event.

Takes an `event` parameter, which determines which subscribers to remove.

#### Network.fullClear

```typescript
Network<THandlers>.fullClear(): void;
```

Remove all subscribers and all followers of the network, regardless of events.

### Client

A `Client` maintains as a collection of stores and their subscribers, along with a collection of followers which listen for updates on every store.

The `Client` class has one generic type argument, `TData`. Each key of `TData` signifies a store's key, while each value signifies the data within that store.

```typescript
class Client<TData extends Record<PropertyKey, any>>;
```

#### Client() constructor

```typescript
new Client<TData>(initialValues?: Partial<TData>);
```

`Client` can be left empty, or have any of its stores initialized.

#### Client.get

```typescript
Client<TData>.get<TKey extends keyof TData>(key: TKey): TData[TKey];
```

Gets a snapshot of a specific store's state.

Takes a `key` parameter which specifies which store to get the data from.

Returns `TData[TKey]` if that store was initialized with data or has had its data set, and `undefined` otherwise.

#### Client.set

```typescript
Client<TData>.set<TKey extends keyof TData>(
    key: TKey,
    data: TData[TKey]
): void;
```

Updates a specific store's state, and notifies all of its subscribers.

Takes a `key` parameter, which specifies which store should have its data updated and its subscribers notified.
Takes a `data` parameter, which will be inserted into that store's state, and which all of its subscribers will be called with.

#### Client.subscribe

```typescript
Client<TData>.subscribe<TKey extends keyof TData>(
    key: TKey,
    cb: (data: TData[TKey]) => void
): () => void;
```

Adds a new subscriber to a specific store.

Takes a `key` parameter, which specifies which store's updates to listen for.
Takes a `cb` parameter, which will be called on every `set` to that store.

Returns an `unsubscribe` function, which removes the function from the list of subscribers.

#### Client.follow

```typescript
// it should be noted that this type signature is an oversimplification;
// `Client` uses a mapped type to ensure that `key` and `data` are always synced up.
Client<TData>.follow(cb: (key: keyof TData, data: TData[keyof TData])): () => void;
```

Adds a follower to the client, which is notified of every `set`, regardless of key.

Takes a `cb` parameter, which will be called with the key and the associated data on every `set`.

Returns an `unfollow` function, which removes the function from the list of followers.

### TypedMap

A wrapper for JavaScript's `Map` object that allows strong typing. Used internally by `Network` and `Client`.

The `TypedMap` class has one generic type argument, `TData`, which signifies the key-value pairs of the map.

`TypedMap` has the same API as `Map`, only with stronger types.
