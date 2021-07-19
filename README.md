<h1 style="text-align: center"> Syllepsis </h1>

![workflow test](https://github.com/bytedance/syllepsis/actions/workflows/test.yml/badge.svg)

[简体中文](./README.zh.md) | English

## Introduction

Syllepsis is an out-of-the-box rich text editor compatible with mainstream modern browsers.We re-encapsulate Prosemirror to provide more concise APIs, a large number of basic plugins and custom plugins to simplify the customization of editors.

## Features

- Ready to go: support quick access to React. To use Syllepsis is as simple as other common components.
- A large number of basic plugins: we provide a large number of regular plugins that you can choose on demand, plug and play without additional development costs.
- Scalability: Simpler plugin encapsulation and API make it easy to customize business plugins for developers.
- Other features: we have accumulated a lot of engineering practice and optimization skills in the framework. Please visit the [official website](https://bytedance.github.io/syllepsis/) for more information.

# Document

For more details, please refer to [official document](https://bytedance.github.io/syllepsis/)

## Quick start

1. Installation

```bash
  npm install @syllepsis/access-react
```

2. Use

```jsx
import { SylEditor } from '@syllepsis/access-react';

export default function App() {
  return <SylEditor />;
}
```

## Contact us

If you find any bugs, have questions about documents, or have other ideas, you can leave us a message in Github Issue, and we will communicate with you as soon as possible.

## License

This project is licensed under the terms of the MIT license.
