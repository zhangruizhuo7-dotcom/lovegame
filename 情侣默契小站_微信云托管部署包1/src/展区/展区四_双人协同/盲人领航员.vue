<template>
  <div class="space-y-6 relative">
    <!-- 受伤红屏闪烁蒙层 -->
    <div 
      v-if="isHurt" 
      class="fixed inset-0 pointer-events-none z-50 bg-rose-600/30 animate-pulse backdrop-blur-[1px] transition-opacity duration-300"
    ></div>

    <!-- 顶部状态栏 -->
    <div class="glass-card rounded-3xl p-5 border-2 border-emerald-100 shadow-sm relative overflow-hidden bg-white/90">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <button 
            @click="$emit('back')"
            class="w-10 h-10 rounded-2xl bg-white border border-slate-200 hover:border-emerald-400 flex items-center justify-center text-slate-600 hover:text-emerald-600 shadow-xs transition-all hover:scale-105 active:scale-95"
            title="返回展区四"
          >
            &larr;
          </button>
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-2xl">🧭</span>
              <h2 class="text-lg sm:text-xl font-extrabold text-slate-800">盲人领航员 · 双人迷宫协作</h2>
              <span class="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200">
                关卡进阶版
              </span>
            </div>
            <p class="text-xs text-slate-500 mt-0.5">
              一人看清全图放置爱心信标与指令，一人置身迷雾凭借信标光晕与信任摸索突围！
            </p>
          </div>
        </div>

        <!-- 视角切换器 -->
        <div class="flex items-center gap-2 bg-emerald-50/90 p-1.5 rounded-2xl border border-emerald-200/80 self-start sm:self-auto shadow-2xs">
          <button
            @click="switchView('navigator')"
            :class="viewMode === 'navigator' ? 'bg-emerald-600 text-white shadow-xs font-bold' : 'text-emerald-700 hover:bg-emerald-100/60'"
            class="px-3 py-1.5 rounded-xl text-xs sm:text-sm transition-all flex items-center gap-1.5"
          >
            <span>🗺️ 领航员视角</span>
            <span class="text-[10px] opacity-90">(全图视野/放信标)</span>
          </button>
          <button
            @click="switchView('explorer')"
            :class="viewMode === 'explorer' ? 'bg-teal-600 text-white shadow-xs font-bold' : 'text-teal-700 hover:bg-teal-100/60'"
            class="px-3 py-1.5 rounded-xl text-xs sm:text-sm transition-all flex items-center gap-1.5"
          >
            <span>🌫️ 探索者视角</span>
            <span class="text-[10px] opacity-90">(迷雾/感知光晕)</span>
          </button>
        </div>
      </div>

      <!-- 难度档位选择体系 -->
      <div class="mt-4 pt-3.5 border-t border-emerald-50 flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-2">
          <span class="text-xs font-bold text-slate-500 shrink-0">难度关卡:</span>
          <div class="flex items-center gap-1.5 flex-wrap">
            <button
              v-for="(diff, key) in difficultyLevels"
              :key="key"
              @click="selectDifficulty(key)"
              :class="currentDiffKey === key ? 'bg-emerald-500 text-white shadow-xs font-bold border-emerald-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200'"
              class="px-3 py-1 rounded-xl text-xs border transition-all flex items-center gap-1"
            >
              <span>{{ diff.icon }}</span>
              <span>{{ diff.name }}</span>
              <span class="text-[10px] opacity-80">({{ diff.size }}x{{ diff.size }})</span>
            </button>
          </div>
        </div>

        <div class="flex items-center gap-2 text-xs text-slate-500">
          <span class="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md border border-amber-200">
            ⭐ 目标星: {{ levels[currentDiffKey].totalStars }}
          </span>
          <span class="inline-flex items-center gap-1 bg-rose-50 text-rose-700 px-2 py-0.5 rounded-md border border-rose-200">
            ⚠️ 陷阱: {{ levels[currentDiffKey].trapsCount }}
          </span>
        </div>
      </div>
    </div>

    <!-- 游戏主交互面板 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      
      <!-- 左侧 2 列：迷宫地图展示区 -->
      <div 
        :class="{ 'animate-shake ring-4 ring-rose-400': isHurt }"
        class="lg:col-span-2 glass-card rounded-3xl p-4 sm:p-5 border-2 border-emerald-100 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-200"
      >
        <!-- 顶部信息栏：倒计时、生命值、星星与信标提示 -->
        <div class="w-full flex flex-wrap items-center justify-between gap-2 mb-3 px-1 text-xs font-semibold">
          <div class="flex items-center gap-2.5 flex-wrap">
            <span class="flex items-center gap-1 text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200 shadow-2xs">
              ❤️ 生命: {{ hearts }} / 3
            </span>
            <span class="flex items-center gap-1 text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 shadow-2xs">
              ⭐ 星星: {{ collectedStars }} / {{ currentLevel.totalStars }}
            </span>
            <span class="flex items-center gap-1 text-pink-600 bg-pink-50 px-2.5 py-1 rounded-full border border-pink-200 shadow-2xs">
              🏮 信标: {{ beacons.length }}/2
            </span>
          </div>

          <div class="flex items-center gap-2">
            <span :class="timeLeft <= 15 ? 'text-rose-600 animate-pulse font-extrabold' : 'text-slate-700'" class="bg-slate-100 px-3 py-1 rounded-full border border-slate-200 font-mono shadow-2xs">
              ⏱️ 倒计时: {{ timeLeft }}s
            </span>
            <button 
              @click="resetGame" 
              class="px-2.5 py-1 text-slate-600 hover:text-emerald-700 bg-white border border-slate-200 hover:border-emerald-300 rounded-xl text-xs shadow-2xs transition-all active:scale-95"
            >
              🔄 重新开始
            </button>
          </div>
        </div>

        <!-- 领航员信标模式指引条 / 探索者信标指引条 -->
        <div class="w-full mb-3">
          <div 
            v-if="viewMode === 'navigator'" 
            class="bg-gradient-to-r from-pink-50 via-rose-50 to-amber-50 p-2.5 rounded-2xl border border-pink-200 text-xs text-rose-800 flex items-center justify-between gap-2 shadow-2xs"
          >
            <div class="flex items-center gap-1.5">
              <span class="text-base animate-bounce">💖</span>
              <span><strong>领航员特权</strong>：点击全图任意空地放置/取消<strong>“发光爱心灯塔”</strong>指引探索者！(最多2座)</span>
            </div>
            <button 
              v-if="beacons.length > 0"
              @click="beacons = []" 
              class="shrink-0 px-2 py-0.5 bg-white text-rose-600 border border-rose-200 hover:bg-rose-50 rounded-lg text-[11px] font-bold"
            >
              清空信标
            </button>
          </div>

          <div 
            v-else-if="nearestBeaconInfo" 
            class="bg-gradient-to-r from-teal-50 via-emerald-50 to-pink-50 p-2.5 rounded-2xl border border-teal-200 text-xs text-teal-800 flex items-center justify-between gap-2 shadow-2xs"
          >
            <div class="flex items-center gap-2">
              <span class="text-base animate-pulse">✨</span>
              <span>
                {{ nearestBeaconInfo.text }}
              </span>
            </div>
            <span class="px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 font-bold text-[11px]">
              距离 {{ nearestBeaconInfo.distance }} 格
            </span>
          </div>
        </div>

        <!-- 迷宫网格 -->
        <div class="relative bg-slate-950 p-2.5 sm:p-4 rounded-3xl shadow-2xl border-4 border-emerald-800/50 select-none overflow-hidden">
          
          <!-- 探索者感知到的全局迷雾微光呼吸波纹 -->
          <div 
            v-if="viewMode === 'explorer' && beacons.length > 0"
            class="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_center,rgba(244,63,94,0.4)_0%,transparent_70%)]"
          ></div>

          <div 
            class="grid gap-1 relative"
            :style="{
              gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
              width: currentGridSize,
              height: currentGridSize
            }"
          >
            <template v-for="(row, r) in maze" :key="'r-'+r">
              <div 
                v-for="(cell, c) in row" 
                :key="'c-'+c"
                @click="onCellClick(r, c)"
                class="rounded-lg flex items-center justify-center relative transition-all duration-200 text-xs sm:text-base font-bold cursor-pointer"
                :class="getCellClass(r, c)"
              >
                <!-- 玩家当前位置 (带柔和呼吸与微光) -->
                <div 
                  v-if="playerPos.r === r && playerPos.c === c" 
                  class="absolute inset-0 flex items-center justify-center z-30 text-lg sm:text-2xl transition-transform duration-150 animate-bounce-slow"
                >
                  <span class="filter drop-shadow-[0_0_8px_rgba(52,211,153,0.9)]">🚶‍♂️</span>
                </div>

                <!-- 领航员放置的爱心信标灯塔 (Beacon) -->
                <div 
                  v-if="isBeacon(r, c) && isBeaconVisible(r, c)"
                  class="absolute inset-0 flex items-center justify-center z-20"
                >
                  <span class="absolute w-full h-full rounded-full bg-pink-500/30 animate-ping"></span>
                  <span class="text-base sm:text-xl filter drop-shadow-[0_0_10px_rgba(244,63,94,0.9)] animate-pulse">
                    🏮
                  </span>
                </div>

                <!-- 终点爱心 -->
                <span 
                  v-else-if="goalPos.r === r && goalPos.c === c && isVisible(r, c)" 
                  class="text-rose-500 text-base sm:text-xl animate-pulse filter drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]"
                >
                  💖
                </span>

                <!-- 陷阱 (领航员可见，探索者近距离或踩中可见) -->
                <span 
                  v-else-if="cell === 2 && isVisible(r, c)" 
                  class="text-rose-400 text-xs sm:text-sm select-none animate-pulse"
                >
                  ⚠️
                </span>

                <!-- 默契星星 -->
                <span 
                  v-else-if="cell === 3 && isVisible(r, c)" 
                  class="text-amber-300 text-xs sm:text-base animate-bounce"
                >
                  ⭐
                </span>

                <!-- 迷雾中接近信标的光晕透出特效 -->
                <div 
                  v-if="viewMode === 'explorer' && !isVisible(r, c) && isNearBeacon(r, c)" 
                  class="absolute inset-0 rounded-lg bg-pink-500/20 shadow-[0_0_12px_rgba(244,63,94,0.4)] pointer-events-none animate-pulse"
                ></div>
              </div>
            </template>
          </div>
        </div>

        <!-- 视角责任底栏 -->
        <div class="mt-4 text-center max-w-lg">
          <p v-if="viewMode === 'navigator'" class="text-xs text-emerald-800 font-medium leading-relaxed">
            📢 <strong>领航员职责</strong>：天眼全开！在格子上点击放置 🏮 爱心信标，语音指挥对方规避 ⚠️ 陷阱，收集 ⭐ 星星，直奔 💖 终点！
          </p>
          <p v-else class="text-xs text-teal-800 font-medium leading-relaxed">
            🌫️ <strong>探索者职责</strong>：信赖对方的声音与穿透迷雾的 🏮 暖色光晕！使用虚拟摇杆或方向键稳健走位！
          </p>
        </div>
      </div>

      <!-- 右侧 1 列：操作控制器与协同互动栏 -->
      <div class="space-y-4 flex flex-col justify-between">
        
        <!-- 移动虚拟操控器 (支持摇杆/方向键双模切换) -->
        <div class="glass-card rounded-3xl p-5 border-2 border-emerald-100 flex flex-col items-center shadow-sm bg-white/90">
          <div class="w-full flex items-center justify-between mb-3 pb-2 border-b border-emerald-50">
            <h3 class="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <span>🎮 探索者移动控制器</span>
            </h3>
            <div class="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-[11px]">
              <button 
                @click="controlMode = 'joystick'"
                :class="controlMode === 'joystick' ? 'bg-white text-emerald-700 font-bold shadow-2xs' : 'text-slate-500'"
                class="px-2 py-0.5 rounded-lg transition-all"
              >
                🕹️ 摇杆
              </button>
              <button 
                @click="controlMode = 'dpad'"
                :class="controlMode === 'dpad' ? 'bg-white text-emerald-700 font-bold shadow-2xs' : 'text-slate-500'"
                class="px-2 py-0.5 rounded-lg transition-all"
              >
                ➕ 按键
              </button>
            </div>
          </div>

          <!-- 模式一：触控虚拟摇杆 -->
          <div v-if="controlMode === 'joystick'" class="py-2 flex flex-col items-center">
            <div 
              ref="joystickZone"
              @pointerdown="onJoystickStart"
              @pointermove="onJoystickMove"
              @pointerup="onJoystickEnd"
              @pointercancel="onJoystickEnd"
              class="relative w-40 h-40 rounded-full bg-gradient-to-b from-slate-900 to-slate-800 border-4 border-emerald-600/40 shadow-xl flex items-center justify-center touch-none select-none cursor-grab active:cursor-grabbing"
            >
              <!-- 摇杆十字基准刻度 -->
              <div class="absolute w-28 h-0.5 bg-emerald-500/20"></div>
              <div class="absolute h-28 w-0.5 bg-emerald-500/20"></div>
              <div class="absolute w-20 h-20 rounded-full border border-emerald-500/20 pointer-events-none"></div>

              <!-- 拖拽中心旋钮 -->
              <div 
                class="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center font-black shadow-lg shadow-emerald-500/30 transition-transform duration-75 select-none"
                :style="{ transform: `translate(${stickPos.x}px, ${stickPos.y}px)` }"
              >
                <span>🚶</span>
              </div>
            </div>
            <span class="text-[11px] text-slate-400 mt-2 font-medium">
              按住摇杆滑动控制角色走位 · 松手复位
            </span>
          </div>

          <!-- 模式二：经典十字按键 -->
          <div v-else class="grid grid-cols-3 gap-2 w-48 h-44 items-center justify-center">
            <div></div>
            <button 
              @click="movePlayer(-1, 0)" 
              :disabled="gameOver"
              class="w-14 h-14 bg-gradient-to-t from-emerald-500 to-teal-400 hover:from-emerald-600 hover:to-teal-500 active:scale-95 text-white rounded-2xl flex items-center justify-center text-xl font-bold shadow-md disabled:opacity-40 transition-transform"
            >
              ▲
            </button>
            <div></div>

            <button 
              @click="movePlayer(0, -1)" 
              :disabled="gameOver"
              class="w-14 h-14 bg-gradient-to-l from-emerald-500 to-teal-400 hover:from-emerald-600 hover:to-teal-500 active:scale-95 text-white rounded-2xl flex items-center justify-center text-xl font-bold shadow-md disabled:opacity-40 transition-transform"
            >
              ◀
            </button>
            <div class="flex flex-col items-center justify-center text-[10px] text-emerald-700 font-bold font-mono">
              <span>WALK</span>
            </div>
            <button 
              @click="movePlayer(0, 1)" 
              :disabled="gameOver"
              class="w-14 h-14 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-600 hover:to-teal-500 active:scale-95 text-white rounded-2xl flex items-center justify-center text-xl font-bold shadow-md disabled:opacity-40 transition-transform"
            >
              ▶
            </button>

            <div></div>
            <button 
              @click="movePlayer(1, 0)" 
              :disabled="gameOver"
              class="w-14 h-14 bg-gradient-to-b from-emerald-500 to-teal-400 hover:from-emerald-600 hover:to-teal-500 active:scale-95 text-white rounded-2xl flex items-center justify-center text-xl font-bold shadow-md disabled:opacity-40 transition-transform"
            >
              ▼
            </button>
            <div></div>
          </div>

          <div class="mt-2 text-[11px] text-slate-400 text-center">
            支持电脑键盘 ↑ ↓ ← → 或 W A S D 畅行操控
          </div>
        </div>

        <!-- 领航员快捷发令盒 -->
        <div class="glass-card rounded-3xl p-4 border border-emerald-100 bg-white/90 shadow-sm">
          <div class="flex items-center justify-between mb-2">
            <h4 class="text-xs font-bold text-emerald-800 flex items-center gap-1">
              <span>💬 领航员快捷发令盒</span>
            </h4>
            <span class="text-[10px] text-slate-400">点击触发语音播报</span>
          </div>

          <div class="grid grid-cols-2 gap-2 text-xs">
            <button 
              v-for="msg in quickTips" 
              :key="msg"
              @click="sendQuickTip(msg)"
              class="py-2 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl border border-emerald-200/60 text-left truncate transition-all hover:scale-102 active:scale-98 font-medium"
            >
              {{ msg }}
            </button>
          </div>
          
          <div v-if="currentTip" class="mt-2.5 p-2 bg-emerald-100/80 rounded-xl text-xs text-emerald-950 font-bold text-center animate-pulse border border-emerald-300">
            📢 领航指令：“{{ currentTip }}”
          </div>
        </div>

        <!-- 协作收益卡片 -->
        <div class="glass-card rounded-3xl p-4 border border-emerald-100 bg-gradient-to-r from-emerald-50/50 to-teal-50/40 text-xs text-slate-600">
          <div class="flex items-center justify-between font-bold text-emerald-900 mb-1">
            <span>🛡️ 协作信任培育</span>
            <span>通关 +30~60 经验</span>
          </div>
          <p class="text-[11px] text-slate-500 leading-relaxed">
            默契走位避开陷阱将大幅提升双人信任雷达分，并在恋爱树中结出协作果实！
          </p>
        </div>

      </div>

    </div>

    <!-- 胜利/失败通关结算评级弹窗 -->
    <div v-if="showResultModal" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border-4 border-emerald-200 text-center relative animate-scale">
        <div class="text-6xl my-2 animate-bounce">
          {{ isWin ? '🏆' : '💔' }}
        </div>
        <h3 class="text-xl font-black text-slate-800">
          {{ isWin ? '心有灵犀！默契突围！' : '哎呀，在迷宫中迷路了' }}
        </h3>
        <p class="text-xs text-slate-500 mt-1">
          {{ isWin ? '在浓雾与未知的考验中，彼此的声音就是最坚固的灯塔！' : '别灰心，调整口令战术，默契是在一次次配合中炼成的！' }}
        </p>

        <!-- 评级勋章 (根据综合算法打分) -->
        <div v-if="isWin" class="my-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md">
          <div class="text-xs uppercase tracking-wider text-emerald-100 font-bold">默契评级</div>
          <div class="text-3xl font-black tracking-widest mt-0.5 text-amber-200">
            {{ ratingResult.grade }}
          </div>
          <div class="text-sm font-bold mt-1 text-white">
            “{{ ratingResult.title }}”
          </div>
          <div class="text-[11px] text-emerald-100/90 mt-1">
            {{ ratingResult.desc }}
          </div>
        </div>

        <!-- 结算明细数据 -->
        <div class="grid grid-cols-3 gap-2 my-4 bg-slate-50 p-3 rounded-2xl text-xs border border-slate-100">
          <div>
            <p class="text-slate-400">剩余用时</p>
            <p class="font-bold text-slate-700 text-sm font-mono">{{ timeLeft }}s</p>
          </div>
          <div>
            <p class="text-slate-400">剩余生命</p>
            <p class="font-bold text-rose-600 text-sm">{{ hearts }} / 3 ❤️</p>
          </div>
          <div>
            <p class="text-slate-400">星星收集</p>
            <p class="font-bold text-amber-600 text-sm">{{ collectedStars }} / {{ currentLevel.totalStars }} ⭐</p>
          </div>
        </div>

        <!-- 恋爱树丰厚奖励展示 -->
        <div v-if="isWin" class="bg-emerald-50 p-2.5 rounded-xl text-xs text-emerald-800 font-bold mb-4 flex items-center justify-around border border-emerald-200">
          <span>💧 爱心水滴 +{{ currentLevel.reward.water }}</span>
          <span>☀️ 阳光养分 +{{ currentLevel.reward.sun }}</span>
          <span>🌱 经验 +{{ currentLevel.reward.exp }}</span>
        </div>

        <div class="flex gap-3">
          <button 
            @click="resetGame" 
            class="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors text-xs active:scale-95"
          >
            再战一局
          </button>
          <button 
            @click="$emit('back')" 
            class="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold transition-all text-xs shadow-md shadow-emerald-200 active:scale-95"
          >
            返回展区四
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { recordGameReward } from '@/状态/恋爱树状态.js'
import confetti from 'canvas-confetti'

