/**
 * 环境音引擎 —— 全部用 Web Audio 实时合成，不依赖任何音频文件，离线可用。
 *
 * 声音思路：
 *   先生成一段很长的「粉红噪声」，循环播放作为基底；
 *   每种环境音 = 基底噪声 + 不同的滤波器 + 缓慢变化的增益/频率（LFO）。
 *   雨声偏高频、海浪起伏慢、溪流中频、林风低频。
 */

const LAYERS = [
  {
    id: "rain",
    name: "雨声",
    hint: "窗外细雨",
    build: (ctx, src) => {
      const hp = ctx.createBiquadFilter();
      hp.type = "highpass";
      hp.frequency.value = 420;

      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 5200;
      lp.Q.value = 0.4;

      // 让雨势有轻微的强弱变化
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.07;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 1400;
      lfo.connect(lfoGain).connect(lp.frequency);
      lfo.start();

      const peak = ctx.createBiquadFilter();
      peak.type = "peaking";
      peak.frequency.value = 1600;
      peak.Q.value = 0.8;
      peak.gain.value = 4;

      src.connect(hp).connect(lp).connect(peak);
      return { out: peak, nodes: [lfo] };
    },
    level: 0.5,
  },
  {
    id: "waves",
    name: "海浪",
    hint: "远处潮声",
    build: (ctx, src) => {
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 700;
      lp.Q.value = 0.6;

      // 一次涌来又退去的周期，约 12 秒
      const swell = ctx.createOscillator();
      swell.frequency.value = 0.083;
      const swellGain = ctx.createGain();
      swellGain.gain.value = 0.42;
      const depth = ctx.createGain();
      depth.gain.value = 0.58;
      swell.connect(swellGain).connect(depth.gain);
      swell.start();

      const lpLfo = ctx.createOscillator();
      lpLfo.frequency.value = 0.083;
      const lpLfoGain = ctx.createGain();
      lpLfoGain.gain.value = 320;
      lpLfo.connect(lpLfoGain).connect(lp.frequency);
      lpLfo.start();

      src.connect(lp).connect(depth);
      return { out: depth, nodes: [swell, lpLfo] };
    },
    level: 0.62,
  },
  {
    id: "stream",
    name: "溪流",
    hint: "山涧流水",
    build: (ctx, src) => {
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = 1100;
      bp.Q.value = 0.5;

      const hi = ctx.createBiquadFilter();
      hi.type = "bandpass";
      hi.frequency.value = 2600;
      hi.Q.value = 0.9;
      const hiGain = ctx.createGain();
      hiGain.gain.value = 0.35;

      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.31;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 220;
      lfo.connect(lfoGain).connect(bp.frequency);
      lfo.start();

      src.connect(bp);
      src.connect(hi).connect(hiGain);
      const mix = ctx.createGain();
      bp.connect(mix);
      hiGain.connect(mix);
      return { out: mix, nodes: [lfo] };
    },
    level: 0.45,
  },
  {
    id: "wind",
    name: "林风",
    hint: "树梢的风",
    build: (ctx, src) => {
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 380;
      lp.Q.value = 1.2;

      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.055;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 240;
      lfo.connect(lfoGain).connect(lp.frequency);
      lfo.start();

      const gust = ctx.createOscillator();
      gust.frequency.value = 0.041;
      const gustGain = ctx.createGain();
      gustGain.gain.value = 0.4;
      const depth = ctx.createGain();
      depth.gain.value = 0.6;
      gust.connect(gustGain).connect(depth.gain);
      gust.start();

      src.connect(lp).connect(depth);
      return { out: depth, nodes: [lfo, gust] };
    },
    level: 0.55,
  },
  {
    id: "hush",
    name: "低频白噪",
    hint: "隔绝嘈杂",
    build: (ctx, src) => {
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 1100;
      lp.Q.value = 0.3;
      src.connect(lp);
      return { out: lp, nodes: [] };
    },
    level: 0.34,
  },
];

export const AMBIENT_LAYERS = LAYERS.map(({ id, name, hint }) => ({
  id,
  name,
  hint,
}));

