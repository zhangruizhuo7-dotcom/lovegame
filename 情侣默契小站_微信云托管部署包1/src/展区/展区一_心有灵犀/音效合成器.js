// 基于 Web Audio API 的轻量情侣专属柔和浪漫音效引擎（免外部音频资源）
let audioCtx = null

function getAudioContext() {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (AudioContextClass) {
      audioCtx = new AudioContextClass()
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

export const soundManager = {
  muted: false,

  toggleMute() {
    this.muted = !this.muted
    return this.muted
  },

  // 轻快气泡/水滴点击
  playBubble() {
    if (this.muted) return
    const ctx = getAudioContext()
    if (!ctx) return

    try {
      const now = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(440, now)
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.1)

      gain.gain.setValueAtTime(0.12, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 0.13)
    } catch (e) {}
  },

  // 翻牌立体动效音
  playCardFlip() {
    if (this.muted) return
    const ctx = getAudioContext()
    if (!ctx) return

    try {
      const now = ctx.currentTime
      // 白噪音/滤波扫频模拟纸牌摩擦
      const bufferSize = ctx.sampleRate * 0.08
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1
      }

      const noise = ctx.createBufferSource()
      noise.buffer = buffer

      const filter = ctx.createBiquadFilter()
      filter.type = 'bandpass'
      filter.frequency.setValueAtTime(800, now)
      filter.frequency.exponentialRampToValueAtTime(2400, now + 0.08)
      filter.Q.value = 3

      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0.08, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08)

      noise.connect(filter)
      filter.connect(gain)
      gain.connect(ctx.destination)

      noise.start(now)
    } catch (e) {}
  },

  // 逼真温暖心跳节拍（双击咚-咚）
  playHeartbeat() {
    if (this.muted) return
    const ctx = getAudioContext()
    if (!ctx) return

    try {
      const now = ctx.currentTime

      const triggerThump = (startTime, freq, duration, vol) => {
        const osc = ctx.createOscillator()
        const filter = ctx.createBiquadFilter()
        const gain = ctx.createGain()

        osc.type = 'triangle'
        osc.frequency.setValueAtTime(freq, startTime)
        osc.frequency.exponentialRampToValueAtTime(35, startTime + duration)

        filter.type = 'lowpass'
        filter.frequency.setValueAtTime(140, startTime)

        gain.gain.setValueAtTime(0.001, startTime)
        gain.gain.linearRampToValueAtTime(vol, startTime + 0.02)
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration)

        osc.connect(filter)
        filter.connect(gain)
        gain.connect(ctx.destination)

        osc.start(startTime)
        osc.stop(startTime + duration)
      }

      // 第一声
      triggerThump(now, 75, 0.12, 0.25)
      // 第二声（稍弱）
      triggerThump(now + 0.14, 65, 0.16, 0.18)
    } catch (e) {}
  },

  // 锁定心意/按下确定
  playLockIn() {
    if (this.muted) return
    const ctx = getAudioContext()
    if (!ctx) return

    try {
      const now = ctx.currentTime
      const freqs = [523.25, 659.25] // C5, E5
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, now + idx * 0.04)

        gain.gain.setValueAtTime(0.08, now + idx * 0.04)
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.18)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(now + idx * 0.04)
        osc.stop(now + idx * 0.04 + 0.2)
      })
    } catch (e) {}
  },

  // 默契同频达成！浪漫上行和弦
  playMatchSuccess() {
    if (this.muted) return
    const ctx = getAudioContext()
    if (!ctx) return

    try {
      const now = ctx.currentTime
      // 浪漫 C 大调九和弦琶音 C5, E5, G5, B5, C6
      const chord = [523.25, 659.25, 783.99, 987.77, 1046.5]
      chord.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, now + i * 0.08)

        gain.gain.setValueAtTime(0.12, now + i * 0.08)
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.45)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(now + i * 0.08)
        osc.stop(now + i * 0.08 + 0.5)
      })
    } catch (e) {}
  },

  // 刻度滑动微触音
  playSliderTick(val = 5) {
    if (this.muted) return
    const ctx = getAudioContext()
    if (!ctx) return

    try {
      const now = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      // 根据滑块分值 1~10 映射不同音高 (300Hz ~ 800Hz)
      const baseFreq = 320 + val * 45
      osc.frequency.setValueAtTime(baseFreq, now)

      gain.gain.setValueAtTime(0.05, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 0.05)
    } catch (e) {}
  },

  // 烟花/彩带欢呼礼花音
  playFanfare() {
    if (this.muted) return
    const ctx = getAudioContext()
    if (!ctx) return

    try {
      const now = ctx.currentTime
      const notes = [587.33, 739.99, 880.0, 1174.66] // D5, F#5, A5, D6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.type = 'triangle'
        osc.frequency.setValueAtTime(freq, now + idx * 0.06)

        gain.gain.setValueAtTime(0.14, now + idx * 0.06)
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.6)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(now + idx * 0.06)
        osc.stop(now + idx * 0.06 + 0.65)
      })
    } catch (e) {}
  }
}
