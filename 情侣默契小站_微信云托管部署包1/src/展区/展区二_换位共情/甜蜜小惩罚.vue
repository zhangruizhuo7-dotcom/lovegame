<template>
  <div class="space-y-6">
    <!-- 顶部导航与操作条 -->
    <div class="flex items-center justify-between bg-white/85 backdrop-blur-md px-4 py-3 rounded-2xl border border-amber-100 shadow-xs">
      <button 
        @click="$emit('back')"
        class="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-full transition-colors active:scale-95 cursor-pointer"
      >
        <span>&larr;</span>
        <span>返回展区目录</span>
      </button>

      <div class="flex items-center gap-2">
        <span class="text-xs font-bold text-amber-800 bg-amber-100/80 px-2.5 py-1 rounded-full border border-amber-300">
          游戏 6 · 互动大转盘
        </span>
        <button
          @click="showManageModal = true"
          class="text-xs text-slate-600 hover:text-amber-700 bg-white px-2.5 py-1 rounded-full border border-slate-200 transition-colors cursor-pointer"
        >
          ⚙️ 惩罚库管理 ({{ allActions.length }})
        </button>
      </div>
    </div>

    <!-- 主交互区域 -->
    <div class="glass-card rounded-3xl p-5 sm:p-8 shadow-xl border border-amber-200/80 relative overflow-hidden bg-gradient-to-br from-white/90 via-amber-50/20 to-rose-50/30">
      <!-- 柔和背景光晕 -->
      <div class="absolute -top-10 -right-10 w-48 h-48 bg-amber-200/30 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-10 -left-10 w-48 h-48 bg-rose-200/30 rounded-full blur-3xl pointer-events-none"></div>

      <!-- 标题介绍 -->
      <div class="text-center max-w-lg mx-auto mb-4 relative z-10">
        <div class="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-xs font-bold mb-2">
          <span>🎡 情侣互动大转盘</span>
        </div>
        <h2 class="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
          甜蜜小惩罚 · 升温大冒险
        </h2>
        <p class="text-xs sm:text-sm text-slate-500 mt-1">
          转动幸运轮盘，接受专属于你们的恋爱小挑战！带沉浸物理阻尼动效、倒计时与拍立得心情便签！
        </p>
      </div>

      <!-- 惩罚类型分类筛选标签 -->
      <div class="flex items-center justify-center gap-1.5 flex-wrap pb-4 relative z-10">
        <button
          v-for="cat in categories"
          :key="cat.key"
          @click="changeCategory(cat.key)"
          :disabled="isSpinning"
          class="px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          :class="currentCategory === cat.key ? 'bg-amber-500 text-white shadow-xs scale-105' : 'bg-white/80 text-slate-600 hover:bg-amber-50 border border-slate-200'"
        >
          <span>{{ cat.icon }}</span>
          <span>{{ cat.label }}</span>
          <span class="text-[10px] opacity-80">({{ getCategoryCount(cat.key) }})</span>
        </button>
      </div>

      <!-- 转盘与抽签核心区 -->
      <div class="flex flex-col lg:flex-row items-center justify-center gap-8 py-2 relative z-10">
        
        <!-- 转盘画布区 -->
        <div class="relative flex items-center justify-center select-none">
          <!-- 外层光环与装饰环 -->
          <div class="w-[310px] h-[310px] sm:w-[380px] sm:h-[380px] rounded-full p-2.5 bg-gradient-to-tr from-amber-400 via-rose-300 to-amber-200 shadow-xl relative flex items-center justify-center">
            
            <!-- Canvas 轮盘 -->
            <canvas 
              ref="wheelCanvas" 
              width="360" 
              height="360" 
              class="w-full h-full rounded-full transition-transform"
              :style="{ transform: `rotate(${currentRotation}deg)` }"
            ></canvas>

            <!-- 中心旋转按钮 -->
            <button
              @click="spinWheel"
              :disabled="isSpinning || activeActions.length === 0"
              class="absolute z-20 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-rose-500 via-pink-500 to-amber-500 text-white font-black text-xs sm:text-sm shadow-xl flex flex-col items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-80 disabled:cursor-not-allowed transition-all border-4 border-white cursor-pointer"
            >
              <span>{{ isSpinning ? '旋转中' : '开始' }}</span>
              <span class="text-[10px] opacity-90">{{ isSpinning ? '...' : '抽挑战' }}</span>
            </button>

            <!-- 顶部指针 (带碰撞弹动特效) -->
            <div 
              class="absolute -top-3.5 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center pointer-events-none drop-shadow-md transition-transform"
              :class="{ 'rotate-[-8deg]': isPinTicking }"
            >
              <div class="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[24px] border-t-rose-600"></div>
              <div class="w-2.5 h-2.5 rounded-full bg-amber-300 -mt-2 shadow-xs"></div>
            </div>
          </div>
        </div>

        <!-- 右侧：当前任务面板 / 快捷展示 -->
        <div class="w-full lg:w-5/12 flex flex-col space-y-4">
          <!-- 默认未抽取时展示提示 -->
          <div v-if="!activeResult && !isSpinning" class="bg-gradient-to-br from-amber-50/80 to-rose-50/80 rounded-2xl p-5 border border-amber-200/80 text-center space-y-3">
            <div class="text-4xl animate-bounce-slow">🎯</div>
            <h3 class="text-base font-bold text-slate-800">
              当前分类：{{ currentCategoryLabel }} ({{ activeActions.length }} 个行动)
            </h3>
            <p class="text-xs text-slate-500 leading-relaxed">
              点击转盘中央的“开始”按钮，由指针挑选今晚的专属浪漫行动。完成后双方打卡并写下心情便签，为恋爱树赚取【协作信任】与丰厚雨露！
            </p>
            <div class="pt-1 flex items-center justify-center gap-2 text-xs text-amber-800 font-semibold">
              <span>💧 水滴 +2</span>
              <span>•</span>
              <span>☀️ 阳光 +4</span>
              <span>•</span>
              <span>🌱 经验 +25</span>
            </div>
          </div>

          <!-- 旋转中的期待状态 -->
          <div v-else-if="isSpinning" class="bg-white/80 rounded-2xl p-6 border border-amber-200 text-center space-y-3 animate-pulse">
            <div class="text-4xl animate-spin">🎡</div>
            <h3 class="text-base font-bold text-amber-800">轮盘飞速旋转中...</h3>
            <p class="text-xs text-slate-400">听，指针正在飞快拨动！放轻松，尽情享受甜蜜惩罚！</p>
          </div>

          <!-- 抽中结果卡片（带沉浸倒计时与打卡相机便签） -->
          <div v-else class="bg-gradient-to-br from-rose-50/90 via-white to-amber-50/90 rounded-2xl p-5 border-2 border-rose-300 shadow-md space-y-4 relative">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-rose-600 bg-rose-100 px-2.5 py-0.5 rounded-full">
                抽中行动卡 · {{ activeResult.categoryText || '甜蜜互动' }}
              </span>
              <span class="text-xs text-slate-400">
                建议时长：{{ activeResult.duration }}秒
              </span>
            </div>

            <div class="flex items-start gap-3">
              <div class="w-12 h-12 rounded-2xl bg-white shadow-xs flex items-center justify-center text-2xl shrink-0 border border-rose-100">
                {{ activeResult.icon }}
              </div>
              <div>
                <h4 class="text-base sm:text-lg font-black text-slate-800">
                  {{ activeResult.title }}
                </h4>
                <p class="text-xs text-slate-600 mt-1 leading-relaxed">
                  {{ activeResult.desc }}
                </p>
              </div>
            </div>

            <!-- 沉浸倒计时器 -->
            <div class="bg-white/90 rounded-xl p-4 border border-rose-100 flex flex-col items-center justify-center">
              <div class="text-3xl font-black font-mono tracking-wider" :class="remainingTime <= 5 && remainingTime > 0 ? 'text-rose-600 animate-ping' : 'text-slate-800'">
                00:{{ remainingTime < 10 ? '0' + remainingTime : remainingTime }}
              </div>
              <p class="text-[11px] text-slate-400 mt-0.5">
                {{ timerRunning ? '计时进行中，全身心沉浸在TA的世界里...' : (remainingTime === 0 ? '🎉 倒计时结束！请双方进行打卡验收！' : '准备好后点击开始计时') }}
              </p>

              <!-- 倒计时控制按钮 -->
              <div class="flex items-center gap-2 mt-3">
                <button
                  @click="toggleTimer"
                  class="px-4 py-1.5 rounded-xl text-xs font-bold text-white transition-all shadow-xs cursor-pointer active:scale-95"
                  :class="timerRunning ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-500 hover:bg-emerald-600'"
                >
                  {{ timerRunning ? '⏸️ 暂停计时' : '▶️ 开始计时' }}
                </button>
                <button
                  @click="resetTimer"
                  class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-medium transition-colors cursor-pointer"
                >
                  🔄 重置
                </button>
              </div>
            </div>

            <!-- 双方打卡确认区 -->
            <div class="border-t border-rose-100 pt-3 space-y-3">
              <div class="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>双人打卡确认验收：</span>
                <span class="text-[11px] text-slate-400">双方均需确认打卡</span>
              </div>

              <div class="grid grid-cols-2 gap-2">
                <button
                  @click="checkinMe = !checkinMe"
                  :disabled="hasRewarded"
                  class="p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                  :class="checkinMe ? 'bg-rose-500 text-white border-rose-600 shadow-xs' : 'bg-white text-slate-600 border-slate-200 hover:border-rose-300'"
                >
                  <span>{{ checkinMe ? '✅' : '⚪' }}</span>
                  <span>{{ appState.names.me }} 完成</span>
                </button>

                <button
                  @click="checkinPartner = !checkinPartner"
                  :disabled="hasRewarded"
                  class="p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                  :class="checkinPartner ? 'bg-amber-500 text-white border-amber-600 shadow-xs' : 'bg-white text-slate-600 border-slate-200 hover:border-amber-300'"
                >
                  <span>{{ checkinPartner ? '✅' : '⚪' }}</span>
                  <span>{{ appState.names.partner }} 验收</span>
                </button>
              </div>

              <!-- 拍立得心情打卡便签输入框 -->
              <div class="bg-rose-50/60 p-3 rounded-xl border border-rose-100 space-y-2">
                <div class="flex items-center justify-between text-xs font-bold text-rose-700">
                  <span class="flex items-center gap-1">📷 拍立得甜蜜心情便签：</span>
                  <span class="text-[10px] text-slate-400 font-normal">留存这一刻的欢笑</span>
                </div>
                <input 
                  v-model="checkinNote"
                  :disabled="hasRewarded"
                  placeholder="写一句打卡心得（例：第5秒你就憋不住笑了、按摩好舒服~）"
                  class="w-full text-xs p-2.5 bg-white border border-rose-200 rounded-xl focus:outline-rose-400 text-slate-700"
                />
              </div>

              <!-- 双方打卡成功领取奖励 -->
              <div v-if="checkinMe && checkinPartner && !hasRewarded" class="pt-1">
                <button
                  @click="completeChallenge"
                  class="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-emerald-200 animate-pulse transition-all cursor-pointer active:scale-95"
                >
                  🎉 双人打卡成功！点击生成拍立得足迹 & 领奖
                </button>
              </div>

              <div v-if="hasRewarded" class="p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold text-center space-y-1">
                <div>✨ 恭喜完成打卡！水滴+2、阳光+4、经验+25 已入账！</div>
                <div class="text-[11px] text-emerald-600 font-normal">拍立得打卡便签已存入下方足迹库</div>
              </div>
            </div>

            <!-- 再转一次 -->
            <div class="pt-1 flex justify-end">
              <button
                @click="resetActive"
                class="text-xs text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
              >
                再转一次大转盘 &rarr;
              </button>
            </div>
          </div>

        </div>

      </div>

      <!-- 底部：拍立得风格甜蜜打卡足迹历史 -->
      <div class="mt-8 pt-6 border-t border-slate-100 relative z-10">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <span>📸 拍立得甜蜜打卡相框足迹</span>
            <span class="text-xs text-slate-400 font-normal">({{ records.length }}条美好瞬间)</span>
          </h3>
          <button 
            v-if="records.length > 0"
            @click="clearRecords"
            class="text-[11px] text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
          >
            清空足迹
          </button>
        </div>

        <div v-if="records.length === 0" class="text-center py-6 text-xs text-slate-400 bg-white/50 rounded-2xl border border-slate-100">
          暂无打卡足迹，快转动转盘完成第一次甜蜜打卡并留下便签吧~
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <!-- 拍立得卡片 -->
          <div 
            v-for="(rec, idx) in records" 
            :key="idx"
            class="bg-white p-3.5 rounded-2xl border border-rose-200/80 shadow-xs flex flex-col justify-between space-y-2 hover:shadow-md transition-shadow relative overflow-hidden"
          >
            <!-- 拍立得照片区域 -->
            <div class="bg-gradient-to-tr from-rose-50 to-amber-50 rounded-xl p-3 flex items-center gap-3 border border-rose-100/60">
              <span class="text-3xl shrink-0">{{ rec.icon }}</span>
              <div class="overflow-hidden">
                <div class="text-xs font-black text-slate-800 truncate">{{ rec.title }}</div>
                <div class="text-[10px] text-slate-400">{{ rec.time }}</div>
              </div>
            </div>

            <!-- 便签文字 -->
            <div class="bg-amber-50/40 p-2 rounded-lg border border-amber-100/60 text-xs text-slate-600 leading-snug">
              <span class="text-amber-700 font-bold text-[10px] block mb-0.5">💬 心情便签：</span>
              <p class="italic text-[11px] text-slate-700 font-serif">“{{ rec.note || '顺利完成甜蜜挑战，今天也是超爱你的一天！' }}”</p>
            </div>

            <!-- 底部印章 -->
            <div class="flex items-center justify-between pt-1 border-t border-slate-50 text-[10px]">
              <span class="text-slate-400">打卡人：{{ appState.names.me }} & {{ appState.names.partner }}</span>
              <span class="text-rose-600 font-bold border border-rose-300 px-1.5 py-0.5 rounded rotate-[-4deg] bg-rose-50/60">
                ❤️ 契约已履
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 弹窗：惩罚库管理 -->
    <div v-if="showManageModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div class="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4 max-h-[85vh] flex flex-col">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 class="text-base font-bold text-slate-800 flex items-center gap-2">
            <span>🎡 转盘惩罚与行动卡库</span>
          </h3>
          <button @click="showManageModal = false" class="text-slate-400 hover:text-slate-600 text-lg cursor-pointer">&times;</button>
        </div>

        <!-- 列表 -->
        <div class="flex-1 overflow-y-auto space-y-2 pr-1 no-scrollbar">
          <div 
            v-for="(item, aIdx) in allActions" 
            :key="aIdx"
            class="p-2.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between gap-2"
          >
            <div class="flex items-center gap-2">
              <span class="text-lg">{{ item.icon }}</span>
              <div>
                <p class="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span>{{ item.title }}</span>
                  <span class="text-[10px] text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded font-normal">{{ item.categoryText || '全部' }}</span>
                </p>
                <p class="text-[10px] text-slate-400">{{ item.duration }}秒 · {{ item.desc }}</p>
              </div>
            </div>
            <button 
              v-if="allActions.length > 4"
              @click="removeAction(aIdx)"
              class="text-xs text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
              title="删除此行动"
            >
              🗑️
            </button>
          </div>
        </div>

        <!-- 添加专属行动 -->
        <div class="border-t border-slate-100 pt-3 space-y-2">
          <div class="text-xs font-bold text-slate-700">新增专属惩罚/大冒险：</div>
          <div class="grid grid-cols-4 gap-2">
            <input 
              v-model="newAction.icon" 
              placeholder="图标" 
              class="col-span-1 text-center p-2 text-xs border rounded-xl"
            />
            <input 
              v-model="newAction.title" 
              placeholder="行动标题 (如: 叫5声小可爱)" 
              class="col-span-3 p-2 text-xs border rounded-xl"
            />
          </div>
          <div class="grid grid-cols-4 gap-2">
            <input 
              v-model.number="newAction.duration" 
              type="number" 
              placeholder="秒数" 
              class="col-span-1 p-2 text-xs border rounded-xl text-center"
            />
            <select 
              v-model="newAction.category" 
              class="col-span-3 p-2 text-xs border rounded-xl bg-white"
            >
              <option value="sweet">💖 甜蜜亲密</option>
              <option value="playful">🤪 趣味搞怪</option>
              <option value="obedient">👑 无条件服从</option>
              <option value="heart">💌 真心话走心</option>
            </select>
          </div>
          <div>
            <input 
              v-model="newAction.desc" 
              placeholder="行动描述与验收规则" 
              class="w-full p-2 text-xs border rounded-xl"
            />
          </div>
          <button 
            @click="addAction"
            class="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            ➕ 添加到惩罚库
          </button>
        </div>

        <div class="pt-1">
          <button 
            @click="showManageModal = false"
            class="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl text-xs cursor-pointer"
          >
            完成并保存
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import confetti from 'canvas-confetti'
import { appState, recordGameReward } from '@/状态/恋爱树状态.js'

