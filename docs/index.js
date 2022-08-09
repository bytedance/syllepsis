const puppeteer = require('puppeteer');

/**
 * check if there has 404 pages
 *
 * how to use
 *
 * ```bash
 * # cd ${project path}
 * # docsify serve ./docs
 * node ./docs/index.js
 * ```
 */
const config = {
  url: 'http://localhost:8000',
  onlyCheckLocal: false,
};

// if there is 404 links
(async function(pup) {
  await main();

  async function main() {
    const isDebugger = false;
    const params = isDebugger ? { headless: false, devtools: true } : undefined;
    const browser = await pup.launch(params);
    const page = await browser.newPage();
    const checkedLinks = {};
    await find404Links(page, config.url, checkedLinks, 'home page');
    const keys = Object.keys(checkedLinks);
    let allValid = true;
    keys.forEach(eachKey => {
      if (!checkedLinks[eachKey]) {
        allValid = false;
        console.log('404 link', eachKey);
      }
      return checkedLinks[eachKey] === true;
    });

    if (!allValid) {
      console.error('error! please check log');
      process.exit(-1);
    } else {
      console.log('success! all link valid');
      process.exit(0);
    }
  }

  function waitFor(times) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, times);
    });
  }

  function is404Link(page, url) {
    return new Promise(async resolve => {
      if (url.startsWith(config.url)) {
        const isFind = await page.evaluate(() => !!document.querySelector('#page404'));
        resolve(isFind);
      } else if (url.startsWith('https://github.com')) {
        const isFind = await page.evaluate(() => {
          const dom = document.querySelector('title');
          return dom && dom.innerText && dom.innerText.startsWith('Page not found');
        });
        resolve(isFind);
      } else {
        // nginx 404
        const isFind = await page.evaluate(() => {
          const dom = document.querySelector('h1');
          return dom && dom.innerText && dom.innerText.startsWith('404 Not Found');
        });
        resolve(isFind);
      }
    });
  }

  /**
   * find all 404 link
   * @param page
   * @param url homepage
   * @param checkedLinks all link checked before
   * @param fromLink where link from
   */
  async function find404Links(page, url, checkedLinks = {}, fromLink) {
    if (!url) {
      console.error('illegal link', url);
      return false;
    }
    if (typeof checkedLinks[url] !== 'undefined') {
      console.error('something wrong, should not check same link again', url);
      return false;
    }
    let findMore = true;
    if (!url.startsWith(config.url)) {
      findMore = false;
    }
    try {
      console.log('check', url);

      await page.goto(url);
      await waitFor(200);

      const is404 = await is404Link(page, url);

      if (is404) {
        console.log('link open failure', url, 'from', fromLink);
        checkedLinks[url] = false;
      } else {
        checkedLinks[url] = true;
      }
      if (!findMore) {
        return false;
      }

      // find for more links
      const notCheckedLinks = await page.evaluate(
        (links, onlyCheckLocal) => {
          const $allLink = document.querySelectorAll('a');
          const resLink = [];
          // return all un-visited link
          $allLink.forEach(eachLink => {
            if (eachLink.href) {
              let currentLink = eachLink.href;
              const paramsSymbolIndex = currentLink.indexOf('?');
              if (paramsSymbolIndex !== -1) {
                currentLink = currentLink.substr(0, paramsSymbolIndex);
              }
              const filter = onlyCheckLocal ? currentLink.startsWith(config.url) : true;
              if (typeof links[currentLink] === 'undefined' && filter) {
                resLink.push({
                  from: location.href,
                  to: currentLink,
                });
              }
            }
          });
          return resLink;
        },
        checkedLinks,
        config.onlyCheckLocal,
      );

      for (const { to: link, from: fromLink } of notCheckedLinks) {
        if (typeof checkedLinks[link] === 'undefined') {
          await find404Links(page, link, checkedLinks, fromLink);
        }
      }
    } catch (err) {
      console.log('link open failure', url, 'from', fromLink, err);
      checkedLinks[url] = false;
    }
    return checkedLinks;
  }
})(puppeteer);