function createNoiseBuffer(ctx) {
  // 8 秒粉红噪声，循环播放基本听不出接缝
  const len = ctx.sampleRate * 8;
  const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let b0 = 0,
    b1 = 0,
    b2 = 0,
    b3 = 0,
    b4 = 0,
    b5 = 0,
    b6 = 0;
  for (let i = 0; i < len; i++) {
    const white = Math.random() * 2 - 1;
    // Paul Kellet 的粉红噪声近似
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.969 * b2 + white * 0.153852;
    b3 = 0.8665 * b3 + white * 0.3104856;
    b4 = 0.55 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.016898;
    const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
    b6 = white * 0.115926;
    data[i] = pink * 0.06;
  }
  return buffer;
}

class AmbientEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.analyser = null;
    this.noise = null;
    this.voices = new Map(); // id -> { gain, source, nodes }
    this.volume = 0.6;
    this.started = false;
  }

  /** 必须在用户手势里调用一次。 */
  async init() {
    if (this.ctx) {
      if (this.ctx.state === "suspended") await this.ctx.resume();
      return this.ctx;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) throw new Error("浏览器不支持 Web Audio");
    const ctx = new AC();
    this.ctx = ctx;
    this.master = ctx.createGain();
    this.master.gain.value = this.volume;
    this.analyser = ctx.createAnalyser();
    this.analyser.fftSize = 512;
    this.analyser.smoothingTimeConstant = 0.85;
    this.master.connect(this.analyser);
    this.master.connect(ctx.destination);
    this.noise = createNoiseBuffer(ctx);
    this.started = true;
    return ctx;
  }

  setVolume(v) {
    this.volume = v;
    if (this.master) {
      this.master.gain.cancelScheduledValues(this.ctx.currentTime);
      this.master.gain.setTargetAtTime(v, this.ctx.currentTime, 0.08);
    }
  }

  isOn(id) {
    return this.voices.has(id);
  }

  /** 打开一层环境音（淡入）。 */
  async enable(id) {
    await this.init();
    if (this.voices.has(id)) return;
    const def = LAYERS.find((l) => l.id === id);
    if (!def) return;

    const ctx = this.ctx;
    const source = ctx.createBufferSource();
    source.buffer = this.noise;
    source.loop = true;

    const { out, nodes } = def.build(ctx, source);

    const gain = ctx.createGain();
    gain.gain.value = 0;
    out.connect(gain).connect(this.master);

    source.start();
    gain.gain.setTargetAtTime(def.level, ctx.currentTime, 1.2);

    this.voices.set(id, { gain, source, nodes, def });
  }

  /** 关闭一层环境音（淡出后释放）。 */
  disable(id) {
    const v = this.voices.get(id);
    if (!v || !this.ctx) return;
    const t = this.ctx.currentTime;
    v.gain.gain.cancelScheduledValues(t);
    v.gain.gain.setTargetAtTime(0, t, 0.35);
    this.voices.delete(id);
    setTimeout(() => {
      try {
        v.source.stop();
        v.nodes.forEach((n) => n.stop && n.stop());
        v.gain.disconnect();
      } catch {
        /* 已停止 */
      }
    }, 1600);
  }

  toggle(id) {
    return this.isOn(id) ? (this.disable(id), false) : (this.enable(id), true);
  }

  stopAll() {
    Array.from(this.voices.keys()).forEach((id) => this.disable(id));
  }

  /** 呼吸/计时用的柔和提示音。type: 'in' | 'out' | 'bell' */
  async chime(type = "bell") {
    await this.init();
    const ctx = this.ctx;
    const t = ctx.currentTime;
    const map = { in: 392, out: 294, bell: 528 };
    const base = map[type] || 528;

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.18, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 2.4);
    g.connect(this.master);

    [1, 2.01, 3.02].forEach((mult, i) => {
      const o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.value = base * mult;
      const og = ctx.createGain();
      og.gain.value = [1, 0.32, 0.12][i];
      o.connect(og).connect(g);
      o.start(t);
      o.stop(t + 2.6);
    });
  }

  /** 供可视化使用的频谱数据（0-255）。 */
  spectrum() {
    if (!this.analyser) return null;
    const arr = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(arr);
    return arr;
  }

  get active() {
    return this.voices.size > 0;
  }
}

let _engine = null;
export function getEngine() {
  if (typeof window === "undefined") return null;
  if (!_engine) _engine = new AmbientEngine();
  return _engine;
}
