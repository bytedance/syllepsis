!> This Chapter is translated by machine. please feedback [Issue](https://github.com/bytedance/syllepsis/issues) if expression unclear.

# module

`Syllepsis` provides an interface for external module expansion. Users can implement expansion modules based on configuration instead of components, which can better realize reuse and unification in different projects.

`module` needs to provide the constructor `Ctor` and the configuration `option`.

`Syllepsis` provides basic extension modules [Static Toolbar](/en/modules/toolbar.md) and [Follow Toolbar](/en/modules/toolbar-inline.md). Use A complete interactive editor can be realized by simple configuration ([_example_](/en/playground)).