defineEmits(['back'])

// 难度进阶配置表
const difficultyLevels = {
  easy: {
    name: '新手小径',
    icon: '🌱',
    size: 7,
    timeLimit: 60,
    trapsCount: 1,
    totalStars: 2,
    reward: { water: 3, sun: 3, exp: 25 },
    maze: [
      [0, 0, 0, 1, 0, 0, 0],
      [1, 1, 0, 1, 0, 1, 0],
      [0, 0, 0, 0, 0, 1, 3],
      [0, 1, 1, 1, 0, 1, 0],
      [0, 2, 0, 1, 0, 0, 0],
      [1, 1, 0, 0, 0, 1, 0],
      [3, 0, 0, 1, 0, 0, 0]
    ]
  },
  medium: {
    name: '默契之森',
    icon: '🌿',
    size: 9,
    timeLimit: 90,
    trapsCount: 2,
    totalStars: 3,
    reward: { water: 5, sun: 5, exp: 40 },
    maze: [
      [0, 0, 1, 0, 0, 0, 1, 0, 0],
      [1, 0, 1, 0, 1, 0, 1, 3, 1],
      [0, 0, 0, 0, 1, 0, 0, 0, 0],
      [0, 1, 1, 2, 1, 1, 1, 1, 0],
      [0, 3, 0, 0, 0, 0, 0, 1, 0],
      [1, 1, 1, 1, 0, 1, 0, 1, 0],
      [0, 0, 0, 1, 0, 1, 3, 0, 0],
      [0, 1, 0, 2, 0, 1, 1, 1, 0],
      [0, 1, 0, 0, 0, 0, 0, 0, 0]
    ]
  },
  hard: {
    name: '灵魂试炼',
    icon: '🔥',
    size: 11,
    timeLimit: 120,
    trapsCount: 4,
    totalStars: 4,
    reward: { water: 8, sun: 8, exp: 60 },
    maze: [
      [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
      [1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
      [0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 3],
      [0, 1, 1, 1, 2, 1, 1, 1, 0, 1, 0],
      [0, 3, 0, 1, 0, 0, 0, 1, 0, 0, 0],
      [1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0],
      [0, 0, 2, 0, 0, 1, 0, 2, 0, 1, 0],
      [0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0],
      [0, 1, 3, 0, 0, 1, 0, 0, 0, 0, 0],
      [0, 1, 1, 1, 0, 1, 1, 1, 1, 2, 1],
      [0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0]
    ]
  }
}

const levels = difficultyLevels
const currentDiffKey = ref('medium')
const currentLevel = computed(() => difficultyLevels[currentDiffKey.value])

// 地图尺寸
const rows = computed(() => currentLevel.value.size)
const cols = computed(() => currentLevel.value.size)
const maze = ref(JSON.parse(JSON.stringify(currentLevel.value.maze)))
const playerPos = ref({ r: 0, c: 0 })
const goalPos = computed(() => ({ r: rows.value - 1, c: cols.value - 1 }))

// 视角与信标状态
const viewMode = ref('navigator') // 'navigator' | 'explorer'
const beacons = ref([]) // [{ r, c }] 领航员爱心灯塔信标列表
const controlMode = ref('joystick') // 'joystick' | 'dpad'

// 基础数值
const hearts = ref(3)
const collectedStars = ref(0)
const timeLeft = ref(currentLevel.value.timeLimit)
const gameOver = ref(false)
const isWin = ref(false)
const isHurt = ref(false)
const showResultModal = ref(false)
const currentTip = ref('')

let timer = null

// 领航员快捷发令短语
const quickTips = [
  '往前走两格！',
  '前方有陷阱，绕道！',
  '向右转吃星星！',
  '停一下，不要动！',
  '我放了爱心灯塔，朝光走！',
  '完全听我的，冲！'
]

// 触控摇杆状态
const stickPos = ref({ x: 0, y: 0 })
let joystickActive = false
let joystickCenter = { x: 0, y: 0 }
let lastJoystickMoveTime = 0
const joystickZone = ref(null)

// 响应式迷宫大小计算
const currentGridSize = computed(() => {
  if (cols.value === 7) return 'min(78vw, 380px)'
  if (cols.value === 9) return 'min(78vw, 420px)'
  return 'min(82vw, 450px)'
})

function switchView(mode) {
  viewMode.value = mode
}

function selectDifficulty(key) {
  if (currentDiffKey.value === key) return
  currentDiffKey.value = key
  resetGame()
}

function startTimer() {
  clearInterval(timer)
  timer = setInterval(() => {
    if (timeLeft.value > 0 && !gameOver.value) {
      timeLeft.value--
    } else if (timeLeft.value <= 0 && !gameOver.value) {
      endGame(false)
    }
  }, 1000)
}

// 信标操作：领航员可在全图任意非墙格子放置信标
function onCellClick(r, c) {
  if (viewMode.value !== 'navigator' || gameOver.value) return
  
  // 不能放在墙上
  if (maze.value[r][c] === 1) return

  const existingIndex = beacons.value.findIndex(b => b.r === r && b.c === c)
  if (existingIndex >= 0) {
    // 再次点击取消信标
    beacons.value.splice(existingIndex, 1)
    currentTip.value = '已收回该处爱心信标'
  } else {
    // 最多放 2 个信标
    if (beacons.value.length >= 2) {
      beacons.value.shift() // 替换最旧的一个
    }
    beacons.value.push({ r, c })
    currentTip.value = '🏮 爱心灯塔已点亮！探索者能感知到光芒指引！'
  }
}

function isBeacon(r, c) {
  return beacons.value.some(b => b.r === r && b.c === c)
}

function isBeaconVisible(r, c) {
  if (viewMode.value === 'navigator') return true
  // 探索者在距离信标 <= 2 格以内即可看见信标本体
  const dr = Math.abs(r - playerPos.value.r)
  const dc = Math.abs(c - playerPos.value.c)
  return dr <= 2 && dc <= 2
}

// 探索者迷雾可视范围计算
function isVisible(r, c) {
  if (viewMode.value === 'navigator') return true
  // 探索者基础视野：当前格及周围 1 格
  const dr = Math.abs(r - playerPos.value.r)
  const dc = Math.abs(c - playerPos.value.c)
  return dr <= 1 && dc <= 1
}

// 探索者是否在信标光晕感应范围内 (距离 <= 3)
function isNearBeacon(r, c) {
  return beacons.value.some(b => {
    const dr = Math.abs(r - b.r)
    const dc = Math.abs(c - b.c)
    return dr <= 1 && dc <= 1
  })
}

// 最近信标距离与指引文本
const nearestBeaconInfo = computed(() => {
  if (beacons.value.length === 0) return null
  let minDistance = 999
  let nearestB = null
  for (const b of beacons.value) {
    const dist = Math.abs(b.r - playerPos.value.r) + Math.abs(b.c - playerPos.value.c)
    if (dist < minDistance) {
      minDistance = dist
      nearestB = b
    }
  }

  let dir = ''
  const dr = nearestB.r - playerPos.value.r
  const dc = nearestB.c - playerPos.value.c
  if (dr < 0 && Math.abs(dr) >= Math.abs(dc)) dir = '北 (上方)'
  else if (dr > 0 && Math.abs(dr) >= Math.abs(dc)) dir = '南 (下方)'
  else if (dc > 0) dir = '东 (右侧)'
  else if (dc < 0) dir = '西 (左侧)'

  return {
    distance: minDistance,
    text: `🏮 领航信标指引：正向【${dir}】散发温暖光晕`
  }
})

function getCellClass(r, c) {
  const visible = isVisible(r, c)
  if (!visible) {
    if (viewMode.value === 'explorer' && isNearBeacon(r, c)) {
      return 'bg-pink-950/60 border border-pink-700/40'
    }
    return 'bg-slate-950 border border-slate-900/60'
  }

  const val = maze.value[r][c]
  if (val === 1) {
    return 'bg-emerald-950 border border-emerald-800 shadow-inner'
  } else if (r === goalPos.value.r && c === goalPos.value.c) {
    return 'bg-rose-500/25 border-2 border-rose-400'
  } else if (isBeacon(r, c)) {
    return 'bg-pink-500/20 border-2 border-pink-400 shadow-[0_0_15px_rgba(244,63,94,0.4)]'
  } else {
    return 'bg-slate-800/80 border border-slate-700/60 hover:bg-slate-800'
  }
}

// 角色移动与触发机制
function movePlayer(dr, dc) {
  if (gameOver.value) return

  const nr = playerPos.value.r + dr
  const nc = playerPos.value.c + dc

  if (nr < 0 || nr >= rows.value || nc < 0 || nc >= cols.value) return
  if (maze.value[nr][nc] === 1) return // 撞墙

  playerPos.value = { r: nr, c: nc }

  // 检查踩陷阱
  if (maze.value[nr][nc] === 2) {
    hearts.value--
    triggerHurtFeedback()
    if (hearts.value <= 0) {
      endGame(false)
      return
    }
  }

  // 检查收集星星
  if (maze.value[nr][nc] === 3) {
    collectedStars.value++
    maze.value[nr][nc] = 0 // 吃掉
    currentTip.value = '太棒了！收集到 1 颗默契星！'
  }

  // 检查到达终点
  if (nr === goalPos.value.r && nc === goalPos.value.c) {
    endGame(true)
  }
}

// 踩陷阱震动与红屏反馈
function triggerHurtFeedback() {
  isHurt.value = true
  currentTip.value = '⚠️ 糟糕！踩中陷阱扣除 1 颗生命！'
  
  // 触觉震动反馈 (支持移动端)
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
      navigator.vibrate([100, 60, 100])
    } catch (e) {}
  }

  setTimeout(() => {
    isHurt.value = false
  }, 450)
}

