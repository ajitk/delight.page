import { h, Component, render } from './lib/preact.js';
import htm from './lib/htm.js';

const html = htm.bind(h);
const bg = chrome.extension.getBackgroundPage();

let prefs = null;

let loading = true;

function onToggleState(e) {
  prefs.isON = !prefs.isON;
  saveAndUpdate();
}

function onChangeOverlay(e) {
  prefs.overlayColor = e.target.value;
  saveAndUpdate();
}

function onChangeHeight(e) {
  prefs.lightbox.height = parseInt(e.target.value);
  saveAndUpdate();
}

function onChangeWidth(e) {
  prefs.lightbox.width = parseInt(e.target.value);
  saveAndUpdate();
}

function openHref(e) {
  chrome.tabs.create({
    url: e.target.href
  });
}

function Switch({checked, onClick}) {
  return html`
<span
  role="checkbox"
  tabindex="0"
  aria-checked="${checked}"
  class="${checked ? 'bg-green-400 ' : 'bg-gray-200 '} relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:shadow-outline"
  onClick=${onClick}
  >
  <span aria-hidden="true" class="${checked ? 'translate-x-5' : 'translate-x-0'} inline-block h-5 w-5 rounded-full bg-white shadow transform transition ease-in-out duration-200"></span>
</span>
`;
}

function Form() {
  return html`
<div>
  <div class="mt-6 grid grid-cols-1 row-gap-3 col-gap-4 grid-cols-6">

    <!-- overlay -->
    <div class="mt-2 col-span-6 grid grid-cols-3 gap-4 items-start pt-2">

      <label for="overlay" class="block text-sm font-medium leading-5 text-gray-300 mt-px text-right">
        Overlay Color
      </label>

      <div class="mt-1 mt-0 col-span-2 relative">
        <input
          id='overlay'
          class="border-none w-full pl-1 bg-gray-300"
          value=${prefs.overlayColor}
          onInput=${onChangeOverlay}
          />
        <div class='absolute bg-gray-100 inset-y-0 right-0 w-1/2'>
          <div class='mx-auto text-center bg-gradient-to-r from-red-500 h-full'>
            Overlay Preview
          </div>
          <div
            class='absolute inset-0 border-4'
            style='border-color: ${prefs.overlayColor}; border-left-width: 4rem;'>
          </div>
        </div>
      </div>
    </div> <!-- overlay -->

    <!-- lightbox -->
    <div class="mt-2 col-span-6 grid grid-cols-3 gap-4 items-start pt-2">

      <label for="lightbox-width" class="block text-sm font-medium leading-5 text-gray-300 mt-px text-right">
        Lightbox Dimensions
      </label>

      <div class="mt-1 mt-0 col-span-2">

        <div class="flex">

        <div class="max-w-lg flex shadow-sm">
          <span class="inline-flex items-center px-3 border border-r-0 border-gray-300 bg-gray-500 text-gray-100 sm:text-sm">
            Width
          </span>
          <input
            id="lightbox-width"
            type="number"
            class="flex-1 form-input block min-w-1 w-20 transition duration-150 ease-in-out sm:text-sm sm:leading-5 pl-1 bg-gray-300"
            value=${prefs.lightbox.width}
            onInput=${onChangeWidth}
            />
        </div>

        <i class='flex-1'/>

        <div class="max-w-lg flex shadow-sm">
          <label class="inline-flex items-center px-3 border border-r-0 border-gray-300 bg-gray-500 text-gray-100 sm:text-sm">
            Height
          </label>
          <input
            id="lightbox-height"
            type="number"
            class="flex-1 form-input block min-w-1 w-20 transition duration-150 ease-in-out sm:text-sm sm:leading-5 pl-1 bg-gray-300"
            value=${prefs.lightbox.height}
            onInput=${onChangeHeight}
            />
        </div>
        </div>

        <p class="mt-1 text-sm leading-5 text-gray-400">
          Area under the mouse that is bright.
        </p>
      </div>
    </div> <!-- lightbox -->

  </div>
</div>
`;
}

function ButtonBar() {

}

function App() {
  if(loading) {
    return html`<div class="p-6 bg-gray-800 text-gray-300">Loading...</div>`
  }
  return html`

<div class="p-6 bg-gray-800">
  <div class="max-w-7xl mx-auto">
      
    <div class="flex">
      <div class="flex-1 min-w-0">
        <h2 class="text-2xl font-bold leading-7 text-white text-3xl leading-9 truncate">
          <span class='text-gray-400'>De</span><span class='text-gray-200'>light</span>
        </h2>
        <p class="mt-1 text-sm leading-5 text-gray-400">
          Mask pages with a dark overlay and light up area under mouse.
        </p>
      </div>

      <${Switch} checked=${prefs.isON} onClick=${onToggleState}/>
    </div>

    <${Form}/>
  </div>

  <!-- feedback link -->
  <div class='mt-4 pt-4 border-t-2 border-gray-200 text-gray-400'>
    Coming soon: static lightbox for pages. 
    <a
      href='https://twitter.com/ajitk'
      class='text-blue-400 ml-1' onClick=${openHref}>
      Tweet ideas and feedback.
    </a>
  </div>
</div>

`
}

async function saveAndUpdate() {
  await bg.setPrefs(prefs);
  update();
}

async function update() {
  prefs = await bg.getPrefs();
  loading = false;
  render(html`<${App}/>`, document.body);
}

update();

