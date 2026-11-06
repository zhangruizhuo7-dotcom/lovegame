<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-br from-rose-50/70 via-orange-50/50 to-pink-50/70 text-slate-800">
    
    <!-- 登录与角色创建弹窗（未登录时强制弹出） -->
    <AuthModal />

    <!-- 顶部状态与双端在线导航 -->
    <TopNav @toggleTree="showTree = !showTree" />

    <!-- 伴侣游戏邀请横幅（实时双端通知） -->
    <div 
      v-if="authState.partnerInvitedGame && activeZone !== getZoneOfGame(authState.partnerInvitedGame.gameId)"
      class="max-w-6xl w-full mx-auto px-4 mt-3 animate-bounce-slow"
    >
      <div class="bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-2xl p-3.5 shadow-lg flex items-center justify-between">
        <div class="flex items-center gap-2 text-xs sm:text-sm font-bold">
          <span>🔔</span>
          <span>
            你的另一半 {{ authState.partnerInvitedGame.sender?.nickname }} 正在等待你加入游戏！
          </span>
        </div>
        <button 
          @click="joinPartnerGame"
          class="bg-white text-rose-600 px-3 py-1.5 rounded-xl font-black text-xs hover:scale-105 active:scale-95 transition-all shadow-sm"
        >
          立即前往 &rarr;
        </button>
      </div>
    </div>

    <!-- 主容器 -->
    <main class="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-4 py-4 sm:py-7">
      
      <!-- 恋爱树展台（支持折叠/常显） -->
      <div v-show="showTree" class="transition-all duration-300">
        <LoveTreePanel />
      </div>

      <!-- 双机连线指南卡片（当未完全双端在线时展示） -->
      <div v-if="!authState.presence.bothOnline" class="glass-card rounded-2xl p-4 border border-amber-200 bg-amber-50/60 mb-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div class="flex items-center gap-2.5">
          <span class="text-2xl">📡</span>
          <div>
            <p class="font-bold text-amber-900">支持两台设备在线上共同操作！如何连接伴侣？</p>
            <p class="text-slate-600 text-[11px] mt-0.5">
              女朋友用手机连接同一 Wi-Fi，在手机浏览器中输入：
              <code class="bg-white px-2 py-0.5 rounded font-mono font-bold text-rose-600 border border-amber-200">{{ localWifiUrl }}</code>
              ，创建【👧 女生】角色即可自动实时连线！
            </p>
          </div>
        </div>
        <button 
          @click="copyWifiUrl" 
          class="px-3 py-1.5 bg-white border border-amber-300 rounded-xl font-bold text-amber-800 hover:bg-amber-100 transition-colors whitespace-nowrap"
        >
          {{ copied ? '已复制网址！' : '复制网址给对方' }}
        </button>
      </div>

      <!-- 快捷折叠/展开恋爱树提示条 -->
      <div class="flex justify-between items-center mb-6 px-1">
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
          <h2 class="text-lg sm:text-xl font-extrabold text-slate-800 tracking-tight">
            {{ activeZone ? getZoneTitle(activeZone) : '四大主题游戏展区（双机协同）' }}
          </h2>
        </div>

        <div class="flex items-center gap-2">
          <button 
            v-if="activeZone"
            @click="activeZone = null"
            class="text-xs sm:text-sm text-rose-600 hover:text-rose-700 bg-white/80 px-3 py-1.5 rounded-full border border-rose-200 shadow-2xs font-medium transition-all"
          >
            &larr; 返回所有展区
          </button>
          
          <button 
            @click="showTree = !showTree" 
            class="text-xs text-slate-500 hover:text-slate-700 bg-white/70 px-2.5 py-1 rounded-full border border-slate-200/70"
          >
            {{ showTree ? '收起恋爱树 ▲' : '展开恋爱树 ▼' }}
          </button>
        </div>
      </div>

      <!-- 视图A：四展区全景总览入口卡片（当未选择特定展区时展示） -->
      <div v-if="!activeZone" class="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        
        <!-- 展区一：心有灵犀 -->
        <div 
          @click="activeZone = 'zone1'"
          class="glass-card rounded-3xl p-6 border-2 border-rose-100 hover:border-rose-300 glow-hover cursor-pointer relative overflow-hidden group"
        >
          <div class="flex items-start justify-between">
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-400 flex items-center justify-center text-3xl text-white shadow-md shadow-rose-200 group-hover:scale-110 transition-transform">
              ✨
            </div>
            <span class="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200/60">
              4 款游戏 · 双机同步
            </span>
          </div>
          <div class="mt-4">
            <h3 class="text-lg font-bold text-slate-800 group-hover:text-rose-600 transition-colors">
              展区一：心有灵犀
            </h3>
            <p class="text-xs text-slate-500 mt-1 line-clamp-2">
              直觉与潜意识碰撞：心跳同频、猜猜他会选什么、同频刻度尺、词汇同频接龙。
            </p>
          </div>
          <div class="mt-4 flex flex-wrap gap-1.5">
            <span class="text-[11px] bg-white/80 px-2 py-0.5 rounded-md text-slate-600 border border-slate-100">极速二选一</span>
            <span class="text-[11px] bg-white/80 px-2 py-0.5 rounded-md text-slate-600 border border-slate-100">换位盲盒</span>
            <span class="text-[11px] bg-white/80 px-2 py-0.5 rounded-md text-slate-600 border border-slate-100">1-10分打分</span>
            <span class="text-[11px] bg-white/80 px-2 py-0.5 rounded-md text-slate-600 border border-slate-100">电波暗号</span>
          </div>
          <div class="mt-4 pt-3 border-t border-rose-50 flex items-center justify-between text-xs font-semibold text-rose-600">
            <span>双机进入同步答题</span>
            <span class="group-hover:translate-x-1 transition-transform">&rarr;</span>
          </div>
        </div>

        <!-- 展区二：换位共情 -->
        <div 
          @click="activeZone = 'zone2'"
          class="glass-card rounded-3xl p-6 border-2 border-orange-100 hover:border-orange-300 glow-hover cursor-pointer relative overflow-hidden group"
        >
          <div class="flex items-start justify-between">
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center text-3xl text-white shadow-md shadow-orange-200 group-hover:scale-110 transition-transform">
              💌
            </div>
            <span class="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200/60">
              3 款游戏 · 双端互动
            </span>
          </div>
          <div class="mt-4">
            <h3 class="text-lg font-bold text-slate-800 group-hover:text-amber-600 transition-colors">
              展区二：换位共情
            </h3>
            <p class="text-xs text-slate-500 mt-1 line-clamp-2">
              深度理解与线下互动：假如我是你场景模拟、甜蜜小惩罚转盘、心愿券默契盲盒。
            </p>
          </div>
          <div class="mt-4 flex flex-wrap gap-1.5">
            <span class="text-[11px] bg-white/80 px-2 py-0.5 rounded-md text-slate-600 border border-slate-100">情境模拟</span>
            <span class="text-[11px] bg-white/80 px-2 py-0.5 rounded-md text-slate-600 border border-slate-100">双机转盘</span>
            <span class="text-[11px] bg-white/80 px-2 py-0.5 rounded-md text-slate-600 border border-slate-100">心愿特权兑换</span>
          </div>
          <div class="mt-4 pt-3 border-t border-orange-50 flex items-center justify-between text-xs font-semibold text-amber-600">
            <span>双机进入增进理解</span>
            <span class="group-hover:translate-x-1 transition-transform">&rarr;</span>
          </div>
        </div>

        <!-- 展区三：时光胶囊 -->
        <div 
          @click="activeZone = 'zone3'"
          class="glass-card rounded-3xl p-6 border-2 border-violet-100 hover:border-violet-300 glow-hover cursor-pointer relative overflow-hidden group"
        >
          <div class="flex items-start justify-between">
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-500 to-purple-400 flex items-center justify-center text-3xl text-white shadow-md shadow-violet-200 group-hover:scale-110 transition-transform">
              📷
            </div>
            <span class="text-xs font-bold text-violet-700 bg-violet-50 px-3 py-1 rounded-full border border-violet-200/60">
              3 款游戏 · 记忆沉淀
            </span>
          </div>
          <div class="mt-4">
            <h3 class="text-lg font-bold text-slate-800 group-hover:text-violet-600 transition-colors">
              展区三：时光胶囊
            </h3>
            <p class="text-xs text-slate-500 mt-1 line-clamp-2">
              独家浪漫回忆沉淀：我们的恋爱时间线排序、回忆碎片拼图、时光显微镜照片竞猜。
            </p>
          </div>
          <div class="mt-4 flex flex-wrap gap-1.5">
            <span class="text-[11px] bg-white/80 px-2 py-0.5 rounded-md text-slate-600 border border-slate-100">里程碑时序</span>
            <span class="text-[11px] bg-white/80 px-2 py-0.5 rounded-md text-slate-600 border border-slate-100">照片拼图</span>
            <span class="text-[11px] bg-white/80 px-2 py-0.5 rounded-md text-slate-600 border border-slate-100">老照片局部竞猜</span>
          </div>
          <div class="mt-4 pt-3 border-t border-violet-50 flex items-center justify-between text-xs font-semibold text-violet-600">
            <span>双机进入温故知新</span>
            <span class="group-hover:translate-x-1 transition-transform">&rarr;</span>
          </div>
        </div>

        <!-- 展区四：双人协同 -->
        <div 
          @click="activeZone = 'zone4'"
          class="glass-card rounded-3xl p-6 border-2 border-emerald-100 hover:border-emerald-300 glow-hover cursor-pointer relative overflow-hidden group"
        >
          <div class="flex items-start justify-between">
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-3xl text-white shadow-md shadow-emerald-200 group-hover:scale-110 transition-transform">
              🎮
            </div>
            <span class="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
              2 款游戏 · 实时联机
            </span>
          </div>
          <div class="mt-4">
            <h3 class="text-lg font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">
              展区四：双人协同
            </h3>
            <p class="text-xs text-slate-500 mt-1 line-clamp-2">
              实时操作与协作竞技：情侣画板你画我猜（笔触实时流式同步）、盲人领航员双视角迷宫配合。
            </p>
          </div>
          <div class="mt-4 flex flex-wrap gap-1.5">
            <span class="text-[11px] bg-white/80 px-2 py-0.5 rounded-md text-slate-600 border border-slate-100">双机实时涂鸦</span>
            <span class="text-[11px] bg-white/80 px-2 py-0.5 rounded-md text-slate-600 border border-slate-100">双视角迷宫</span>
            <span class="text-[11px] bg-white/80 px-2 py-0.5 rounded-md text-slate-600 border border-slate-100">情侣词库抽取</span>
          </div>
          <div class="mt-4 pt-3 border-t border-emerald-50 flex items-center justify-between text-xs font-semibold text-emerald-600">
            <span>双机进入并肩作战</span>
            <span class="group-hover:translate-x-1 transition-transform">&rarr;</span>
          </div>
        </div>

      </div>

      <!-- 视图B：进入具体展区内容 -->
      <div v-else class="transition-all">
        <component 
          :is="currentZoneComponent" 
          @back="activeZone = null"
        />
      </div>

    </main>

    <!-- 底部版权与情侣设置 -->
    <footer class="mt-auto py-6 border-t border-rose-100/60 text-center text-xs text-slate-400">
      <p>情侣默契小站 · 专属于两人的秘密空间 ❤️</p>
      <p class="mt-1 text-[11px] text-slate-400">
        所有角色密码与恋爱树成长已由系统实时归档至数据库
      </p>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, defineAsyncComponent } from 'vue'