function sendQuickTip(msg) {
  currentTip.value = msg
}

// 触控虚拟摇杆核心交互
function onJoystickStart(e) {
  if (gameOver.value) return
  joystickActive = true
  const rect = joystickZone.value.getBoundingClientRect()
  joystickCenter = {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2
  }
  handleJoystickMove(e.clientX, e.clientY)
}

function onJoystickMove(e) {
  if (!joystickActive) return
  handleJoystickMove(e.clientX, e.clientY)
}

function onJoystickEnd() {
  joystickActive = false
  stickPos.value = { x: 0, y: 0 }
}

function handleJoystickMove(clientX, clientY) {
  const dx = clientX - joystickCenter.x
  const dy = clientY - joystickCenter.y
  const distance = Math.hypot(dx, dy)
  const maxRadius = 38 // 摇杆最大偏移半径

  const angle = Math.atan2(dy, dx)
  const clampedDist = Math.min(distance, maxRadius)

  stickPos.value = {
    x: Math.cos(angle) * clampedDist,
    y: Math.sin(angle) * clampedDist
  }

  // 触发方向判定 (死区阈值 18px，节流 180ms)
  const now = Date.now()
  if (distance >= 18 && now - lastJoystickMoveTime > 180) {
    lastJoystickMoveTime = now
    // 判定主方向：上、下、左、右
    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0) movePlayer(0, 1)  // 右
      else movePlayer(0, -1)        // 左
    } else {
      if (dy > 0) movePlayer(1, 0)  // 下
      else movePlayer(-1, 0)        // 上
    }
  }
}