defineEmits(['back'])

// 惩罚类型分类
const categories = [
  { key: 'all', label: '全部挑战', icon: '🌟' },
  { key: 'sweet', label: '甜蜜亲密', icon: '💖' },
  { key: 'playful', label: '趣味搞怪', icon: '🤪' },
  { key: 'obedient', label: '无条件服从', icon: '👑' },
  { key: 'heart', label: '真心话走心', icon: '💌' }
]

const currentCategory = ref('all')

// 默认 10 项丰富分类的惩罚行动卡
const defaultActions = [
  // 甜蜜亲密
  { icon: '💖', title: '深情对视30秒', desc: '眼睛一眨不眨看着对方，不许笑出声，笑的人要亲一下对方额头', duration: 30, category: 'sweet', categoryText: '甜蜜亲密', color: '#fecdd3' },
  { icon: '💆', title: '互相捏肩捶背', desc: '温柔地给对方揉捏肩颈和后背，舒缓一整天的疲惫', duration: 60, category: 'sweet', categoryText: '甜蜜亲密', color: '#fde68a' },
  { icon: '🫂', title: '紧紧拥抱45秒', desc: '不说话，两颗心紧贴在一起，闭上双眼静静感受彼此的心跳与温度', duration: 45, category: 'sweet', categoryText: '甜蜜亲密', color: '#fef08a' },
  { icon: '🍓', title: '亲手投喂食物', desc: '亲手剥一颗水果、挑一口零食或喂对方喝一口温热的水', duration: 30, category: 'sweet', categoryText: '甜蜜亲密', color: '#a7f3d0' },

  // 趣味搞怪
  { icon: '📸', title: '鬼脸合影留念', desc: '拿出手机同框，摆出此生最丑最搞怪的鬼脸自拍一张保存', duration: 30, category: 'playful', categoryText: '趣味搞怪', color: '#e9d5ff' },
  { icon: '🗣️', title: '方言夸奖三连', desc: '用家乡方言或最肉麻的夹子音，真心实意夸奖对方3个具体优点', duration: 45, category: 'playful', categoryText: '趣味搞怪', color: '#fed7aa' },
  { icon: '🐱', title: '学猫猫撒娇3声', desc: '手作猫爪状蹭对方手掌，甜甜地喵喵叫三声表达顺从', duration: 30, category: 'playful', categoryText: '趣味搞怪', color: '#bae6fd' },

  // 无条件服从
  { icon: '👑', title: '特权反转免死卡', desc: '恭喜抽中王炸！你可以反向要求对方为你无条件做一件简单的事', duration: 60, category: 'obedient', categoryText: '无条件服从', color: '#fbcfe8' },
  { icon: '🍵', title: '双手奉上温水一杯', desc: '恭恭敬敬半蹲着递上一杯适温的水，并说“请大人慢用”', duration: 30, category: 'obedient', categoryText: '无条件服从', color: '#fef3c7' },

  // 真心话走心
  { icon: '🎵', title: '深情清唱慢歌', desc: '看着对方的眼睛，轻声清唱一段TA最爱听的情歌副歌', duration: 45, category: 'heart', categoryText: '真心话走心', color: '#dcfce7' },
  { icon: '💬', title: '坦白最近心动一刻', desc: '坦白一件过去两周里，对方让你心跳加速或暗自感动的真实小细节', duration: 60, category: 'heart', categoryText: '真心话走心', color: '#ffe4e6' }
]

