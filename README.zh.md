<h1 style="text-align: center"> Syllepsis </h1>

![workflow test](https://github.com/bytedance/syllepsis/actions/workflows/test.yml/badge.svg)

简体中文 | [English](./README.md)

## 简介

Syllepsis 是一款开箱即用的的富文本编辑器，兼容主流现代浏览器。
我们在 Prosemirror 的基础上做了二次封装，提供更简洁的 API，大量基础插件扩展，和自定义插件支持，让定制编辑器更简单。

## 功能特色

- 开箱即用：支持快速接入`React`，引入 `Syllepsis` 和其它普通组件一样简单。

- 大量基础插件：提供大量常规插件，按需选择，即插即用，无需额外的开发成本。

- 可拓展性：更简单的插件封装和 API，使开发者轻松定制业务插件。

- 其它特色功能：我们在框架中积累了大量的工程实践和优化技巧，可移步[官网](https://bytedance.github.io/syllepsis/)进一步了解。

# 文档

访问[官方文档](https://bytedance.github.io/syllepsis/)了解更多内容

## 快速开始

1. 安装

```bash
  npm install @syllepsis/access-react
```

2. 使用

```jsx
import { SylEditor } from '@syllepsis/access-react';

export default function App() {
  return <SylEditor />;
}
```

## 联系我们

假如您发现任何 BUG、或对文档有疑问、或有其它的想法，均可通过 Github Issue 给我们留言，我们将尽可能及时地和您进行沟通。

## 协议

本项目采用 MIT 协议