// 评级与称号计算
const ratingResult = computed(() => {
  if (!isWin.value) {
    return {
      grade: 'B',
      title: '风雨同行 · 尚有提升',
      desc: '在未知中共同探索，每一次前进都是爱情的足迹。'
    }
  }

  const lifeScore = (hearts.value / 3) * 40
  const starScore = (collectedStars.value / currentLevel.value.totalStars) * 40
  const timeScore = (timeLeft.value / currentLevel.value.timeLimit) * 20
  const total = Math.round(lifeScore + starScore + timeScore)

  if (hearts.value === 3 && collectedStars.value === currentLevel.value.totalStars && total >= 88) {
    return {
      grade: 'SSS',
      title: '灵魂共振 · 绝世神仙默契',
      desc: '满血零失误神速通关！你们的心电感应已经突破了三维空间的限制！'
    }
  } else if (hearts.value >= 2 && total >= 70) {
    return {
      grade: 'SS',
      title: '心有灵犀 · 绝佳搭档',
      desc: '极高的信任度与执行力，迷雾根本挡不住你们奔赴彼此的坚定步伐！'
    }
  } else {
    return {
      grade: 'S',
      title: '历经考验 · 情比金坚',
      desc: '即使踩中陷阱也能重整旗鼓，彼此扶持走出迷雾森林！'
    }
  }
})