const STORAGE_ACTIONS_KEY = 'couple_punish_actions_v2'
const STORAGE_RECORDS_KEY = 'couple_punish_records_v2'

function loadActions() {
  try {
    const raw = localStorage.getItem(STORAGE_ACTIONS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch (e) {}
  return defaultActions
}

function loadRecords() {
  try {
    const raw = localStorage.getItem(STORAGE_RECORDS_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) {}
  return []
}

const allActions = ref(loadActions())
const records = ref(loadRecords())

// 当前分类筛选后的行动列表
const activeActions = computed(() => {
  if (currentCategory.value === 'all') return allActions.value
  return allActions.value.filter(a => a.category === currentCategory.value)
})

function getCategoryCount(catKey) {
  if (catKey === 'all') return allActions.value.length
  return allActions.value.filter(a => a.category === catKey).length
}

const currentCategoryLabel = computed(() => {
  const c = categories.find(cat => cat.key === currentCategory.value)
  return c ? c.label : '全部'
})

function changeCategory(key) {
  if (isSpinning.value) return
  currentCategory.value = key
  nextTick(() => {
    drawWheel()
  })
}

const wheelCanvas = ref(null)
const isSpinning = ref(false)
const currentRotation = ref(0)
const isPinTicking = ref(false)
const activeResult = ref(null)

const showManageModal = ref(false)
const newAction = ref({ icon: '🎁', title: '', desc: '', duration: 30, category: 'sweet' })

// 倒计时器状态
const remainingTime = ref(30)
const timerRunning = ref(false)
let timerInterval = null

// 双方打卡状态与拍立得便签
const checkinMe = ref(false)
const checkinPartner = ref(false)
const hasRewarded = ref(false)
const checkinNote = ref('')

function saveActions() {
  try {
    localStorage.setItem(STORAGE_ACTIONS_KEY, JSON.stringify(allActions.value))
  } catch (e) {}
}

function saveRecords() {
  try {
    localStorage.setItem(STORAGE_RECORDS_KEY, JSON.stringify(records.value))
  } catch (e) {}
}

function drawWheel() {
  const canvas = wheelCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const list = activeActions.value
  const numSlices = list.length
  if (numSlices === 0) return

  const arcSize = (2 * Math.PI) / numSlices
  const radius = canvas.width / 2
  const centerX = radius
  const centerY = radius

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  const colors = [
    '#ffe4e6', '#fef3c7', '#ffedd5', '#f3e8ff', 
    '#dcfce7', '#e0f2fe', '#fce7f3', '#fef9c3',
    '#fee2e2', '#e0e7ff'
  ]

  for (let i = 0; i < numSlices; i++) {
    const angle = i * arcSize
    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.arc(centerX, centerY, radius, angle, angle + arcSize)
    ctx.fillStyle = list[i].color || colors[i % colors.length]
    ctx.fill()
    ctx.lineWidth = 2.5
    ctx.strokeStyle = '#ffffff'
    ctx.stroke()

    // 绘制文字与图标
    ctx.save()
    ctx.translate(centerX, centerY)
    ctx.rotate(angle + arcSize / 2)
    ctx.textAlign = 'right'
    ctx.fillStyle = '#334155'
    ctx.font = 'bold 12.5px -apple-system, sans-serif'
    
    // 图标和文字
    const item = list[i]
    ctx.fillText(`${item.icon} ${item.title.substring(0, 7)}`, radius - 18, 5)
    ctx.restore()
  }

  // 绘制中心圆环装饰
  ctx.beginPath()
  ctx.arc(centerX, centerY, 38, 0, 2 * Math.PI)
  ctx.fillStyle = '#ffffff'
  ctx.fill()
  ctx.lineWidth = 3
  ctx.strokeStyle = '#f43f5e'
  ctx.stroke()
}

// Web Audio API 动态合成音效
let audioCtx = null
function getAudioContext() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (AudioContext) {
      audioCtx = new AudioContext()
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

// 模拟转盘咔嗒拨片声
function playTickSound(frequency = 520) {
  try {
    const ctx = getAudioContext()
    if (!ctx) return
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(frequency, ctx.currentTime)
    gain.gain.setValueAtTime(0.04, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.04)
  } catch (e) {}
}

// 停稳获胜欢庆和弦音 (C-E-G-C)
function playWinSound() {
  try {
    const ctx = getAudioContext()
    if (!ctx) return
    const notes = [523.25, 659.25, 783.99, 1046.50]
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08)
      gain.gain.setValueAtTime(0.08, ctx.currentTime + i * 0.08)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.35)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(ctx.currentTime + i * 0.08)
      osc.stop(ctx.currentTime + i * 0.08 + 0.35)
    })
  } catch (e) {}
}

