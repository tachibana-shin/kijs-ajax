# kijs-ajax
Plugin add support ajax for kijs
[View docs](https://tachibana-shin.github.io/kijs-ajax)

[![Build](https://github.com/tachibana-shin/kijs-ajax/actions/workflows/docs.yml/badge.svg)](https://github.com/tachibana-shin/kijs-ajax/actions/workflows/docs.yml)
[![NPM](https://badge.fury.io/js/kijs-ajax.svg)](http://badge.fury.io/js/kijs-ajax)

Example:
``` ts
import { Kijs }, kijs from "kijs"
import Ajax, { ajax } from "kijs-ajax"

Kijs.use(Ajax);

console.log(await ajax("./test.json"))

kijs("body").load("index.html")
```
