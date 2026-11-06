<template>
  <header class="glass-card sticky top-0 z-40 px-3 sm:px-4 py-2 sm:py-3 border-b border-rose-100 shadow-sm transition-all safe-top">
    <div class="max-w-6xl mx-auto flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 sm:gap-3">
      
      <!-- 站名与情侣身份 -->
      <div class="flex items-center justify-between w-full sm:w-auto">
        <div class="flex items-center space-x-2.5">
          <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-400 flex items-center justify-center text-white shadow-md shadow-rose-200 text-lg sm:text-xl font-bold shrink-0">
            ❤️
          </div>
          <div>
            <div class="flex items-center space-x-1.5">
              <h1 class="text-sm sm:text-lg font-black text-slate-800 tracking-tight">情侣默契小站</h1>
              <span class="text-[9px] sm:text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded-full font-bold">双机联机</span>
            </div>
            
            <!-- 当前登录者提示 -->
            <p v-if="authState.user" class="text-[11px] sm:text-xs text-slate-500 flex items-center gap-1 mt-0.5">
              <span class="font-bold text-slate-600">我:</span>
              <span :class="authState.user.gender === 'male' ? 'text-sky-600' : 'text-pink-600'" class="font-bold truncate max-w-[80px] sm:max-w-none">
                {{ authState.user.gender === 'male' ? '👦' : '👧' }} {{ authState.user.nickname }}
              </span>
              <button @click="logoutUser" class="text-[10px] text-slate-400 hover:text-rose-500 underline ml-0.5">
                换号
              </button>
            </p>
          </div>
        </div>

        <!-- 手机端右侧紧凑操作区 -->
        <div class="flex items-center gap-1.5 sm:hidden">
          <div class="flex items-center gap-1.5 bg-rose-50/90 px-2 py-1 rounded-full border border-rose-200/60 text-[10px] font-semibold">
            <span class="text-sky-600">💧{{ appState.loveTree.waterDrops }}</span>
            <span class="text-amber-600">☀️{{ appState.loveTree.sunlight }}</span>
          </div>
          <button 
            @click="$emit('toggleTree')"
            class="flex items-center gap-1 px-2.5 py-1 bg-emerald-500 active:bg-emerald-600 text-white rounded-full text-[11px] font-bold shadow-xs active:scale-95 transition-transform"
          >
            <span>🌳 Lv.{{ appState.loveTree.level }}</span>
          </button>
        </div>
      </div>

      <!-- 中间：双端在线状态实时指示器（移动端全宽自适应胶囊） -->
      <div class="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-2 bg-white/95 px-3 py-1.5 rounded-2xl border border-rose-200 shadow-2xs text-[11px] sm:text-xs">
        
        <!-- 男生在线点 -->
        <div class="flex items-center gap-1.5 truncate">
          <span :class="authState.presence.male.online ? 'bg-emerald-500 shadow-emerald-200' : 'bg-slate-300'" class="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full shrink-0 shadow-sm animate-pulse"></span>
          <span :class="authState.presence.male.online ? 'text-slate-800 font-bold' : 'text-slate-400'" class="truncate">
            👦 {{ authState.presence.male.online ? (authState.presence.male.nickname || '男生在线') : '男生离线' }}
          </span>
        </div>

        <span class="text-rose-200 shrink-0">|</span>

        <!-- 女生在线点 -->
        <div class="flex items-center gap-1.5 truncate">
          <span :class="authState.presence.female.online ? 'bg-pink-500 shadow-pink-200' : 'bg-slate-300'" class="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full shrink-0 shadow-sm animate-pulse"></span>
          <span :class="authState.presence.female.online ? 'text-slate-800 font-bold' : 'text-slate-400'" class="truncate">
            👧 {{ authState.presence.female.online ? (authState.presence.female.nickname || '女生在线') : '女生离线' }}
          </span>
        </div>

        <!-- 双端就绪状态徽章 -->
        <span 
          :class="authState.presence.bothOnline ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-amber-100 text-amber-800 border-amber-300'"
          class="px-2 py-0.5 rounded-md text-[10px] font-bold border shrink-0"
        >
          {{ authState.presence.bothOnline ? '💚 双方就绪' : '⏳ 待连线' }}
        </span>
      </div>

      <!-- PC端右侧：资源与恋爱树入口 -->
      <div class="hidden sm:flex items-center space-x-3">
        <!-- 资源计数 -->
        <div class="flex items-center gap-2 bg-rose-50/80 px-2.5 py-1.5 rounded-full border border-rose-200/60 text-xs font-semibold">
          <span class="flex items-center text-sky-600 gap-1" title="爱心水滴">
            💧 {{ appState.loveTree.waterDrops }}
          </span>
          <span class="text-rose-200">|</span>
          <span class="flex items-center text-amber-600 gap-1" title="阳光养分">
            ☀️ {{ appState.loveTree.sunlight }}
          </span>
        </div>

        <!-- 恋爱树快捷开关按钮 -->
        <button 
          @click="$emit('toggleTree')"
          class="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full text-xs sm:text-sm font-medium shadow-sm hover:shadow hover:scale-105 active:scale-95 transition-all"
        >
          <span>🌳 恋爱树</span>
          <span class="bg-white/20 px-1.5 py-0.2 rounded text-[11px]">Lv.{{ appState.loveTree.level }}</span>
        </button>
      </div>

    </div>
  </header>
</template>

<script setup>
import { appState } from '../状态/恋爱树状态.js'
import { authState, logoutUser } from '../网络/联机服务.js'
defineEmits(['toggleTree'])
</script>