// 双人打卡完成清脆提示音
function playCompleteSound() {
  try {
    const ctx = getAudioContext()
    if (!ctx) return
    const freqs = [659.25, 880.00]
    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(f, ctx.currentTime + i * 0.1)
      gain.gain.setValueAtTime(0.09, ctx.currentTime + i * 0.1)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.4)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(ctx.currentTime + i * 0.1)
      osc.stop(ctx.currentTime + i * 0.1 + 0.4)
    })
  } catch (e) {}
}

// 升级转盘物理缓动算法：真实阻尼 + 加速 + 减速 + 末尾微回弹
function spinWheel() {
  if (isSpinning.value || activeActions.value.length === 0) return
  isSpinning.value = true
  activeResult.value = null
  resetTimer()
  checkinMe.value = false
  checkinPartner.value = false
  hasRewarded.value = false
  checkinNote.value = ''

  const list = activeActions.value
  const numSlices = list.length
  const degreesPerSlice = 360 / numSlices

  // 随机挑选中标索引
  const targetIndex = Math.floor(Math.random() * numSlices)
  
  // 指针位于顶部（270度方向）
  // 目标扇区中心对齐 270 度
  const fullRotations = 6 + Math.floor(Math.random() * 3) // 6到8圈
  const targetAngle = 270 - (targetIndex + 0.5) * degreesPerSlice
  const baseRotation = currentRotation.value % 360
  const totalRotation = currentRotation.value + (fullRotations * 360) + ((targetAngle - baseRotation + 360) % 360)

  // 物理缓动动画
  const startTime = performance.now()
  const duration = 4600 // 4.6秒
  const startRotation = currentRotation.value

  let lastTickSlice = -1

  function customPhysicsEasing(p) {
    // 物理曲线：前20%加速，中间匀速滑行，后50%强阻尼减速并带末端回弹
    if (p < 0.2) {
      // 启动加速阶段 (ease-in)
      return (p / 0.2) * (p / 0.2) * 0.12
    } else if (p < 0.45) {
      // 高速巡航阶段
      const sub = (p - 0.2) / 0.25
      return 0.12 + sub * 0.45
    } else {
      // 长尾阻尼减速阶段与回弹 (ease-out-elastic/damped)
      const sub = (p - 0.45) / 0.55
      const damped = 1 - Math.pow(1 - sub, 3.5)
      return 0.57 + damped * 0.43
    }
  }

  function animate(now) {
    const elapsed = now - startTime
    const progress = Math.min(elapsed / duration, 1)
    
    const ease = customPhysicsEasing(progress)
    const current = startRotation + (totalRotation - startRotation) * ease
    currentRotation.value = current

    // 计算经过的扇区，产生随转速动态调节音调的咔嗒声
    const normalizedAngle = (current % 360 + 360) % 360
    const currentSlice = Math.floor(normalizedAngle / degreesPerSlice)
    if (currentSlice !== lastTickSlice) {
      // 速度越快音调越高，逐渐降低
      const tickFreq = 480 + (1 - progress) * 160
      playTickSound(tickFreq)
      lastTickSlice = currentSlice

      // 拨片弹动动效
      isPinTicking.value = true
      setTimeout(() => {
        isPinTicking.value = false
      }, 50)
    }

    if (progress < 1) {
      requestAnimationFrame(animate)
    } else {
      // 末端轻微阻尼回弹
      currentRotation.value = totalRotation
      isSpinning.value = false
      activeResult.value = list[targetIndex]
      remainingTime.value = activeResult.value.duration || 30
      playWinSound()
      try {
        confetti({
          particleCount: 70,
          spread: 75,
          origin: { y: 0.6 }
        })
      } catch (e) {}
    }
  }

  requestAnimationFrame(animate)
}

