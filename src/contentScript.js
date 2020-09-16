const TAG = 'de-light';

function getRect(el) {
  let { x, y, width, height } = el.getBoundingClientRect();
  return { x, y, width, height };
}

class Overlay {
  constructor(prefs = {
    isON: true,
    overlayColor: 'rgba(0,0,0)',
    lightbox: {
      width: 800,
      height: 200,
    }
  }) {
    this.prefs = prefs;
    this.canvas = this.createCanvas();
    let ctx = this.canvas.getContext('2d');
    if (ctx == null)
      throw new Error('Invalid state - context is null');
    this.ctx = ctx;
    this.el = document.createElement(TAG);
    this.shadowRoot = this.el.attachShadow({ mode: "closed" });
    this.shadowRoot.appendChild(this.canvas);
    document.documentElement.appendChild(this.el);

    this.focusTarget = null;
    this.hoverTarget = null;
  }

  setPrefs(prefs) {
    this.prefs = prefs;
    if(prefs.isON) {
      this.shadowRoot.appendChild(this.canvas);
    } else {
      this.canvas.remove();
    }
    this.render();
  }

  createCanvas() {
    let canvas = document.createElement('canvas');
    Object.assign(canvas.style, this.getCanvasStyles());
    return canvas;
  }

  onBlur(e) {
    this.focusTarget = null;
    this.render();
  }

  onFocus(e) {
    if(e.target != document) {
      this.focusTarget = e.target;
      this.render();
    } else {
      this.focusTarget = null;
    }
  }

  onHover(e) {
    this.hoverTarget = { x: e.clientX, y: e.clientY, rect: getRect(e.target) };
    delightfulOverlay.render();
  }

  lightCircle(x0, y0, radius) {
    this.ctx.globalCompositeOperation = 'destination-out';

    let grad = this.ctx.createRadialGradient(x0, y0, 0, x0, y0, radius);
    grad.addColorStop(1,   'rgba(255, 255, 255, 0)');
    grad.addColorStop(.5,  'rgba(255, 255, 255, 0.9)');
    grad.addColorStop(0,   'rgba(255, 255, 255, 1)');

    this.ctx.fillStyle = grad;
    this.ctx.arc(x0, y0, radius, 0, Math.PI*2, true);
    this.ctx.fill();
  }

  lightRect(x0, y0, width, height) {
    this.ctx.globalCompositeOperation = 'destination-out';

    let radius = Math.max(width, height);

    let grad = this.ctx.createRadialGradient(x0, y0, 0, x0, y0, radius);
    grad.addColorStop(0,   'rgba(255, 255, 255, 1)');
    grad.addColorStop(1,   'rgba(255, 255, 255, 0)');

    let blur = Math.min(100, Math.max(.02*radius, 10))|0;
    this.ctx.filter = `blur(${blur}px)`;
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(x0-(width/2), y0-(height/2), width, height);
  }

  render() {
    if(!this.prefs.isON) {
      return;
    }
    this.reset();

    if(this.focusTarget) {
      let {x, y, width, height} = getRect(this.focusTarget);
      this.lightRect(x + width/2 - 5,
        y + height/2 - 5,
        width + 20,
        Math.min(400, height) + 20);
    }

    if(this.hoverTarget) {
      let {x, y, rect} = this.hoverTarget;
      // this.lightCircle(x, y, 500);
      this.lightRect(x, y, this.prefs.lightbox.width, this.prefs.lightbox.height);
    }
  }

  reset() {
    this.resetCanvasSize();
    let { ctx } = this;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    Object.assign(ctx, this.getOverlayStyles());
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
  }

  getCanvasStyles() {
    return {
      pointerEvents: 'none',
      position: 'fixed',
      left: 0,
      top: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 999999999,
    };
  }
  getOverlayStyles() {
    return {
      fillStyle: this.prefs.overlayColor,
    };
  }
  resetCanvasSize() {
    this.canvas.setAttribute('width', window.innerWidth + '');
    this.canvas.setAttribute('height', window.innerHeight + '');
  }
  uninit() {
    this.el.remove();
  }
}

try { document.querySelector(TAG).remove(); } catch(e) {}

let delightfulOverlay = new Overlay();
delightfulOverlay.render();

document.addEventListener('mousemove', function(e) {
  delightfulOverlay.onHover(e);
});

document.addEventListener('blur', function(e) {
  delightfulOverlay.onBlur(e);
}, true)

document.addEventListener('focus', function(e) {
  delightfulOverlay.onFocus(e);
}, true)


chrome.runtime.sendMessage({
  type: 'getPrefs',
  host: location.host,
}, prefs => {
  console.log('prefs', {prefs});
  delightfulOverlay.setPrefs(prefs);
});