function endGame(win) {
  gameOver.value = true
  isWin.value = win
  clearInterval(timer)
  showResultModal.value = true

  if (win) {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })
    } catch (e) {}

    // 奖励恋爱树
    recordGameReward('blind-nav', {
      water: currentLevel.value.reward.water,
      sun: currentLevel.value.reward.sun,
      exp: currentLevel.value.reward.exp,
      radarCategory: '协作信任',
      radarDelta: 4
    })
  }
}

function resetGame() {
  maze.value = JSON.parse(JSON.stringify(currentLevel.value.maze))
  playerPos.value = { r: 0, c: 0 }
  hearts.value = 3
  collectedStars.value = 0
  timeLeft.value = currentLevel.value.timeLimit
  gameOver.value = false
  isWin.value = false
  isHurt.value = false
  showResultModal.value = false
  currentTip.value = ''
  beacons.value = []
  stickPos.value = { x: 0, y: 0 }
  startTimer()
}

function handleKeydown(e) {
  switch (e.key) {
    case 'ArrowUp':
    case 'w':
    case 'W':
      movePlayer(-1, 0)
      break
    case 'ArrowDown':
    case 's':
    case 'S':
      movePlayer(1, 0)
      break
    case 'ArrowLeft':
    case 'a':
    case 'A':
      movePlayer(0, -1)
      break
    case 'ArrowRight':
    case 'd':
    case 'D':
      movePlayer(0, 1)
      break
  }
}

onMounted(() => {
  resetGame()
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  clearInterval(timer)
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-6px); }
  40%, 80% { transform: translateX(6px); }
}

.animate-shake {
  animation: shake 0.35s ease-in-out;
}

@keyframes bounceSlow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

.animate-bounce-slow {
  animation: bounceSlow 1.5s infinite ease-in-out;
}

@keyframes scaleIn {
  from {
    transform: scale(0.92);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.animate-scale {
  animation: scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
