'use strict';

var ClassList = require('../'),
    test = require('tape')

test('ClassList#add', function (t) {
  var el = document.createElement('div'),
      list

  el.className = ' a \n '
  list = ClassList(el)

  t.equal(list.length, 1)
  t.equal(list[0], 'a')

  t.equal(list.add('b'), list)
  t.equal(el.className, 'a b')

  t.equal(list.add(), list)
  t.equal(el.className, 'a b')

  t.equal(list.add('c', 'd', 'e'), list)
  t.equal(el.className, 'a b c d e')

  t.equal('' + list, el.className)
  t.equal(list[4], 'e')
  t.equal(list.length, 5)

  t.end()
})

test('ClassList#remove', function (t) {
  var el = document.createElement('div'),
      list

  el.className = ' a b c  \n d e f '
  list = new ClassList(el)

  t.equal(list.length, 6)

  t.equal(list.remove(), list)
  t.equal(list.length, 6)
  t.equal(el.className, 'a b c d e f')

  t.equal(list.remove('c'), list)
  t.equal(el.className, 'a b d e f')

  t.equal(list.remove('b', 'f', 'a'), list)
  t.equal(el.className, 'd e')

  t.equal('' + list, el.className)
  t.equal(list.length, 2)
  t.equal(list[0], 'd')
  t.equal(list[1], 'e')

  t.end()
})

test('ClassList#contains', function (t) {
  var el = document.createElement('div'),
      list

  el.className = 'a b c'
  list = new ClassList(el)

  t.equal(list.length, 3)

  t.ok(list.contains('a'))
  t.notOk(list.contains('x'))

  t.end()
})

test('ClassList#toggle', function (t) {
  var el = document.createElement('div'),
      list

  el.className = 'a b'
  list = ClassList(el)

  t.equal(list.length, 2)

  t.equal(list.toggle('a'), list)
  t.equal(el.className, 'b')

  t.equal(list.toggle('c'), list)
  t.equal(el.className, 'b c')

  t.equal(list.toggle('b', true), list)
  t.equal(el.className, 'b c')

  t.equal(list.toggle('a', false), list)
  t.equal(el.className, 'b c')

  t.equal(list.toggle('a', true), list)
  t.equal(el.className, 'b c a')

  t.equal(list.toggle('b', false), list)
  t.equal(el.className, 'c a')

  t.equal('' + list, el.className)
  t.equal(list.length, 2)

  t.end()
})