function toggleTimer() {
  if (timerRunning.value) {
    clearInterval(timerInterval)
    timerRunning.value = false
  } else {
    if (remainingTime.value <= 0) remainingTime.value = activeResult.value?.duration || 30
    timerRunning.value = true
    timerInterval = setInterval(() => {
      if (remainingTime.value > 0) {
        remainingTime.value--
      } else {
        clearInterval(timerInterval)
        timerRunning.value = false
        playWinSound()
      }
    }, 1000)
  }
}

function resetTimer() {
  clearInterval(timerInterval)
  timerRunning.value = false
  if (activeResult.value) {
    remainingTime.value = activeResult.value.duration || 30
  }
}

function completeChallenge() {
  if (hasRewarded.value) return
  hasRewarded.value = true
  playCompleteSound()

  // 注入成长奖励
  recordGameReward('punish-wheel', {
    water: 2,
    sun: 4,
    exp: 25,
    radarCategory: '协作信任',
    radarDelta: 3
  })

  // 存入拍立得足迹
  const now = new Date()
  const timeStr = `${now.getMonth() + 1}月${now.getDate()}日 ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  records.value.unshift({
    title: activeResult.value.title,
    icon: activeResult.value.icon,
    time: timeStr,
    note: checkinNote.value.trim() || '双方甜蜜打卡，配合满分！'
  })
  saveRecords()

  try {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.5 }
    })
  } catch (e) {}
}

function resetActive() {
  activeResult.value = null
  resetTimer()
}

function clearRecords() {
  if (confirm('确认清空所有历史打卡足迹吗？')) {
    records.value = []
    saveRecords()
  }
}

function addAction() {
  if (!newAction.value.title.trim()) return
  const catObj = categories.find(c => c.key === newAction.value.category) || { label: '自定义', key: 'sweet' }
  allActions.value.push({
    icon: newAction.value.icon || '✨',
    title: newAction.value.title.trim(),
    desc: newAction.value.desc.trim() || '情侣专属约定行动',
    duration: Number(newAction.value.duration) || 30,
    category: newAction.value.category || 'sweet',
    categoryText: catObj.label,
    color: '#ffe4e6'
  })
  newAction.value = { icon: '🎁', title: '', desc: '', duration: 30, category: 'sweet' }
  saveActions()
  nextTick(() => {
    drawWheel()
  })
}

function removeAction(index) {
  allActions.value.splice(index, 1)
  saveActions()
  nextTick(() => {
    drawWheel()
  })
}

onMounted(() => {
  nextTick(() => {
    drawWheel()
  })
})

watch([allActions, currentCategory], () => {
  drawWheel()
}, { deep: true })
</script>
