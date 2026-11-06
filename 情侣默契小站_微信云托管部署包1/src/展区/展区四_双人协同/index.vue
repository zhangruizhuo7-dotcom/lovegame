<template>
  <div class="space-y-6">
    <!-- 如果没有选中具体游戏，展示展区四总览卡片 -->
    <div v-if="!activeGame" class="space-y-6">
      
      <!-- 展区头部横幅：薄荷绿与珊瑚粉科技双色风格 -->
      <div class="glass-card rounded-3xl p-6 sm:p-8 border-2 border-emerald-200/80 shadow-md relative overflow-hidden bg-gradient-to-br from-white via-emerald-50/30 to-rose-50/30">
        <!-- 装饰性光晕与科技微光圆环 -->
        <div class="absolute -right-12 -top-12 w-48 h-48 bg-emerald-300/25 rounded-full blur-2xl pointer-events-none"></div>
        <div class="absolute -left-12 -bottom-12 w-48 h-48 bg-rose-300/20 rounded-full blur-2xl pointer-events-none"></div>
        <div class="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none"></div>

        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative z-10">
          <div class="flex items-center gap-4">
            <button 
              @click="$emit('back')"
              class="w-11 h-11 rounded-2xl bg-white border border-slate-200 hover:border-emerald-400 flex items-center justify-center text-slate-600 hover:text-emerald-600 shadow-xs transition-all hover:scale-105 active:scale-95"
              title="返回所有展区"
            >
              &larr;
            </button>
            <div>
              <div class="flex items-center gap-2.5 flex-wrap">
                <span class="text-3xl filter drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]">🎮</span>
                <h2 class="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">展区四 · 双人实时协同</h2>
                <span class="text-xs bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-extrabold px-3 py-1 rounded-full shadow-xs">
                  CO-OP ARENA
                </span>
              </div>
              <p class="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                并肩作战与即时心跳配合：情侣画板涂鸦猜词、盲人领航员迷宫突围，以声音与光晕为引，考验终极信任！
              </p>
            </div>
          </div>

          <!-- 双机实时通道微光胶囊 -->
          <div class="flex flex-col gap-1.5 self-start sm:self-auto shrink-0">
            <div class="flex items-center gap-2 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-emerald-200 shadow-2xs text-xs font-bold text-emerald-800">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>双机协同通道已建立 · 实时低延迟</span>
            </div>
            <div class="flex items-center gap-2 bg-rose-50/90 px-3.5 py-1.5 rounded-2xl border border-rose-200 text-xs font-semibold text-rose-800">
              <span>🛡️ 【协作信任 & 默契反应】双维度增益</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 2款小游戏卡片选择器：左侧珊瑚粉灵犀画卷，右侧薄荷绿迷雾探险 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <!-- 游戏 11：你画我猜 · 情侣画板 -->
        <div 
          @click="activeGame = 'co-draw'"
          class="glass-card rounded-3xl p-6 sm:p-7 border-2 border-rose-100/90 hover:border-rose-300 glow-hover cursor-pointer relative overflow-hidden group flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 bg-gradient-to-b from-white via-rose-50/20 to-white shadow-sm hover:shadow-xl"
        >
          <div class="absolute -right-8 -top-8 w-28 h-28 bg-rose-200/30 rounded-full blur-xl group-hover:scale-125 transition-transform"></div>

          <div>
            <div class="flex items-center justify-between mb-4">
              <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center text-3xl text-white shadow-md shadow-rose-300/40 group-hover:scale-110 group-hover:rotate-6 transition-all">
                🎨
              </div>
              <div class="flex items-center gap-2">
                <span class="text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                  游戏 11 · 升级版
                </span>
              </div>
            </div>

            <h3 class="text-lg sm:text-xl font-black text-slate-800 group-hover:text-rose-600 transition-colors flex items-center gap-2">
              <span>情侣画板 · 你画我猜</span>
              <span class="text-xs bg-rose-500 text-white font-bold px-2 py-0.5 rounded-md">NEW</span>
            </h3>

            <p class="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
              HTML5 Canvas 互动涂鸦！一人执笔勾勒私密默契，一人脑洞大开实时猜词。
            </p>

            <!-- 亮点标签群 -->
            <div class="mt-4 flex flex-wrap gap-1.5 text-[11px]">
              <span class="px-2.5 py-0.8 rounded-lg bg-rose-50 text-rose-700 border border-rose-100 font-medium">
                💖 50+私密情侣词库
              </span>
              <span class="px-2.5 py-0.8 rounded-lg bg-pink-50 text-pink-700 border border-pink-100 font-medium">
                💮 情侣表情图章戳
              </span>
              <span class="px-2.5 py-0.8 rounded-lg bg-amber-50 text-amber-700 border border-amber-100 font-medium">
                🧠 智能拼音/错字容错
              </span>
              <span class="px-2.5 py-0.8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 font-medium">
                📱 9:16手机壁纸导出
              </span>
            </div>
          </div>

          <div class="mt-6 pt-4 border-t border-rose-100 flex items-center justify-between text-xs font-bold text-rose-600">
            <span>进入情侣画室绘出默契</span>
            <span class="text-base group-hover:translate-x-1.5 transition-transform">&rarr;</span>
          </div>
        </div>

        <!-- 游戏 12：盲人领航员 · 迷宫协作 -->
        <div 
          @click="activeGame = 'blind-nav'"
          class="glass-card rounded-3xl p-6 sm:p-7 border-2 border-emerald-100/90 hover:border-emerald-300 glow-hover cursor-pointer relative overflow-hidden group flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 bg-gradient-to-b from-white via-emerald-50/20 to-white shadow-sm hover:shadow-xl"
        >
          <div class="absolute -right-8 -top-8 w-28 h-28 bg-emerald-200/30 rounded-full blur-xl group-hover:scale-125 transition-transform"></div>

          <div>
            <div class="flex items-center justify-between mb-4">
              <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-3xl text-white shadow-md shadow-emerald-300/40 group-hover:scale-110 group-hover:-rotate-6 transition-all">
                🧭
              </div>
              <div class="flex items-center gap-2">
                <span class="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  游戏 12 · 进阶版
                </span>
              </div>
            </div>

            <h3 class="text-lg sm:text-xl font-black text-slate-800 group-hover:text-emerald-600 transition-colors flex items-center gap-2">
              <span>盲人领航员 · 迷宫双人协作</span>
              <span class="text-xs bg-emerald-500 text-white font-bold px-2 py-0.5 rounded-md">HOT</span>
            </h3>

            <p class="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
              一人全图视角放置爱心灯塔信标发号施令，一人置身迷雾凭借信标光晕与信任听音突围！
            </p>

            <!-- 亮点标签群 -->
            <div class="mt-4 flex flex-wrap gap-1.5 text-[11px]">
              <span class="px-2.5 py-0.8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 font-medium">
                🌲 7x7/9x9/11x11三档地图
              </span>
              <span class="px-2.5 py-0.8 rounded-lg bg-pink-50 text-pink-700 border border-pink-100 font-medium">
                🏮 领航员爱心信标放置
              </span>
              <span class="px-2.5 py-0.8 rounded-lg bg-teal-50 text-teal-700 border border-teal-100 font-medium">
                🕹️ 触控虚拟摇杆走位
              </span>
              <span class="px-2.5 py-0.8 rounded-lg bg-amber-50 text-amber-700 border border-amber-100 font-medium">
                🏆 SSS神仙默契通关评级
              </span>
            </div>
          </div>

          <div class="mt-6 pt-4 border-t border-emerald-100 flex items-center justify-between text-xs font-bold text-emerald-600">
            <span>开启双重视角迷宫配合</span>
            <span class="text-base group-hover:translate-x-1.5 transition-transform">&rarr;</span>
          </div>
        </div>

      </div>

      <!-- 协同默契共振贴士 -->
      <div class="glass-card rounded-2xl p-4 border border-emerald-100/80 bg-white/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div class="flex items-center gap-2">
          <span class="text-base">💡</span>
          <span><strong>双人通关秘籍</strong>：建议两人同时戴上耳机或在身边开麦协作，配合呼吸与心跳节拍通关体验更佳！</span>
        </div>
        <div class="font-bold text-emerald-700 shrink-0">
          已联动机内恋爱树成长系统 🌳
        </div>
      </div>
    </div>

    <!-- 游戏视图路由 -->
    <div v-else class="transition-all duration-300">
      <CoDrawGame v-if="activeGame === 'co-draw'" @back="activeGame = null" />
      <BlindNavGame v-else-if="activeGame === 'blind-nav'" @back="activeGame = null" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import CoDrawGame from './你画我猜.vue'
import BlindNavGame from './盲人领航员.vue'

defineEmits(['back'])
const activeGame = ref(null)
</script>
