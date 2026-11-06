<template>
  <div class="space-y-6">
    <!-- 视图 1：当没有选择具体游戏时，展示展区二总览卡片 -->
    <div v-if="!activeGameId" class="space-y-6">
      
      <!-- 展区头部横幅 (暖粉橘温情渐变与柔光) -->
      <div class="glass-card rounded-3xl p-6 sm:p-8 border-2 border-rose-200/90 shadow-xl relative overflow-hidden bg-gradient-to-br from-rose-100/50 via-amber-50/60 to-orange-100/50">
        <!-- 装饰性光晕 -->
        <div class="absolute -right-8 -top-8 w-52 h-52 bg-gradient-to-br from-rose-300/40 via-pink-200/30 to-amber-200/40 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -left-8 -bottom-8 w-52 h-52 bg-gradient-to-tr from-amber-200/40 via-orange-200/30 to-rose-200/40 rounded-full blur-3xl pointer-events-none"></div>

        <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div class="flex items-start sm:items-center gap-4">
            <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-400 flex items-center justify-center text-3xl sm:text-4xl text-white shadow-lg shadow-rose-200/80 shrink-0 transform hover:rotate-6 transition-transform">
              💌
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-black text-rose-700 bg-rose-100/80 px-3 py-0.5 rounded-full border border-rose-200">
                  展区二
                </span>
                <span class="text-xs text-slate-500 font-semibold">深度理解 · 换位共情 · 暖心契约</span>
              </div>
              <h2 class="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight mt-1.5">
                换位共情 · 走进TA的内心宇宙
              </h2>
              <p class="text-xs sm:text-sm text-slate-600 mt-1.5 max-w-xl leading-relaxed">
                设身处地读懂TA未曾说出口的脆弱与心声；在物理动效轮盘里升温欢笑，在3D心愿盲盒与礼赠火漆情书中许下专属爱意特权。
              </p>
            </div>
          </div>

          <!-- 展区数据指示牌 -->
          <div class="flex items-center gap-3 bg-white/90 backdrop-blur-md p-3.5 rounded-2xl border border-rose-100 shadow-sm self-stretch md:self-auto justify-around">
            <div class="text-center px-2">
              <div class="text-[11px] text-slate-400 font-medium">情绪共鸣</div>
              <div class="text-xl font-black text-rose-600">
                {{ appState.loveTree.radarScores['情绪共鸣'] || 80 }} <span class="text-xs font-normal">分</span>
              </div>
            </div>
            <div class="w-px h-8 bg-slate-200/60"></div>
            <div class="text-center px-2">
              <div class="text-[11px] text-slate-400 font-medium">展区打卡</div>
              <div class="text-xl font-black text-amber-600">
                {{ zoneTotalPlayed }} <span class="text-xs font-normal">次</span>
              </div>
            </div>
            <div class="w-px h-8 bg-slate-200/60"></div>
            <div class="text-center px-2">
              <div class="text-[11px] text-slate-400 font-medium">可游玩</div>
              <div class="text-xl font-black text-emerald-600">
                3 <span class="text-xs font-normal">款</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 底部返回按钮与提示 -->
        <div class="mt-6 pt-4 border-t border-rose-100 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs gap-2">
          <button 
            @click="$emit('back')"
            class="text-slate-600 hover:text-rose-600 font-bold flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95 py-1"
          >
            <span>&larr;</span>
            <span>返回四大展区总览</span>
          </button>
          <span class="text-rose-700/80 font-medium flex items-center gap-1">
            <span>💡 体验任意游戏即可为恋爱树注入滋养，培育【情绪共鸣】与【协作信任】</span>
          </span>
        </div>
      </div>

      <!-- 三款游戏卡片展示区 (悬浮柔光卡片与加大触控区域) -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
        
        <!-- 游戏 5：假如我是你 -->
        <div 
          @click="activeGameId = 'role-switch'"
          class="glass-card rounded-3xl p-6 sm:p-7 border-2 border-rose-100 hover:border-rose-400 glow-hover cursor-pointer flex flex-col justify-between group relative overflow-hidden transition-all duration-300 bg-gradient-to-b from-white/95 to-rose-50/40 hover:-translate-y-1 shadow-sm hover:shadow-xl active:scale-[0.98]"
        >
          <div class="space-y-4">
            <div class="flex items-start justify-between">
              <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-rose-400 flex items-center justify-center text-3xl text-white shadow-md shadow-rose-200 group-hover:scale-110 transition-transform">
                🎭
              </div>
              <span class="text-xs font-black text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200/80">
                游戏 5
              </span>
            </div>

            <div>
              <div class="flex items-center gap-1.5 text-xs text-rose-600 font-bold mb-1">
                <span>9组深层情境</span>
                <span>•</span>
                <span>换位对账单</span>
              </div>
              <h3 class="text-lg font-black text-slate-800 group-hover:text-rose-600 transition-colors">
                假如我是你
              </h3>
              <p class="text-xs text-slate-500 mt-2 leading-relaxed">
                职场受挫、生理期情绪、送礼踩雷、突降暴雨……站在对方视角猜测第一反应，生成走心对账单，支持一键封存为恋爱树记忆！
              </p>
            </div>

            <!-- 特色亮点标签 -->
            <div class="flex flex-wrap gap-1.5 pt-1">
              <span class="text-[11px] bg-rose-50 text-rose-700 font-medium px-2 py-0.5 rounded-md border border-rose-200/60">💖 恋爱保鲜秘籍</span>
              <span class="text-[11px] bg-emerald-50 text-emerald-700 font-medium px-2 py-0.5 rounded-md border border-emerald-200/60">封存恋爱树记忆</span>
            </div>
          </div>

          <div class="mt-6 pt-4 border-t border-rose-100/70 flex items-center justify-between text-xs font-bold text-rose-600">
            <span>{{ (appState.gameRecords['role-switch'] || 0) > 0 ? `已体验 ${appState.gameRecords['role-switch']} 次 · 再测一次` : '开始换位答题' }}</span>
            <span class="group-hover:translate-x-1.5 transition-transform text-sm">&rarr;</span>
          </div>
        </div>

        <!-- 游戏 6：甜蜜小惩罚 -->
        <div 
          @click="activeGameId = 'punish-wheel'"
          class="glass-card rounded-3xl p-6 sm:p-7 border-2 border-amber-100 hover:border-amber-400 glow-hover cursor-pointer flex flex-col justify-between group relative overflow-hidden transition-all duration-300 bg-gradient-to-b from-white/95 to-amber-50/40 hover:-translate-y-1 shadow-sm hover:shadow-xl active:scale-[0.98]"
        >
          <div class="space-y-4">
            <div class="flex items-start justify-between">
              <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-400 to-amber-300 flex items-center justify-center text-3xl text-white shadow-md shadow-amber-200 group-hover:scale-110 transition-transform">
                🎡
              </div>
              <span class="text-xs font-black text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/80">
                游戏 6
              </span>
            </div>

            <div>
              <div class="flex items-center gap-1.5 text-xs text-amber-600 font-bold mb-1">
                <span>物理阻尼转盘</span>
                <span>•</span>
                <span>拍立得便签</span>
              </div>
              <h3 class="text-lg font-black text-slate-800 group-hover:text-amber-600 transition-colors">
                甜蜜小惩罚
              </h3>
              <p class="text-xs text-slate-500 mt-2 leading-relaxed">
                升级真实物理阻尼与Web Audio动态咔嗒声！新增甜蜜亲密、趣味搞怪等四大分类筛选与拍立得心情打卡相框便签！
              </p>
            </div>

            <!-- 特色亮点标签 -->
            <div class="flex flex-wrap gap-1.5 pt-1">
              <span class="text-[11px] bg-amber-50 text-amber-800 font-medium px-2 py-0.5 rounded-md border border-amber-200/60">🏷️ 4大分类切换</span>
              <span class="text-[11px] bg-pink-50 text-pink-700 font-medium px-2 py-0.5 rounded-md border border-pink-200/60">📷 拍立得足迹相框</span>
            </div>
          </div>

          <div class="mt-6 pt-4 border-t border-amber-100/70 flex items-center justify-between text-xs font-bold text-amber-600">
            <span>{{ (appState.gameRecords['punish-wheel'] || 0) > 0 ? `已体验 ${appState.gameRecords['punish-wheel']} 次 · 再转一次` : '转动幸运轮盘' }}</span>
            <span class="group-hover:translate-x-1.5 transition-transform text-sm">&rarr;</span>
          </div>
        </div>

        <!-- 游戏 7：默契盲盒 -->
        <div 
          @click="activeGameId = 'wish-box'"
          class="glass-card rounded-3xl p-6 sm:p-7 border-2 border-purple-100 hover:border-purple-400 glow-hover cursor-pointer flex flex-col justify-between group relative overflow-hidden transition-all duration-300 bg-gradient-to-b from-white/95 to-purple-50/40 hover:-translate-y-1 shadow-sm hover:shadow-xl active:scale-[0.98]"
        >
          <div class="space-y-4">
            <div class="flex items-start justify-between">
              <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-500 via-pink-400 to-rose-400 flex items-center justify-center text-3xl text-white shadow-md shadow-purple-200 group-hover:scale-110 transition-transform">
                🎁
              </div>
              <span class="text-xs font-black text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200/80">
                游戏 7
              </span>
            </div>

            <div>
              <div class="flex items-center gap-1.5 text-xs text-purple-600 font-bold mb-1">
                <span>3D立体开箱</span>
                <span>•</span>
                <span>心愿礼赠</span>
              </div>
              <h3 class="text-lg font-black text-slate-800 group-hover:text-purple-600 transition-colors">
                默契盲盒
              </h3>
              <p class="text-xs text-slate-500 mt-2 leading-relaxed">
                3D礼盒开箱与光晕特效！支持实体戳盖朱砂印章动效与“心愿礼赠”功能，附上暖心情书将专属特权券赠给对方。
              </p>
            </div>

            <!-- 特色亮点标签 -->
            <div class="flex flex-wrap gap-1.5 pt-1">
              <span class="text-[11px] bg-rose-50 text-rose-700 font-medium px-2 py-0.5 rounded-md border border-rose-200/60">💮 实体红泥戳印</span>
              <span class="text-[11px] bg-purple-50 text-purple-700 font-medium px-2 py-0.5 rounded-md border border-purple-200/60">💌 火漆礼赠情书</span>
            </div>
          </div>

          <div class="mt-6 pt-4 border-t border-purple-100/70 flex items-center justify-between text-xs font-bold text-purple-600">
            <span>{{ (appState.gameRecords['wish-box'] || 0) > 0 ? `已体验 ${appState.gameRecords['wish-box']} 次 · 查看卡包` : '开启3D盲盒' }}</span>
            <span class="group-hover:translate-x-1.5 transition-transform text-sm">&rarr;</span>
          </div>
        </div>

      </div>

    </div>

    <!-- 视图 2：进入具体游戏组件 -->
    <div v-else>
      <RoleSwitchGame 
        v-if="activeGameId === 'role-switch'" 
        @back="activeGameId = null" 
      />

      <PunishWheelGame 
        v-else-if="activeGameId === 'punish-wheel'" 
        @back="activeGameId = null" 
      />

      <WishBoxGame 
        v-else-if="activeGameId === 'wish-box'" 
        @back="activeGameId = null" 
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { appState } from '@/状态/恋爱树状态.js'
import RoleSwitchGame from './假如我是你.vue'
import PunishWheelGame from './甜蜜小惩罚.vue'
import WishBoxGame from './默契盲盒.vue'

defineEmits(['back'])

const activeGameId = ref(null)

const zoneTotalPlayed = computed(() => {
  const g5 = appState.gameRecords['role-switch'] || 0
  const g6 = appState.gameRecords['punish-wheel'] || 0
  const g7 = appState.gameRecords['wish-box'] || 0
  return g5 + g6 + g7
})
</script>
