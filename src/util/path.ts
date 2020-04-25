// @ts-nocheck

//  Ramda v0.25.0
//  https://github.com/ramda/ramda
//  (c) 2013-2017 Scott Sauyet, Michael Hurley, and David Chambers
//  Ramda may be freely distributed under the MIT license.

/*
The MIT License (MIT)

Copyright (c) 2013-2018 Scott Sauyet and Michael Hurley

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

function _isPlaceholder(a) {
  return (
    a != null && typeof a === "object" && a["@@functional/placeholder"] === true
  );
}

function _curry1(fn: Function): (a: any) => any {
  return function f1(a) {
    if (arguments.length === 0 || _isPlaceholder(a)) {
      return f1;
    } else {
      return fn.apply(this, arguments);
    }
  };
}

function _curry2(fn: Function): (a: any, b: any) => any {
  return function f2(a, b) {
    switch (arguments.length) {
      case 0:
        return f2;
      case 1:
        return _isPlaceholder(a)
          ? f2
          : _curry1(function (_b) {
              return fn(a, _b);
            });
      default:
        return _isPlaceholder(a) && _isPlaceholder(b)
          ? f2
          : _isPlaceholder(a)
          ? _curry1(function (_a) {
              return fn(_a, b);
            })
          : _isPlaceholder(b)
          ? _curry1(function (_b) {
              return fn(a, _b);
            })
          : fn(a, b);
    }
  };
}

type PathFunction = (paths: string[], obj: Record<string, any>) => any;

export const path: PathFunction = _curry2(function (
  paths: string[],
  obj: Record<string, any>
) {
  let val = obj,
    idx = 0;
  while (idx < paths.length) {
    if (val == null) {
      return;
    }
    val = val[paths[idx]];
    idx += 1;
  }
  return val;
});