import TopNav from './components/顶部导航.vue'
import LoveTreePanel from './components/恋爱树面板.vue'
import AuthModal from './components/登录与角色创建弹窗.vue'
import { authState } from './网络/联机服务.js'

const showTree = ref(true)
const activeZone = ref(null)
const copied = ref(false)

// 局域网访问地址，手机可直接输入
const localWifiUrl = `http://192.168.1.109:5173/`

function copyWifiUrl() {
  navigator.clipboard.writeText(localWifiUrl)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2500)
}

function getZoneOfGame(gameId) {
  if (['heart-sync', 'guess-choice', 'spectrum', 'word-wave'].includes(gameId)) return 'zone1'
  if (['role-switch', 'punish-wheel', 'wish-box'].includes(gameId)) return 'zone2'
  if (['timeline', 'memory-puzzle', 'photo-scope'].includes(gameId)) return 'zone3'
  if (['co-draw', 'blind-nav'].includes(gameId)) return 'zone4'
  return 'zone1'
}

function joinPartnerGame() {
  if (authState.partnerInvitedGame) {
    activeZone.value = getZoneOfGame(authState.partnerInvitedGame.gameId)
    authState.partnerInvitedGame = null
  }
}

const Zone1 = defineAsyncComponent(() => import('./展区/展区一_心有灵犀/index.vue'))
const Zone2 = defineAsyncComponent(() => import('./展区/展区二_换位共情/index.vue'))
const Zone3 = defineAsyncComponent(() => import('./展区/展区三_时光胶囊/index.vue'))
const Zone4 = defineAsyncComponent(() => import('./展区/展区四_双人协同/index.vue'))

const currentZoneComponent = computed(() => {
  switch (activeZone.value) {
    case 'zone1': return Zone1
    case 'zone2': return Zone2
    case 'zone3': return Zone3
    case 'zone4': return Zone4
    default: return null
  }
})

function getZoneTitle(zone) {
  switch (zone) {
    case 'zone1': return '展区一：心有灵犀（双机同步）'
    case 'zone2': return '展区二：换位共情（双端互动）'
    case 'zone3': return '展区三：时光胶囊（记忆沉淀）'
    case 'zone4': return '展区四：双人协同（实时操作）'
    default: return '展区'
  }
}
</script>
