// @ts-nocheck
const { spawn, execSync } = require('child_process');
const path = require('path');

let PORT = 3000;

beforeAll(async () => {
  await new Promise(resolve => {
    const childP = spawn('vite', {
      cwd: path.resolve(__dirname, '..', '..', 'e2e-environment', 'adapter'),
    });
    childP.stdout.on('data', data => {
      const msg = data.toString();
      if (msg.includes('localhost')) {
        const realPort = msg.match(/localhost:(\d+)/);
        if (realPort) PORT = realPort[1];
        resolve();
      }
    });
  });

  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });

  await page.evaluate(`
    Object.defineProperties(window, {
      CARD_HTML: {
        get() {
          return '<p>{-- Card --}</p>'
        }
      },
      INLINE_CARD_HTML: {
        get() {
          return '<a class="inline-card">inline_card</a>'
        }
      },
      INLINE_CARD_TEXT_HTML: {
        get() {
          return '<a class="inline-card-text">inline_card_text</a>'
        }
      }
    });
    window.__awaiter = function(thisArg, _arguments, P, generator) { 
      new Promise(function(resolve, reject) {
        function adopt(value) {
          return value instanceof Promise
            ? value
            : new Promise(function(_resolve) {
                _resolve(value);
              });
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator['throw'](value));
          } catch (e) {
            reject(e);
          }
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    }
  `);
}, 2 * 60 * 1000);

afterAll(() => {
  try {
    const pid = execSync(`lsof -i:${PORT} -t`)
      .toString()
      .match(/\d+/g)
      .pop();
    execSync(`kill -9 ${pid}`);
  } catch (err) {
    console.dir(err);
  }
});
