const overriddenTemplates: {
  [url: string]: string;
} = {};

type ControllerOverride = (this: any, args: any[], next: (...args: any[]) => any) => any;
const overriddenControllers: {
  [name: string]: {
    deps: string[];
    override: ControllerOverride,
  },
} = {};

let origAngular: any = null;

/**
 * Intercept methods on objects
 * TODO: Probably rename to "decorator" something or another lol
 */
function interceptFunc(
  obj: any,
  prop: string,
  intercept: (args: any[], next: (args?: any[]) => void) => void,
  initNull = true,
  force = false,
) {
  const guardSym = Symbol.for("org.bfuze.intercept." + prop);

  // Prevent from setting the same interceptor twice
  if (!force && guardSym in obj) {
    return;
  }

  // Add interceptor funcs
  let origFunc = initNull ? obj[prop] : () => {};
  function next(args: any) {
    return origFunc!.apply(obj, args);
  }

  Object.defineProperty(obj, prop, {
    configurable: false,
    get() {
      return origFunc && function(...args: any[]) {
        return intercept(args, next);
      };
    },
    set(value) {
      origFunc = value;
    },
  });

  // Add guard to prevent future conflicts
  obj[guardSym] = true;
}

/**
 * Intercept angular instance to override some of its
 * functionality
 */
export function attach() {
  Object.defineProperty(window, "angular", {
    get() {
      return origAngular;
    },
    set(value) {
      interceptFunc(value, "module", (args, next) => {
        const modName = args[0];
        const mod = next(args);

        // Intercept component creation for the "app" module
        if (modName === "app") {
          interceptFunc(mod, "component", (args, next) => {
            const componentName = args[0];
            const componentMeta: {
              controller: (string | Function)[],
            } = args[1];

            if (componentName in overriddenControllers) {
              const ctrl = componentMeta.controller.pop()! as Function;
              const { deps, override } = overriddenControllers[componentName];

              function next(this: any, args: any[]) {
                console.log("APPLYING", args);
                return ctrl.apply(this, args.slice(deps.length));
              }

              function newCtrl(this: any, ...args: any[]) {
                return override.call(this, args, next.bind(this));
              }

              Object.defineProperty(newCtrl, "length", {
                value: ctrl.length + deps.length,
              });

              componentMeta.controller.splice(0, 0, ...deps);
              componentMeta.controller.push(newCtrl);
            }

            const component = next(args);
            return component;
          });
        }

        // Intercept "commons" mod to override template creation
        if (modName === "commons") {
          interceptFunc(mod, "run", (args, next) => {
            const arr = args[0];
            const section = arr[0];

            if (section === "$templateCache") {
              const templFunc = arr.pop();
              arr.push(function(templCache: any) {
                // Intercept templates before they're stored in the cache
                interceptFunc(templCache, "put", (args, next) => {
                  let [ url, template ] = args;

                  if (url in overriddenTemplates) {
                    template = overriddenTemplates[url];
                  }

                  return next([url, template]);
                });

                templFunc(templCache);
              });
            }

            return next(args);
          });
        }

        return mod;
      });
      origAngular = value;
    },
  });
}

/**
 * Override Angular Templates
 */
export function overrideTemplate(path: string, src: string) {
  overriddenTemplates[path] = src;
}

/**
 * Override Angular component controller functions
 */
export function overrideController(
  name: string, 
  deps: string[],
  override: ControllerOverride,
) {
  overriddenControllers[name] = {
    deps,
    override,
  };
}

