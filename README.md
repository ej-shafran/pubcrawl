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

