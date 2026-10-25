// Laatuprofiili: tietokoneella täysi jälkikäsittely, puhelimella ja tabletilla kevyt
// polku, joka toimii myös näytönohjaimilla, jotka eivät osaa renderöidä
// liukulukupuskuriin reunanpehmennyksen kanssa (iPhone Safari, moni Android).
//
// Tietokoneen asetukset ovat täsmälleen samat kuin ennen tätä tiedostoa.
// Pakotus osoitteella: ?quality=low tai ?quality=high. Diagnoosirivi: ?debug.
// ?target=8 pakottaa 8-bittisen puskurin (testaa laitteita ilman liukulukupuskuria).
import * as THREE from 'three';

const params = new URLSearchParams(location.search);

export function isMobileDevice() {
  const ua = navigator.userAgent;
  // iPadOS esittäytyy Maciksi, mutta sillä on kosketusnäyttö
  return /iPhone|iPad|iPod|Android/i.test(ua) || (navigator.maxTouchPoints > 1 && /Macintosh/.test(ua));
}

export function detectQuality(renderer) {
  const ext = renderer.extensions;
  // Liukulukupuskuriin renderöinti vaatii jommankumman laajennuksen
  // ?target=8 simuloi laitetta, joka ei osaa renderöidä liukulukuun (testausta varten)
  const halfFloatRender = params.get('target') !== '8' && (ext.has('EXT_color_buffer_float') || ext.has('EXT_color_buffer_half_float'));
  const mobile = isMobileDevice();
  const forced = params.get('quality');
  const low = forced === 'low' || (forced !== 'high' && (mobile || !halfFloatRender));

  if (!low) {
    return {
      name: 'high', mobile, halfFloatRender,
      targetType: THREE.HalfFloatType, samples: 4,
      ao: true, outline: true, bloom: true,
      shadowSize: 4096, textureScale: 1, probeSize: 256, probeType: THREE.HalfFloatType,
    };
  }
  return {
    name: 'low', mobile, halfFloatRender,
    // ilman MSAA:ta; jos liukulukuun ei voi renderöidä, tavallinen 8-bittinen puskuri
    targetType: halfFloatRender ? THREE.HalfFloatType : THREE.UnsignedByteType, samples: 0,
    ao: false, outline: false, bloom: false,
    shadowSize: 2048, textureScale: 0.5, probeSize: 128,
    probeType: halfFloatRender ? THREE.HalfFloatType : THREE.UnsignedByteType,
  };
}

// Diagnoosirivi ruudun alakulmaan (?debug): näytönohjain, profiili ja virheet.
// Puhelimessa ei ole kehittäjätyökaluja, joten kuvakaappaus tästä kertoo vian.
export function debugOverlay(renderer, quality) {
  if (!params.has('debug')) return () => {};
  const box = document.createElement('pre');
  Object.assign(box.style, {
    position: 'fixed', left: '8px', bottom: '8px', zIndex: 100, maxWidth: 'calc(100vw - 16px)',
    margin: 0, padding: '8px 10px', font: '11px/1.35 monospace', color: '#cfe8c8',
    background: 'rgba(0,0,0,0.8)', borderRadius: '6px', whiteSpace: 'pre-wrap', pointerEvents: 'none',
  });
  document.body.appendChild(box);
  const gl = renderer.getContext();
  const info = gl.getExtension('WEBGL_debug_renderer_info');
  const gpu = info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
  const errors = [];
  const origError = console.error;
  console.error = (...a) => { errors.push(a.map(String).join(' ').slice(0, 160)); origError(...a); update(); };
  addEventListener('error', (e) => { errors.push(String(e.message).slice(0, 160)); update(); });
  function update(extra = '') {
    box.textContent = [
      `profiili: ${quality.name}${quality.mobile ? ' (mobiili)' : ''}`,
      `gpu: ${gpu}`,
      `webgl2: ${renderer.capabilities.isWebGL2 !== false} · half float -puskuri: ${quality.halfFloatRender}`,
      `tekstuuriyksiköt: ${renderer.capabilities.maxTextures} · max koko: ${renderer.capabilities.maxTextureSize}`,
      `muisti: ${renderer.info.memory.geometries} geometriaa · ${renderer.info.memory.textures} tekstuuria · ${renderer.info.programs?.length ?? '?'} shaderia`,
      extra,
      ...errors.slice(-4).map((e) => `virhe: ${e}`),
    ].filter(Boolean).join('\n');
  }
  update();
  return update;
}
